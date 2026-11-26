#!/usr/bin/env python3
"""Build a signed Android APK for Gridlock without the Android SDK.

Writes every part by hand: a Dalvik classes.dex holding a tiny WebView
activity, a binary AndroidManifest.xml, a one-entry resources.arsc for the
launcher icon, the zip itself (with 4-byte alignment for resources.arsc),
and an APK Signature Scheme v2 block (RSA 2048 / SHA-256).

usage: build_apk.py <index.html> <icon.png> <out.apk> <keydir> <versionCode> <versionName>
"""
import hashlib, os, struct, sys, zipfile, zlib, io, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding

PKG = 'com.gridlock.sanvarro'
ACT = PKG + '.MainActivity'
LABEL = 'Gridlock: San Varro'
u8 = lambda v: struct.pack('<B', v); u16 = lambda v: struct.pack('<H', v); u32 = lambda v: struct.pack('<I', v & 0xffffffff); u64 = lambda v: struct.pack('<Q', v)

def uleb(v):
    out = bytearray()
    while True:
        b = v & 0x7f; v >>= 7
        if v: out.append(b | 0x80)
        else: out.append(b); return bytes(out)

def pad4(b): return b + b'\0' * (-len(b) % 4)

# ============================================================ DEX
# Two classes. MainActivity: a full-screen WebView showing the game. Lan: a tiny socket bridge, exposed to the
# game as window.AndroidNet, that lets a phone host a LAN game and find others (TCP server + UDP broadcast).
# The game's JavaScript does the protocol work; the bridge only moves bytes. The bridge is attached inside a
# catch-all, so if it ever fails to load on some phone the game still starts exactly as before.
from dexgen import Dex, Code, check_dex
def build_dex(js_back):
    D = Dex()
    CLS = 'L' + ACT.replace('.', '/') + ';'; LAN = 'Lcom/gridlock/sanvarro/Lan;'
    ACTV, WV, WS, WIN, VIEW, BUN, CTX, STR, OBJ = 'Landroid/app/Activity;', 'Landroid/webkit/WebView;', 'Landroid/webkit/WebSettings;', 'Landroid/view/Window;', 'Landroid/view/View;', 'Landroid/os/Bundle;', 'Landroid/content/Context;', 'Ljava/lang/String;', 'Ljava/lang/Object;'
    SSC, SC, SELC, SS, SOCK, ISA, SA, BB, BUF, AL = 'Ljava/nio/channels/ServerSocketChannel;', 'Ljava/nio/channels/SocketChannel;', 'Ljava/nio/channels/SelectableChannel;', 'Ljava/net/ServerSocket;', 'Ljava/net/Socket;', 'Ljava/net/InetSocketAddress;', 'Ljava/net/SocketAddress;', 'Ljava/nio/ByteBuffer;', 'Ljava/nio/Buffer;', 'Ljava/util/ArrayList;'
    DC, DS, IA, SB, WM, ML, WI, JSI = 'Ljava/nio/channels/DatagramChannel;', 'Ljava/net/DatagramSocket;', 'Ljava/net/InetAddress;', 'Ljava/lang/StringBuilder;', 'Landroid/net/wifi/WifiManager;', 'Landroid/net/wifi/WifiManager$MulticastLock;', 'Landroid/net/wifi/WifiInfo;', 'Landroid/webkit/JavascriptInterface;'
    URL = 'file:///android_asset/index.html'
    m = lambda c, n, r, *ps: (c, n, r, tuple(ps))
    # ---------------- MainActivity (same behaviour as before, plus the bridge)
    A = D.cls(CLS, ACTV); D.field(A, 'w', WV); fW = (CLS, 'w', WV)
    c = Code(1, 1, 1); c.idir(m(ACTV, '<init>', 'V'), 0); c.ret_void(); D.method(A, '<init>', 'V', (), 0x10001, c, direct=True)
    # onCreate: v0 webview, v1 v2 scratch, v3 this, v4 bundle
    c = Code(5, 2, 3)
    c.isup(m(ACTV, 'onCreate', 'V', BUN), 3, 4); c.iv(m(ACTV, 'getWindow', WIN), 3); c.mreso(0); c.const16(1, 0x480); c.iv(m(WIN, 'addFlags', 'V', 'I'), 0, 1)
    c.newi(0, WV); c.idir(m(WV, '<init>', 'V', CTX), 0, 3); c.iput_o(0, 3, fW); c.iv(m(WV, 'getSettings', WS), 0); c.mreso(1)
    c.const4(2, 1); c.iv(m(WS, 'setJavaScriptEnabled', 'V', 'Z'), 1, 2); c.iv(m(WS, 'setDomStorageEnabled', 'V', 'Z'), 1, 2); c.const4(2, 0); c.iv(m(WS, 'setMediaPlaybackRequiresUserGesture', 'V', 'Z'), 1, 2)
    c.label('t0'); c.newi(1, LAN); c.idir(m(LAN, '<init>', 'V', CTX), 1, 3); c.cstr(2, 'AndroidNet'); c.iv(m(WV, 'addJavascriptInterface', 'V', OBJ, STR), 0, 1, 2); c.label('t1')
    c.label('after'); c.iv(m(ACTV, 'setContentView', 'V', VIEW), 3, 0); c.cstr(1, URL); c.iv(m(WV, 'loadUrl', 'V', STR), 0, 1); c.ret_void()
    c.label('h'); c.goto('after'); c.try_('t0', 't1', 'h')
    D.method(A, 'onCreate', 'V', (BUN,), 0x4, c)
    c = Code(2, 1, 1); c.iget_o(0, 1, fW); c.ifeqz(0, 'x'); c.iv(m(WV, 'onPause', 'V'), 0); c.label('x'); c.isup(m(ACTV, 'onPause', 'V'), 1); c.ret_void(); D.method(A, 'onPause', 'V', (), 0x4, c)
    c = Code(3, 1, 2); c.isup(m(ACTV, 'onResume', 'V'), 2); c.iget_o(0, 2, fW); c.ifeqz(0, 'x'); c.iv(m(WV, 'onResume', 'V'), 0); c.label('x')
    c.iv(m(ACTV, 'getWindow', WIN), 2); c.mreso(0); c.iv(m(WIN, 'getDecorView', VIEW), 0); c.mreso(0); c.const16(1, 0x1706); c.iv(m(VIEW, 'setSystemUiVisibility', 'V', 'I'), 0, 1); c.ret_void()
    D.method(A, 'onResume', 'V', (), 0x4, c)
    c = Code(3, 1, 2); c.iget_o(0, 2, fW); c.ifeqz(0, 'x'); c.cstr(1, js_back); c.iv(m(WV, 'loadUrl', 'V', STR), 0, 1); c.ret_void(); c.label('x'); c.isup(m(ACTV, 'onBackPressed', 'V'), 2); c.ret_void()
    D.method(A, 'onBackPressed', 'V', (), 0x1, c)
    # ---------------- Lan bridge
    L = D.cls(LAN, OBJ)
    F = {k: (LAN, k, t) for k, t in [('ctx', CTX), ('srv', SSC), ('cons', AL), ('udp', DC), ('buf', BB), ('lock', ML)]}
    for k, (_, n, t) in F.items(): D.field(L, n, t)
    PUB = 0x1
    def api(name, ret, params, code): D.method(L, name, ret, params, PUB, code, annot=JSI)
    getcon = lambda c, dst, this, idr: (c.iget_o(dst, this, F['cons']), c.iv(m(AL, 'get', OBJ, 'I'), dst, idr), c.mreso(dst))
    # <init>(Context): v0 tmp, v1 this, v2 ctx
    c = Code(3, 2, 1); c.idir(m(OBJ, '<init>', 'V'), 1); c.iput_o(2, 1, F['ctx']); c.newi(0, AL); c.idir(m(AL, '<init>', 'V'), 0); c.iput_o(0, 1, F['cons'])
    c.consthigh16(0, 1); c.ist(m(BB, 'allocate', BB, 'I'), 0); c.mreso(0); c.iput_o(0, 1, F['buf']); c.ret_void()
    D.method(L, '<init>', 'V', (CTX,), 0x10001, c, direct=True)
    # int listen(int port): v0-v2 tmp, v3 this, v4 port
    c = Code(5, 2, 2); c.label('a')
    c.ist(m(SSC, 'open', SSC)); c.mreso(0); c.const4(1, 0); c.iv(m(SSC, 'configureBlocking', SELC, 'Z'), 0, 1)
    c.iv(m(SSC, 'socket', SS), 0); c.mreso(1); c.const4(2, 1); c.iv(m(SS, 'setReuseAddress', 'V', 'Z'), 1, 2)
    c.newi(2, ISA); c.idir(m(ISA, '<init>', 'V', 'I'), 2, 4); c.iv(m(SS, 'bind', 'V', SA), 1, 2); c.iput_o(0, 3, F['srv']); c.const4(0, 1); c.ret(0)
    c.label('b'); c.label('h'); c.const4(0, 0); c.ret(0); c.try_('a', 'b', 'h'); api('listen', 'I', ('I',), c)
    # int accept(): -1 = nobody waiting
    c = Code(5, 1, 2); c.label('a')
    c.iget_o(0, 4, F['srv']); c.ifeqz(0, 'none'); c.iv(m(SSC, 'accept', SC), 0); c.mreso(0); c.ifeqz(0, 'none')
    c.const4(1, 0); c.iv(m(SC, 'configureBlocking', SELC, 'Z'), 0, 1); c.iv(m(SC, 'socket', SOCK), 0); c.mreso(1); c.const4(2, 1); c.iv(m(SOCK, 'setTcpNoDelay', 'V', 'Z'), 1, 2)
    c.iget_o(1, 4, F['cons']); c.iv(m(AL, 'add', 'Z', OBJ), 1, 0); c.iv(m(AL, 'size', 'I'), 1); c.mres(0); c.addlit8(0, 0, -1); c.ret(0)
    c.label('none'); c.const4(0, -1); c.ret(0); c.label('b'); c.label('h'); c.const4(0, -1); c.ret(0); c.try_('a', 'b', 'h'); api('accept', 'I', (), c)
    # String read(int id): null = closed, "" = nothing yet, else bytes as ISO-8859-1 chars. v0-v4 tmp, v5 this, v6 id
    c = Code(7, 2, 5); c.label('a')
    getcon(c, 0, 5, 6); c.ifeqz(0, 'closed'); c.cast(0, SC); c.iget_o(1, 5, F['buf']); c.iv(m(BUF, 'clear', BUF), 1)
    c.iv(m(SC, 'read', 'I', BB), 0, 1); c.mres(2); c.ifltz(2, 'closed'); c.ifnez(2, 'got'); c.cstr(0, ''); c.reto(0)
    c.label('got'); c.iv(m(BB, 'array', '[B'), 1); c.mreso(1); c.newi(0, STR); c.const4(3, 0); c.cstr(4, 'ISO-8859-1'); c.idir(m(STR, '<init>', 'V', '[B', 'I', 'I', STR), 0, 1, 3, 2, 4); c.reto(0)
    c.label('closed'); c.const4(0, 0); c.reto(0); c.label('b'); c.label('h'); c.const4(0, 0); c.reto(0); c.try_('a', 'b', 'h'); api('read', STR, ('I',), c)
    # int write(int id, String bytes): v0-v4 tmp, v5 this, v6 id, v7 data
    c = Code(8, 3, 2); c.label('a')
    getcon(c, 0, 5, 6); c.ifeqz(0, 'fail'); c.cast(0, SC); c.cstr(1, 'ISO-8859-1'); c.iv(m(STR, 'getBytes', '[B', STR), 7, 1); c.mreso(1); c.ist(m(BB, 'wrap', BB, '[B'), 1); c.mreso(1)
    c.const16(2, 4000); c.label('loop'); c.iv(m(BUF, 'hasRemaining', 'Z'), 1); c.mres(3); c.ifeqz(3, 'ok'); c.iv(m(SC, 'write', 'I', BB), 0, 1); c.addlit8(2, 2, -1); c.ifgtz(2, 'loop')
    c.label('fail'); c.const4(0, 0); c.ret(0); c.label('ok'); c.const4(0, 1); c.ret(0); c.label('b'); c.label('h'); c.const4(0, 0); c.ret(0); c.try_('a', 'b', 'h'); api('write', 'I', ('I', STR), c)
    # void close(int id): v0 cons, v1 conn, v2 null, v3 this, v4 id
    c = Code(5, 2, 3); c.label('a')
    c.iget_o(0, 3, F['cons']); c.iv(m(AL, 'get', OBJ, 'I'), 0, 4); c.mreso(1); c.ifeqz(1, 'end'); c.const4(2, 0); c.iv(m(AL, 'set', OBJ, 'I', OBJ), 0, 4, 2)
    c.cast(1, SC); c.iv(m(SC, 'close', 'V'), 1); c.label('end'); c.ret_void(); c.label('b'); c.label('h'); c.ret_void(); c.try_('a', 'b', 'h'); api('close', 'V', ('I',), c)
    # void stop(): close the listening socket
    c = Code(3, 1, 1); c.iget_o(0, 2, F['srv']); c.const4(1, 0); c.iput_o(1, 2, F['srv']); c.ifeqz(0, 'end'); c.label('a'); c.iv(m(SSC, 'close', 'V'), 0); c.label('b')
    c.label('end'); c.ret_void(); c.label('h'); c.ret_void(); c.try_('a', 'b', 'h'); api('stop', 'V', (), c)
    # int udpOpen(int port): v0-v3 tmp, v4 this, v5 port. Takes a Wi-Fi multicast lock first (best effort).
    c = Code(6, 2, 3); c.label('a')
    c.iget_o(0, 4, F['ctx']); c.iv(m(CTX, 'getApplicationContext', CTX), 0); c.mreso(0); c.cstr(1, 'wifi'); c.iv(m(CTX, 'getSystemService', OBJ, STR), 0, 1); c.mreso(0); c.cast(0, WM)
    c.cstr(1, 'gridlock'); c.iv(m(WM, 'createMulticastLock', ML, STR), 0, 1); c.mreso(0); c.const4(1, 0); c.iv(m(ML, 'setReferenceCounted', 'V', 'Z'), 0, 1); c.iv(m(ML, 'acquire', 'V'), 0); c.iput_o(0, 4, F['lock'])
    c.label('b'); c.label('c')
    c.ist(m(DC, 'open', DC)); c.mreso(0); c.iv(m(DC, 'socket', DS), 0); c.mreso(1); c.const4(2, 1); c.iv(m(DS, 'setReuseAddress', 'V', 'Z'), 1, 2); c.iv(m(DS, 'setBroadcast', 'V', 'Z'), 1, 2)
    c.newi(2, ISA); c.idir(m(ISA, '<init>', 'V', 'I'), 2, 5); c.iv(m(DS, 'bind', 'V', SA), 1, 2); c.const4(2, 0); c.iv(m(DC, 'configureBlocking', SELC, 'Z'), 0, 2); c.iput_o(0, 4, F['udp']); c.const4(0, 1); c.ret(0)
    c.label('d'); c.label('h'); c.const4(0, 0); c.ret(0); c.try_('a', 'b', 'c'); c.try_('c', 'd', 'h'); api('udpOpen', 'I', ('I',), c)
    # int udpSend(String host, int port, String msg): v0-v2 tmp, v3 this, v4 host, v5 port, v6 msg
    c = Code(7, 4, 3); c.label('a')
    c.iget_o(0, 3, F['udp']); c.ifeqz(0, 'fail'); c.cstr(1, 'UTF-8'); c.iv(m(STR, 'getBytes', '[B', STR), 6, 1); c.mreso(1); c.ist(m(BB, 'wrap', BB, '[B'), 1); c.mreso(1)
    c.newi(2, ISA); c.idir(m(ISA, '<init>', 'V', STR, 'I'), 2, 4, 5); c.iv(m(DC, 'send', 'I', BB, SA), 0, 1, 2); c.const4(0, 1); c.ret(0)
    c.label('fail'); c.const4(0, 0); c.ret(0); c.label('b'); c.label('h'); c.const4(0, 0); c.ret(0); c.try_('a', 'b', 'h'); api('udpSend', 'I', (STR, 'I', STR), c)
    # String udpRecv(): "" = nothing, else "senderIp|message". v0-v5 tmp, v6 this
    c = Code(7, 1, 5); c.label('a')
    c.iget_o(0, 6, F['udp']); c.ifeqz(0, 'empty'); c.iget_o(1, 6, F['buf']); c.iv(m(BUF, 'clear', BUF), 1); c.iv(m(DC, 'receive', SA, BB), 0, 1); c.mreso(0); c.ifeqz(0, 'empty')
    c.cast(0, ISA); c.iv(m(ISA, 'getAddress', IA), 0); c.mreso(0); c.iv(m(IA, 'getHostAddress', STR), 0); c.mreso(0)
    c.iv(m(BUF, 'position', 'I'), 1); c.mres(2); c.iv(m(BB, 'array', '[B'), 1); c.mreso(1); c.newi(3, STR); c.const4(4, 0); c.cstr(5, 'UTF-8'); c.idir(m(STR, '<init>', 'V', '[B', 'I', 'I', STR), 3, 1, 4, 2, 5)
    c.newi(1, SB); c.idir(m(SB, '<init>', 'V'), 1); c.iv(m(SB, 'append', SB, STR), 1, 0); c.cstr(2, '|'); c.iv(m(SB, 'append', SB, STR), 1, 2); c.iv(m(SB, 'append', SB, STR), 1, 3)
    c.iv(m(SB, 'toString', STR), 1); c.mreso(0); c.reto(0)
    c.label('empty'); c.cstr(0, ''); c.reto(0); c.label('b'); c.label('h'); c.cstr(0, ''); c.reto(0); c.try_('a', 'b', 'h'); api('udpRecv', STR, (), c)
    # void udpClose(): v0 v1 tmp, v2 this
    c = Code(3, 1, 1)
    c.iget_o(0, 2, F['udp']); c.const4(1, 0); c.iput_o(1, 2, F['udp']); c.ifeqz(0, 'B'); c.label('a'); c.iv(m(DC, 'close', 'V'), 0); c.label('a2')
    c.label('B'); c.iget_o(0, 2, F['lock']); c.const4(1, 0); c.iput_o(1, 2, F['lock']); c.ifeqz(0, 'end'); c.label('c'); c.iv(m(ML, 'release', 'V'), 0); c.label('c2')
    c.label('end'); c.ret_void(); c.try_('a', 'a2', 'B'); c.try_('c', 'c2', 'end'); api('udpClose', 'V', (), c)
    # int wifiIp(): this phone's Wi-Fi address as an int (0 when hosting a hotspot or unknown)
    c = Code(3, 1, 2); c.label('a')
    c.iget_o(0, 2, F['ctx']); c.iv(m(CTX, 'getApplicationContext', CTX), 0); c.mreso(0); c.cstr(1, 'wifi'); c.iv(m(CTX, 'getSystemService', OBJ, STR), 0, 1); c.mreso(0); c.cast(0, WM)
    c.iv(m(WM, 'getConnectionInfo', WI), 0); c.mreso(0); c.ifeqz(0, 'zero'); c.iv(m(WI, 'getIpAddress', 'I'), 0); c.mres(0); c.ret(0)
    c.label('zero'); c.const4(0, 0); c.ret(0); c.label('b'); c.label('h'); c.const4(0, 0); c.ret(0); c.try_('a', 'b', 'h'); api('wifiIp', 'I', (), c)
    dex = D.build()
    errs, report, ann = check_dex(dex)
    if errs: raise SystemExit('DEX CHECK FAILED:\n  ' + '\n  '.join(errs))
    return dex, dict(report=report, annotation=ann)

