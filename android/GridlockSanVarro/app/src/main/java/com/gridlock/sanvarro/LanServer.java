package com.gridlock.sanvarro;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Tiny LAN host: serves the game page over HTTP and relays player state over WebSocket. Pure Java, no dependencies. */
public class LanServer {
    public interface PageSource { byte[] page() throws IOException; }

    private static final class Client { int id; Socket sock; OutputStream out; }

    private final PageSource src;
    private final Map<Integer, Client> clients = new ConcurrentHashMap<>();
    private ServerSocket ss;
    private volatile boolean running;
    private int nextId = 1;

    public LanServer(PageSource src) { this.src = src; }

    public synchronized int start(int port) throws IOException {
        if (running) return ss.getLocalPort();
        IOException last = null;
        for (int p = port; p < port + 10; p++) {
            try { ss = new ServerSocket(); ss.setReuseAddress(true); ss.bind(new InetSocketAddress(p)); last = null; break; }
            catch (IOException e) { last = e; }
        }
        if (last != null) throw last;
        running = true;
        Thread t = new Thread(this::acceptLoop, "lan-accept"); t.setDaemon(true); t.start();
        return ss.getLocalPort();
    }

    public synchronized void stop() {
        running = false;
        try { if (ss != null) ss.close(); } catch (IOException ignored) { }
        for (Client c : clients.values()) try { c.sock.close(); } catch (IOException ignored) { }
        clients.clear();
    }

    public boolean isRunning() { return running; }
    public int port() { return ss == null ? 0 : ss.getLocalPort(); }
    public int count() { return clients.size(); }

    public static String localIp() {
        try {
            String fallback = null;
            Enumeration<NetworkInterface> ifs = NetworkInterface.getNetworkInterfaces();
            while (ifs.hasMoreElements()) {
                NetworkInterface ni = ifs.nextElement();
                if (!ni.isUp() || ni.isLoopback()) continue;
                Enumeration<InetAddress> as = ni.getInetAddresses();
                while (as.hasMoreElements()) {
                    InetAddress a = as.nextElement();
                    if (!(a instanceof Inet4Address) || a.isLoopbackAddress()) continue;
                    if (a.isSiteLocalAddress()) return a.getHostAddress();
                    fallback = a.getHostAddress();
                }
            }
            return fallback == null ? "" : fallback;
        } catch (Exception e) { return ""; }
    }

    private void acceptLoop() {
        while (running) {
            try {
                final Socket s = ss.accept();
                Thread t = new Thread(() -> handle(s), "lan-client"); t.setDaemon(true); t.start();
            } catch (IOException e) { if (!running) return; }
        }
    }

    private static String readLine(InputStream in) throws IOException {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        int c;
        while ((c = in.read()) != -1) { if (c == '\n') break; if (c != '\r') b.write(c); if (b.size() > 8192) throw new IOException("line too long"); }
        if (c == -1 && b.size() == 0) return null;
        return new String(b.toByteArray(), StandardCharsets.UTF_8);
    }

    private void handle(Socket s) {
        Client me = null;
        try {
            s.setTcpNoDelay(true);
            InputStream in = new BufferedInputStream(s.getInputStream());
            OutputStream out = s.getOutputStream();
            String first = readLine(in);
            if (first == null) { s.close(); return; }
            Map<String, String> h = new HashMap<>();
            String line;
            while ((line = readLine(in)) != null && line.length() > 0) {
                int i = line.indexOf(':');
                if (i > 0) h.put(line.substring(0, i).trim().toLowerCase(), line.substring(i + 1).trim());
            }
            String key = h.get("sec-websocket-key");
            if (key == null) { servePage(first, out); s.close(); return; }
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            String accept = b64(md.digest((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").getBytes(StandardCharsets.US_ASCII)));
            out.write(("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + accept + "\r\n\r\n").getBytes(StandardCharsets.US_ASCII));
            out.flush();
            me = new Client(); me.sock = s; me.out = out;
            synchronized (this) { me.id = nextId++; }
            clients.put(me.id, me);
            send(me, "{\"t\":\"hi\",\"id\":" + me.id + "}");
            while (running) {
                int b0 = in.read(), b1 = in.read();
                if (b0 < 0 || b1 < 0) break;
                int op = b0 & 15; long len = b1 & 127;
                if (len == 126) len = ((long) in.read() << 8) | in.read();
                else if (len == 127) { len = 0; for (int i = 0; i < 8; i++) len = (len << 8) | in.read(); }
                if (len < 0 || len > 65536) break;
                byte[] mask = new byte[4];
                if ((b1 & 128) != 0) readFully(in, mask);
                byte[] data = new byte[(int) len];
                readFully(in, data);
                if ((b1 & 128) != 0) for (int i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
                if (op == 8) break;
                if (op == 9) { frame(me, data, 10); continue; }
                if (op != 1 || data.length == 0 || data[0] != '{') continue;
                String msg = "{\"f\":" + me.id + ",\"m\":" + new String(data, StandardCharsets.UTF_8) + "}";
                for (Client c : clients.values()) if (c != me) send(c, msg);
            }
        } catch (Exception ignored) {
        } finally {
            if (me != null) {
                clients.remove(me.id);
                String bye = "{\"f\":" + me.id + ",\"x\":1}";
                for (Client c : clients.values()) send(c, bye);
            }
            try { s.close(); } catch (IOException ignored) { }
        }
    }

    private void servePage(String first, OutputStream out) throws IOException {
        String[] parts = first.split(" ");
        String path = parts.length > 1 ? parts[1] : "/";
        byte[] body; String status = "200 OK";
        if (path.equals("/") || path.startsWith("/index.html") || path.startsWith("/?")) body = src.page();
        else { status = "404 Not Found"; body = "Not found".getBytes(StandardCharsets.UTF_8); }
        out.write(("HTTP/1.1 " + status + "\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: " + body.length + "\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n").getBytes(StandardCharsets.US_ASCII));
        out.write(body); out.flush();
    }

    private static void readFully(InputStream in, byte[] b) throws IOException {
        int off = 0;
        while (off < b.length) { int n = in.read(b, off, b.length - off); if (n < 0) throw new IOException("eof"); off += n; }
    }

    private void send(Client c, String text) { frame(c, text.getBytes(StandardCharsets.UTF_8), 1); }

    private void frame(Client c, byte[] p, int op) {
        try {
            synchronized (c) {
                ByteArrayOutputStream o = new ByteArrayOutputStream(p.length + 10);
                o.write(0x80 | op);
                if (p.length < 126) o.write(p.length);
                else if (p.length < 65536) { o.write(126); o.write(p.length >> 8); o.write(p.length & 255); }
                else { o.write(127); for (int i = 7; i >= 0; i--) o.write((int) (((long) p.length >> (8 * i)) & 255)); }
                o.write(p, 0, p.length);
                c.out.write(o.toByteArray()); c.out.flush();
            }
        } catch (IOException e) { try { c.sock.close(); } catch (IOException ignored) { } }
    }

    private static String b64(byte[] d) {
        final String A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < d.length; i += 3) {
            int b = (d[i] & 255) << 16 | (i + 1 < d.length ? (d[i + 1] & 255) << 8 : 0) | (i + 2 < d.length ? d[i + 2] & 255 : 0);
            sb.append(A.charAt(b >> 18 & 63)).append(A.charAt(b >> 12 & 63)).append(i + 1 < d.length ? A.charAt(b >> 6 & 63) : '=').append(i + 2 < d.length ? A.charAt(b & 63) : '=');
        }
        return sb.toString();
    }
}
