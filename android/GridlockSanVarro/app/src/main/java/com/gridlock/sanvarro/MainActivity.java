package com.gridlock.sanvarro;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView web;
    private LanServer lan;
    private byte[] page;

    /** Exposed to the game as window.AndroidLan: lets this phone host a LAN game. */
    public class LanBridge {
        @JavascriptInterface
        public String start() {
            try {
                if (lan == null) lan = new LanServer(() -> {
                    if (page == null) { java.io.InputStream in = getAssets().open("index.html"); java.io.ByteArrayOutputStream o = new java.io.ByteArrayOutputStream(); byte[] b = new byte[65536]; int n; while ((n = in.read(b)) > 0) o.write(b, 0, n); in.close(); page = o.toByteArray(); }
                    return page;
                });
                int port = lan.start(8080);
                String ip = LanServer.localIp();
                return (ip.isEmpty() ? "127.0.0.1" : ip) + ":" + port;
            } catch (Exception e) { return ""; }
        }
        @JavascriptInterface
        public void stop() { if (lan != null) lan.stop(); }
        @JavascriptInterface
        public int players() { return lan == null ? 0 : lan.count(); }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // save games (localStorage)
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);
        web.addJavascriptInterface(new LanBridge(), "AndroidLan");
        web.setWebViewClient(new WebViewClient());
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);
        hideSystemUi();
        web.loadUrl("file:///android_asset/index.html");
    }

    private void hideSystemUi() {
        Window w = getWindow();
        if (Build.VERSION.SDK_INT >= 30) {
            w.setDecorFitsSystemWindows(false);
            WindowInsetsController c = w.getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            w.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUi();
    }

    // Android back button: close a dialog, open the pause menu, or resume.
    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        web.evaluateJavascript("(function(){try{if(G.invOpen){Panel.close();}else if(G.garageOpen){closeGarage();}else if(G.dlgOpen){closeDialog();}else if(G.fullMap){G.fullMap=false;}"
                + "else if(G.mode==='play'&&!G.menuOpen){openPause();}else if(G.menuOpen&&G.inGame){hideMenu();}}catch(e){}})()", null);
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.evaluateJavascript("try{doSave&&G.inGame&&doSave(true);Snd.ctx&&Snd.ctx.suspend();if(G.mode==='play'&&!G.menuOpen)openPause();}catch(e){}", null);
        if (lan == null || !lan.isRunning()) web.onPause();
    }

    @Override
    protected void onDestroy() {
        if (lan != null) lan.stop();
        super.onDestroy();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        web.evaluateJavascript("try{Snd.ctx&&Snd.ctx.resume();}catch(e){}", null);
    }
}
