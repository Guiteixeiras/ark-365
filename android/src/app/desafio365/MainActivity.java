package app.desafio365;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.KeyguardManager;
import android.app.NotificationManager;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.hardware.biometrics.BiometricManager;
import android.hardware.biometrics.BiometricPrompt;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.SystemClock;
import android.provider.MediaStore;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.webkit.JsResult;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Uma janela só: mostra as telas (que ficam dentro do APK) e cuida da trava. */
public class MainActivity extends Activity {
    static final String SITIO = "appassets.androidplatform.net"; // endereço reservado pra isso, nunca vai à rede
    static final String INICIO = "https://" + SITIO + "/index.html";
    static final int REQ_ARQUIVO = 10, REQ_SALVAR = 11, REQ_TRAVA = 12, REQ_NOTIF = 20, REQ_MIC = 21;
    static volatile boolean visivel;

    private FrameLayout raiz;
    private WebView web;
    private LinearLayout cadeado;
    private TextView recado;
    private Ponte ponte;
    private ValueCallback<Uri[]> escolha;
    private boolean destravado, pedindo, pedirAoVoltar, esperando;
    private long saiu;

    @Override
    protected void onCreate(Bundle estado) {
        super.onCreate(estado);
        ponte = new Ponte(this);
        if (estado == null) ponte.limparTemp();
        esconderTela(ponte.travaLigada());
        raiz = new FrameLayout(this);
        raiz.setBackgroundColor(Color.rgb(0x63, 0x24, 0xd6));
        setContentView(raiz);
        criarWeb();
        criarCadeado();
        Lembrete.criarCanal(this);
        Lembrete.agendar(this);
    }