# ============================================================ string pool (UTF-16)
def string_pool(strs):
    offs, body = [], bytearray()
    for s in strs:
        offs.append(len(body)); e = s.encode('utf-16-le'); body += u16(len(s)) + e + b'\0\0'
    hsz = 28; start = hsz + 4 * len(strs)
    chunk = b''.join(u32(o) for o in offs) + body
    chunk = pad4(chunk)
    return u16(0x0001) + u16(hsz) + u32(hsz + len(chunk)) + u32(len(strs)) + u32(0) + u32(0) + u32(start) + u32(0) + chunk

# ============================================================ binary manifest
ATTR = {'theme': 0x01010000, 'label': 0x01010001, 'icon': 0x01010002, 'name': 0x01010003, 'exported': 0x01010010, 'launchMode': 0x0101001d, 'screenOrientation': 0x0101001e,
        'configChanges': 0x0101001f, 'minSdkVersion': 0x0101020c, 'versionCode': 0x0101021b, 'versionName': 0x0101021c, 'targetSdkVersion': 0x01010270, 'usesCleartextTraffic': 0x010104ec}
NS = 'http://schemas.android.com/apk/res/android'
STR_T, REF_T, INT_T, HEX_T, BOOL_T = 0x03, 0x01, 0x10, 0x11, 0x12