    /* ---------- telas ---------- */

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    private void criarWeb() {
        web = new WebView(this) {
            @Override
            public InputConnection onCreateInputConnection(EditorInfo e) {
                InputConnection c = super.onCreateInputConnection(e);
                e.imeOptions |= EditorInfo.IME_FLAG_NO_PERSONALIZED_LEARNING; // o teclado não aprende com o diário
                return c;
            }
        };
        web.setBackgroundColor(Color.TRANSPARENT);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setGeolocationEnabled(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setSaveFormData(false);
        s.setMediaPlaybackRequiresUserGesture(false); // o apito do descanso
        web.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
        web.addJavascriptInterface(ponte, "Nativo");
        web.setWebViewClient(new Cliente());
        web.setWebChromeClient(new Cromo());
        raiz.addView(web, 0, new FrameLayout.LayoutParams(-1, -1));
        web.loadUrl(INICIO);
    }

    private final class Cliente extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
            Uri u = r.getUrl();
            if (!"https".equals(u.getScheme()) || !SITIO.equals(u.getHost())) {
                String e = u.getScheme();
                return "data".equals(e) || "blob".equals(e) ? null : nada();
            }
            String p = u.getPath() == null ? "/" : u.getPath();
            if (p.endsWith("/")) p += "index.html";
            if (p.contains("..")) return nada();
            try {
                InputStream in = getAssets().open("www" + p);
                Map<String, String> cab = new HashMap<>();
                cab.put("Cache-Control", "no-store");
                cab.put("X-Content-Type-Options", "nosniff");
                return new WebResourceResponse(tipo(p), texto(p) ? "utf-8" : null, 200, "OK", cab, in);
            } catch (IOException e) {
                return nada();
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
            return !SITIO.equals(r.getUrl().getHost());
        }

        @Override
        public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail d) {
            raiz.removeView(v);
            v.destroy();
            ponte.vozCancelar();
            criarWeb();
            if (!destravado && cadeado.getVisibility() == View.VISIBLE) web.setVisibility(View.INVISIBLE);
            return true;
        }
    }

    private static WebResourceResponse nada() {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<>(), new ByteArrayInputStream(new byte[0]));
    }

    private static boolean texto(String p) {
        return p.endsWith(".html") || p.endsWith(".css") || p.endsWith(".js") || p.endsWith(".webmanifest") || p.endsWith(".txt");
    }

    private static String tipo(String p) {
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".js")) return "text/javascript";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".webmanifest")) return "application/manifest+json";
        return "text/plain";
    }

    private final class Cromo extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
            if (escolha != null) escolha.onReceiveValue(null);
            escolha = cb;
            boolean fotos = false;
            for (String t : p.getAcceptTypes()) if (t != null && t.startsWith("image/")) fotos = true;
            boolean varias = p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE;
            Intent i;
            if (fotos && Build.VERSION.SDK_INT >= 33) {
                i = new Intent(MediaStore.ACTION_PICK_IMAGES).setType("image/*"); // só as fotos escolhidas, sem acesso à galeria
                if (varias) i.putExtra(MediaStore.EXTRA_PICK_IMAGES_MAX, 9);
            } else {
                i = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(fotos ? "image/*" : "*/*");
                if (varias) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
            }
            try {
                abrirFora(i, REQ_ARQUIVO);
            } catch (ActivityNotFoundException e) {
                escolha = null;
                cb.onReceiveValue(null);
            }
            return true;
        }

        @Override
        public boolean onJsConfirm(WebView v, String url, String msg, JsResult r) {
            new AlertDialog.Builder(MainActivity.this).setMessage(msg)
                    .setPositiveButton("Sim", (d, w) -> r.confirm())
                    .setNegativeButton("Não", (d, w) -> r.cancel())
                    .setOnCancelListener(d -> r.cancel()).show();
            return true;
        }

        @Override
        public void onPermissionRequest(PermissionRequest r) {
            r.deny();
        }
    }

    /** Conta pra página que algo aconteceu: nativoEvento(tipo, dados). */
    void evento(String tipo, JSONObject dados) {
        runOnUiThread(() -> {
            if (web != null) web.evaluateJavascript("window.nativoEvento&&nativoEvento(" + JSONObject.quote(tipo) + "," + dados + ")", null);
        });
    }

    void abrirFora(Intent i, int req) {
        esperando = true;
        startActivityForResult(i, req);
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        if ("registrar".equals(i.getAction())) evento("registrar", new JSONObject());
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (cadeado.getVisibility() == View.VISIBLE) {
            moveTaskToBack(true);
            return;
        }
        web.evaluateJavascript("!!(window.nativoVoltar&&nativoVoltar())", r -> {
            if (!"true".equals(r)) moveTaskToBack(true);
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    protected void onActivityResult(int req, int res, Intent d) {
        super.onActivityResult(req, res, d);
        if (req == REQ_ARQUIVO && escolha != null) {
            List<Uri> l = new ArrayList<>();
            if (res == RESULT_OK && d != null) {
                ClipData c = d.getClipData();
                if (c != null) for (int k = 0; k < c.getItemCount(); k++) if (c.getItemAt(k).getUri() != null) l.add(c.getItemAt(k).getUri());
                if (l.isEmpty() && d.getData() != null) l.add(d.getData());
            }
            escolha.onReceiveValue(l.isEmpty() ? null : l.toArray(new Uri[0]));
            escolha = null;
        } else if (req == REQ_SALVAR) {
            ponte.gravarEm(res == RESULT_OK && d != null ? d.getData() : null);
        } else if (req == REQ_TRAVA) {
            pedindo = false;
            if (res == RESULT_OK) abrir();
        }
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] ps, int[] rs) {
        super.onRequestPermissionsResult(req, ps, rs);
        boolean ok = rs.length > 0 && rs[0] == PackageManager.PERMISSION_GRANTED;
        if (req == REQ_NOTIF) ponte.responderLembrete();
        else if (req == REQ_MIC) ponte.microfone(ok);
    }

    boolean temMicrofone() {
        return checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    boolean podeNotificar() {
        return getSystemService(NotificationManager.class).areNotificationsEnabled();
    }

    /* ---------- trava ---------- */

    void esconderTela(boolean sim) {
        if (sim) getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }

    boolean celularTemBloqueio() {
        return getSystemService(KeyguardManager.class).isDeviceSecure();
    }

    private Button botao(String t, int fundo, int cor) {
        Button b = new Button(this);
        b.setText(t);
        b.setAllCaps(false);
        b.setTextColor(cor);
        b.setTextSize(16);
        GradientDrawable g = new GradientDrawable();
        g.setColor(fundo);
        g.setCornerRadius(dp(10));
        if (fundo == Color.TRANSPARENT) g.setStroke(dp(1), 0x99FFFFFF);
        b.setBackground(g);
        b.setPadding(dp(24), dp(12), dp(24), dp(12));
        b.setStateListAnimator(null);
        LinearLayout.LayoutParams l = new LinearLayout.LayoutParams(dp(240), -2);
        l.topMargin = dp(14);
        b.setLayoutParams(l);
        return b;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    private void criarCadeado() {
        cadeado = new LinearLayout(this);
        cadeado.setOrientation(LinearLayout.VERTICAL);
        cadeado.setGravity(Gravity.CENTER);
        cadeado.setBackgroundColor(Color.rgb(0x63, 0x24, 0xd6));
        cadeado.setClickable(true);
        TextView t = new TextView(this);
        t.setText("Desafio 365");
        t.setTextColor(Color.WHITE);
        t.setTextSize(32);
        t.setTypeface(t.getTypeface(), android.graphics.Typeface.BOLD);
        t.setGravity(Gravity.CENTER);
        recado = new TextView(this);
        recado.setTextColor(0xD9FFFFFF);
        recado.setTextSize(15);
        recado.setGravity(Gravity.CENTER);
        recado.setPadding(dp(32), dp(8), dp(32), dp(12));
        Button b1 = botao("Desbloquear", Color.WHITE, Color.rgb(0x16, 0x13, 0x1f));
        b1.setOnClickListener(v -> pedirDigital());
        Button b2 = botao("Usar o PIN do celular", Color.TRANSPARENT, Color.WHITE);
        b2.setOnClickListener(v -> pedirPin());
        cadeado.addView(t);
        cadeado.addView(recado);
        cadeado.addView(b1);
        cadeado.addView(b2);
        cadeado.setVisibility(View.GONE);
        raiz.addView(cadeado, new FrameLayout.LayoutParams(-1, -1));
    }

    private void travar() {
        if (cadeado.getVisibility() == View.VISIBLE) return;
        destravado = false;
        ponte.vozCancelar();
        recado.setText("Seu diário está trancado.");
        web.setVisibility(View.INVISIBLE);
        cadeado.setVisibility(View.VISIBLE);
        pedirAoVoltar = true;
    }

    private void abrir() {
        destravado = true;
        pedindo = false;
        pedirAoVoltar = false;
        cadeado.setVisibility(View.GONE);
        web.setVisibility(View.VISIBLE);
        web.requestFocus();
    }

    private void pedirDigital() {
        if (pedindo) return;
        if (!celularTemBloqueio()) {
            abrir();
            return;
        }
        pedindo = true;
        try {
            new BiometricPrompt.Builder(this)
                    .setTitle("Desafio 365")
                    .setSubtitle("Desbloqueia pra abrir seu diário")
                    .setConfirmationRequired(false)
                    .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK | BiometricManager.Authenticators.DEVICE_CREDENTIAL)
                    .build()
                    .authenticate(new CancellationSignal(), getMainExecutor(), new BiometricPrompt.AuthenticationCallback() {
                        @Override
                        public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult r) {
                            abrir();
                        }

                        @Override
                        public void onAuthenticationError(int codigo, CharSequence msg) {
                            pedindo = false;
                            boolean desistiu = codigo == BiometricPrompt.BIOMETRIC_ERROR_USER_CANCELED || codigo == BiometricPrompt.BIOMETRIC_ERROR_CANCELED;
                            recado.setText(desistiu ? "Seu diário está trancado." : msg);
                        }
                    });
        } catch (RuntimeException e) {
            pedindo = false;
            recado.setText("A digital não respondeu. Usa o PIN do celular.");
        }
    }

    /** Segundo caminho, pra nunca ficar trancado do lado de fora se a digital falhar. */
    @SuppressWarnings("deprecation")
    private void pedirPin() {
        Intent i = getSystemService(KeyguardManager.class).createConfirmDeviceCredentialIntent("Desafio 365", "Desbloqueia pra abrir seu diário");
        if (i == null) {
            abrir();
            return;
        }
        try {
            pedindo = true;
            startActivityForResult(i, REQ_TRAVA);
        } catch (ActivityNotFoundException e) {
            pedindo = false;
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        visivel = true;
        long fora = SystemClock.elapsedRealtime() - saiu, limite = esperando ? 5 * 60_000 : 30_000;
        esperando = false;
        if (ponte.travaLigada() && celularTemBloqueio()) {
            if (!destravado || fora > limite) travar();
        } else if (cadeado.getVisibility() == View.VISIBLE) abrir();
        else destravado = true;
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        if (pedirAoVoltar) {
            pedirAoVoltar = false;
            raiz.postDelayed(() -> {
                if (visivel && cadeado.getVisibility() == View.VISIBLE) pedirDigital();
            }, 250);
        }
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onStop() {
        visivel = false;
        saiu = SystemClock.elapsedRealtime();
        ponte.vozCancelar();
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        ponte.vozCancelar();
        if (web != null) {
            raiz.removeView(web);
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    void telaLigada(boolean sim) {
        runOnUiThread(() -> {
            if (sim) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        });
    }

    File temp() {
        File d = new File(getCacheDir(), "saida");
        d.mkdirs();
        return new File(d, "saida.tmp");
    }

    SharedPreferences ajustes() {
        return getSharedPreferences("ajustes", Context.MODE_PRIVATE);
    }
}