def build_manifest(vcode, vname):
    # tree: (tag, [(android?, name, type, value)], children)
    A = lambda n, t, v: (True, n, t, v)
    tree = ('manifest', [A('versionCode', INT_T, vcode), A('versionName', STR_T, vname), (False, 'package', STR_T, PKG)], [
        ('uses-sdk', [A('minSdkVersion', INT_T, 24), A('targetSdkVersion', INT_T, 34)], []),
        ('uses-permission', [A('name', STR_T, 'android.permission.INTERNET')], []),
        ('uses-permission', [A('name', STR_T, 'android.permission.ACCESS_NETWORK_STATE')], []),
        ('uses-permission', [A('name', STR_T, 'android.permission.ACCESS_WIFI_STATE')], []),
        ('uses-permission', [A('name', STR_T, 'android.permission.CHANGE_WIFI_MULTICAST_STATE')], []),
        ('application', [A('theme', REF_T, 0x0103000a), A('label', STR_T, LABEL), A('icon', REF_T, 0x7f010000), A('usesCleartextTraffic', BOOL_T, True)], [
            ('activity', [A('name', STR_T, ACT), A('exported', BOOL_T, True), A('launchMode', INT_T, 1), A('screenOrientation', INT_T, 13), A('configChanges', HEX_T, 0xff0)], [
                ('intent-filter', [], [
                    ('action', [A('name', STR_T, 'android.intent.action.MAIN')], []),
                    ('category', [A('name', STR_T, 'android.intent.category.LAUNCHER')], [])])])])])
    used_attrs, others = [], []
    def walk(n):
        tag, attrs, kids = n
        others.append(tag)
        for a in attrs:
            if a[0]: used_attrs.append(a[1])
            else: others.append(a[1])
            if a[2] == STR_T: others.append(a[3])
        for k in kids: walk(k)
    walk(tree)
    attr_names = sorted(set(used_attrs), key=lambda n: ATTR[n])
    pool = attr_names + [s for s in dict.fromkeys(['android', NS] + others) if s not in attr_names]
    SI = {s: i for i, s in enumerate(pool)}
    out = bytearray()
    out += string_pool(pool)
    out += u16(0x0180) + u16(8) + u32(8 + 4 * len(attr_names)) + b''.join(u32(ATTR[n]) for n in attr_names)
    out += u16(0x0100) + u16(16) + u32(24) + u32(1) + u32(0xffffffff) + u32(SI['android']) + u32(SI[NS])
    def emit(n):
        tag, attrs, kids = n
        attrs = sorted(attrs, key=lambda a: ATTR[a[1]] if a[0] else 0x7fffffff)
        body = bytearray()
        for isns, name, t, v in attrs:
            raw = SI[v] if t == STR_T else 0xffffffff
            data = SI[v] if t == STR_T else (0xffffffff if (t == BOOL_T and v) else (0 if t == BOOL_T else v))
            body += u32(SI[NS] if isns else 0xffffffff) + u32(SI[name]) + u32(raw) + u16(8) + u8(0) + u8(t) + u32(data)
        out.extend(u16(0x0102) + u16(16) + u32(36 + len(body)) + u32(1) + u32(0xffffffff) + u32(0xffffffff) + u32(SI[tag]) + u16(0x14) + u16(0x14) + u16(len(attrs)) + u16(0) + u16(0) + u16(0) + body)
        for k in kids: emit(k)
        out.extend(u16(0x0103) + u16(16) + u32(24) + u32(1) + u32(0xffffffff) + u32(0xffffffff) + u32(SI[tag]))
    emit(tree)
    out += u16(0x0101) + u16(16) + u32(24) + u32(1) + u32(0xffffffff) + u32(SI['android']) + u32(SI[NS])
    return u16(0x0003) + u16(8) + u32(8 + len(out)) + bytes(out), pool

# ============================================================ resources.arsc (one drawable: the icon)
ICON_PATH = 'res/drawable-nodpi-v4/icon.png'
def build_arsc():
    gpool = string_pool([ICON_PATH]); tpool = string_pool(['drawable']); kpool = string_pool(['icon'])
    spec = u16(0x0202) + u16(16) + u32(16 + 4) + u8(1) + u8(0) + u16(1) + u32(1) + u32(0)
    config = bytearray(64); config[0:4] = u32(64); config[14:16] = u16(0xffff)  # density = nodpi
    hsz = 8 + 1 + 1 + 2 + 4 + 4 + 64
    entry = u16(8) + u16(0) + u32(0) + u16(8) + u8(0) + u8(STR_T) + u32(0)
    typ = u16(0x0201) + u16(hsz) + u32(hsz + 4 + len(entry)) + u8(1) + u8(0) + u16(0) + u32(1) + u32(hsz + 4) + bytes(config) + u32(0) + entry
    name = PKG.encode('utf-16-le'); name = name + b'\0' * (256 - len(name))
    ph = 288
    pkg_body = tpool + kpool + spec + typ
    pkg = u16(0x0200) + u16(ph) + u32(ph + len(pkg_body)) + u32(0x7f) + name + u32(ph) + u32(1) + u32(ph + len(tpool)) + u32(1) + u32(0) + pkg_body
    return u16(0x0002) + u16(12) + u32(12 + len(gpool) + len(pkg)) + u32(1) + gpool + pkg

# ============================================================ key
def load_key(keydir):
    os.makedirs(keydir, exist_ok=True); kp, cp = os.path.join(keydir, 'gridlock-key.pem'), os.path.join(keydir, 'gridlock-cert.pem')
    if not os.path.exists(kp):
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        nm = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'Gridlock San Varro'), x509.NameAttribute(NameOID.ORGANIZATION_NAME, 'Gridlock')])
        now = datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc)
        cert = x509.CertificateBuilder().subject_name(nm).issuer_name(nm).public_key(key.public_key()).serial_number(x509.random_serial_number()) \
            .not_valid_before(now).not_valid_after(now + datetime.timedelta(days=365 * 40)).sign(key, hashes.SHA256())
        open(kp, 'wb').write(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
        open(cp, 'wb').write(cert.public_bytes(serialization.Encoding.PEM))
    key = serialization.load_pem_private_key(open(kp, 'rb').read(), None); cert = x509.load_pem_x509_certificate(open(cp, 'rb').read())
    return key, cert

# ============================================================ zip + v2 signature
def build_zip(entries):
    """entries: list of (name, bytes, stored, align)"""
    bio = io.BytesIO(); z = zipfile.ZipFile(bio, 'w')
    for name, data, stored, align in entries:
        zi = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0)); zi.create_system = 0
        zi.compress_type = zipfile.ZIP_STORED if stored else zipfile.ZIP_DEFLATED
        if align:
            hdr_end = bio.tell() + 30 + len(name.encode()) + 4
            n = (-hdr_end) % align
            zi.extra = u16(0xd935) + u16(n) + b'\0' * n
        z.writestr(zi, data, compresslevel=9 if not stored else None)
    z.close(); return bio.getvalue()

def lp(b): return u32(len(b)) + b

def eocd_info(apk):
    i = apk.rfind(b'PK\x05\x06'); cd_size, cd_off = struct.unpack('<II', apk[i + 12:i + 20]); return i, cd_off, cd_size

def v2_digest(apk, cd_off, eocd_i):
    eocd = bytearray(apk[eocd_i:]); eocd[16:20] = u32(cd_off)
    sections = [apk[:cd_off], apk[cd_off:eocd_i], bytes(eocd)]
    chunks = []
    for s in sections:
        for k in range(0, len(s), 1 << 20):
            c = s[k:k + (1 << 20)]; chunks.append(hashlib.sha256(b'\xa5' + u32(len(c)) + c).digest())
    return hashlib.sha256(b'\x5a' + u32(len(chunks)) + b''.join(chunks)).digest()

def sign_v2(apk, key, cert):
    eocd_i, cd_off, cd_size = eocd_info(apk); assert cd_off + cd_size == eocd_i
    dg = v2_digest(apk, cd_off, eocd_i)
    ALG = 0x0103
    signed = lp(lp(u32(ALG) + lp(dg))) + lp(lp(cert.public_bytes(serialization.Encoding.DER))) + lp(b'')
    sig = key.sign(signed, padding.PKCS1v15(), hashes.SHA256())
    pub = key.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
    signer = lp(signed) + lp(lp(u32(ALG) + lp(sig))) + lp(pub)
    value = lp(lp(signer))
    pairs = u64(4 + len(value)) + u32(0x7109871a) + value
    size = len(pairs) + 8 + 16
    block = u64(size) + pairs + u64(size) + b'APK Sig Block 42'
    eocd = bytearray(apk[eocd_i:]); eocd[16:20] = u32(cd_off + len(block))
    return apk[:cd_off] + block + apk[cd_off:eocd_i] + bytes(eocd)

def main():
    html, icon, out, keydir, vcode, vname = sys.argv[1:7]
    js_back = 'javascript:window.onAndroidBack&&window.onAndroidBack()'
    dex, info = build_dex(js_back)
    man, pool = build_manifest(int(vcode), vname)
    arsc = build_arsc()
    entries = [('AndroidManifest.xml', man, False, 0), ('classes.dex', dex, False, 0), ('resources.arsc', arsc, True, 4),
               (ICON_PATH, open(icon, 'rb').read(), True, 4), ('assets/index.html', open(html, 'rb').read(), False, 0)]
    key, cert = load_key(keydir)
    apk = sign_v2(build_zip(entries), key, cert)
    open(out, 'wb').write(apk)
    open(out + '.dex', 'wb').write(dex); open(out + '.manifest', 'wb').write(man); open(out + '.arsc', 'wb').write(arsc)
    print(out, len(apk), 'bytes; dex', len(dex), 'manifest', len(man), 'arsc', len(arsc))

if __name__ == '__main__':
    main()
