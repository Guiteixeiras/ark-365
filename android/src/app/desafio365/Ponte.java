package app.desafio365;

import android.Manifest;
import android.app.AlarmManager;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipDescription;
import android.content.ClipboardManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Base64;
import android.webkit.JavascriptInterface;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;

/** O que a página pode pedir pro celular. Na página aparece como window.Nativo (ver app/nativo.js). */
public class Ponte {
    private final MainActivity a;

    Ponte(MainActivity a) {
        this.a = a;
    }

    private static JSONObject json(Object... kv) {
        JSONObject o = new JSONObject();
        try {
            for (int i = 0; i < kv.length; i += 2) o.put((String) kv[i], kv[i + 1]);
        } catch (JSONException e) {
            throw new IllegalStateException(e);
        }
        return o;
    }

    /* ---------- lembrete ---------- */

    @JavascriptInterface
    public void lembrete(boolean on, String h) {
        Lembrete.pref(a).edit().putBoolean("on", on).putString("h", h).apply();
        a.runOnUiThread(() -> {
            if (on && Build.VERSION.SDK_INT >= 33 && !a.podeNotificar()) a.requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, MainActivity.REQ_NOTIF);
            else responderLembrete();
        });
    }

    void responderLembrete() {
        SharedPreferences p = Lembrete.pref(a);
        boolean pode = a.podeNotificar();
        if (!pode) p.edit().putBoolean("on", false).apply();
        Lembrete.agendar(a);
        a.evento("lembrete", json("on", p.getBoolean("on", false), "notif", pode));
    }

    @JavascriptInterface
    public String lembreteEstado() {
        SharedPreferences p = Lembrete.pref(a);
        return json("on", p.getBoolean("on", false) && a.podeNotificar(), "h", p.getString("h", "21:00"), "notif", a.podeNotificar(),
                "exato", a.getSystemService(AlarmManager.class).canScheduleExactAlarms(), "xiaomi", xiaomi()).toString();
    }

    private static boolean xiaomi() {
        return "xiaomi".equalsIgnoreCase(Build.MANUFACTURER);
    }

    /** Só datas: começo e fim do desafio, e o último dia que já tem nota (pra não lembrar à toa). */
    @JavascriptInterface
    public void dia(String inicio, String fim, String nota) {
        Lembrete.pref(a).edit().putString("inicio", inicio).putString("fim", fim).putString("nota", nota).apply();
    }

    @JavascriptInterface
    public void abrirAjustes(String qual) {
        a.runOnUiThread(() -> {
            Uri eu = Uri.parse("package:" + a.getPackageName());
            Intent i;
            if ("notificacao".equals(qual)) i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, a.getPackageName());
            else if ("inicio".equals(qual)) i = new Intent().setComponent(new ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"));
            else i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, eu);
            try {
                a.startActivity(i);
            } catch (ActivityNotFoundException | SecurityException e) {
                try {
                    a.startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, eu));
                } catch (ActivityNotFoundException ignored) {
                }
            }
        });
    }

    /* ---------- trava ---------- */

    boolean travaLigada() {
        return a.ajustes().getBoolean("trava", true);
    }

    @JavascriptInterface
    public void trava(boolean on) {
        a.ajustes().edit().putBoolean("trava", on).apply();
        a.runOnUiThread(() -> a.esconderTela(on));
    }

    @JavascriptInterface
    public String travaEstado() {
        return json("on", travaLigada(), "bloqueio", a.celularTemBloqueio()).toString();
    }

    @JavascriptInterface
    public void telaLigada(boolean sim) {
        a.telaLigada(sim);
    }

    /* ---------- área de transferência ---------- */

    @JavascriptInterface
    public boolean copiar(String texto) {
        try {
            ClipData c = ClipData.newPlainText("", texto);
            PersistableBundle p = new PersistableBundle();
            p.putBoolean(Build.VERSION.SDK_INT >= 33 ? ClipDescription.EXTRA_IS_SENSITIVE : "android.content.extra.IS_SENSITIVE", true);
            c.getDescription().setExtras(p);
            a.getSystemService(ClipboardManager.class).setPrimaryClip(c);
            return true;
        } catch (RuntimeException e) { // texto grande demais pro Android
            return false;
        }
    }

    @JavascriptInterface
    public String colar() {
        try {
            ClipData c = a.getSystemService(ClipboardManager.class).getPrimaryClip();
            if (c == null || c.getItemCount() == 0) return "";
            CharSequence t = c.getItemAt(0).coerceToText(a);
            return t == null ? "" : t.toString();
        } catch (RuntimeException e) {
            return "";
        }
    }

    @JavascriptInterface
    public void limparCopia() {
        try {
            a.getSystemService(ClipboardManager.class).clearPrimaryClip();
        } catch (RuntimeException ignored) {
        }
    }

    /* ---------- salvar arquivo onde a pessoa escolher ---------- */

    private OutputStream saida;
    private String nomeSaida = "", tipoSaida = "application/octet-stream";

    void limparTemp() {
        a.temp().delete();
    }

    @JavascriptInterface
    public synchronized boolean salvarInicio(String nome, String tipo) {
        try {
            fechar();
            nomeSaida = nome;
            tipoSaida = tipo;
            saida = new BufferedOutputStream(new FileOutputStream(a.temp()));
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    @JavascriptInterface
    public synchronized boolean salvarParte(String b64) {
        try {
            saida.write(Base64.decode(b64, Base64.DEFAULT));
            return true;
        } catch (IOException | RuntimeException e) {
            fechar();
            limparTemp();
            return false;
        }
    }

    @JavascriptInterface
    public synchronized void salvarFim() {
        fechar();
        Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(tipoSaida).putExtra(Intent.EXTRA_TITLE, nomeSaida);
        a.runOnUiThread(() -> {
            try {
                a.abrirFora(i, MainActivity.REQ_SALVAR);
            } catch (ActivityNotFoundException e) {
                limparTemp();
                a.evento("salvo", json("ok", false, "cancelou", false));
            }
        });
    }

    private void fechar() {
        if (saida != null) try {
            saida.close();
        } catch (IOException ignored) {
        }
        saida = null;
    }

    void gravarEm(Uri destino) {
        if (destino == null) {
            limparTemp();
            a.evento("salvo", json("ok", false, "cancelou", true));
            return;
        }
        new Thread(() -> {
            boolean ok = false;
            try (InputStream in = new FileInputStream(a.temp()); OutputStream out = a.getContentResolver().openOutputStream(destino, "wt")) {
                byte[] b = new byte[1 << 16];
                for (int n; (n = in.read(b)) > 0; ) out.write(b, 0, n);
                out.flush();
                ok = true;
            } catch (IOException | RuntimeException ignored) {
            }
            limparTemp();
            a.evento("salvo", json("ok", ok, "cancelou", false));
        }).start();
    }

    /* ---------- cópia automática, dentro da área privada do app (sem fotos) ---------- */

    private File[] espelhos() {
        File d = new File(a.getFilesDir(), "copias");
        d.mkdirs();
        File[] l = d.listFiles((x, n) -> n.matches("\\d{4}-\\d{2}-\\d{2}\\.json"));
        if (l == null) l = new File[0];
        Arrays.sort(l);
        return l;
    }

    @JavascriptInterface
    public synchronized boolean espelho(String dia, String dados) {
        if (!dia.matches("\\d{4}-\\d{2}-\\d{2}")) return false;
        File d = new File(a.getFilesDir(), "copias"), t = new File(d, "novo.tmp"), alvo = new File(d, dia + ".json");
        byte[] novo = dados.getBytes(StandardCharsets.UTF_8);
        d.mkdirs();
        if (alvo.length() > 2L * novo.length) return false; // encolheu demais de uma vez: fica com a cópia boa de hoje
        try (FileOutputStream o = new FileOutputStream(t)) {
            o.write(novo);
            o.getFD().sync();
        } catch (IOException e) {
            t.delete();
            return false;
        }
        boolean ok = t.renameTo(alvo);
        File[] l = espelhos();
        for (int i = 0; i < l.length - 7; i++) l[i].delete();
        return ok;
    }

    @JavascriptInterface
    public String lerEspelho() {
        File[] l = espelhos();
        if (l.length == 0) return "";
        File f = l[l.length - 1];
        try (InputStream in = new FileInputStream(f)) {
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            byte[] b = new byte[1 << 16];
            for (int n; (n = in.read(b)) > 0; ) o.write(b, 0, n);
            return json("dia", f.getName().substring(0, 10), "dados", o.toString("UTF-8")).toString();
        } catch (IOException e) {
            return "";
        }
    }

    /* ---------- voz ---------- */

    private SpeechRecognizer rec;
    private int vez;
    private volatile boolean aceitaServico;
    private Runnable depoisDoMic;

    /** local: transcreve no aparelho. servico: usa o serviço de voz do celular (pode ir pra internet). nao: não tem. */
    @JavascriptInterface
    public String vozEstado() {
        try {
            if (SpeechRecognizer.isOnDeviceRecognitionAvailable(a)) return "local";
            return SpeechRecognizer.isRecognitionAvailable(a) ? "servico" : "nao";
        } catch (RuntimeException e) {
            return "nao";
        }
    }

    @JavascriptInterface
    public void vozIniciar(int id, boolean podeServico) {
        aceitaServico = podeServico;
        a.runOnUiThread(() -> {
            if (a.temMicrofone()) {
                ouvir(id);
                return;
            }
            depoisDoMic = () -> ouvir(id);
            vez = id;
            a.requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, MainActivity.REQ_MIC);
        });
    }

    void microfone(boolean ok) {
        Runnable r = depoisDoMic;
        depoisDoMic = null;
        if (r == null) return;
        if (ok) r.run();
        else a.evento("voz", json("id", vez, "t", "erro", "c", 9));
    }

    private void ouvir(int id) {
        soltar();
        vez = id;
        String e = vozEstado();
        if ("nao".equals(e) || ("servico".equals(e) && !aceitaServico)) {
            a.evento("voz", json("id", id, "t", "erro", "c", 5));
            return;
        }
        try {
            rec = "local".equals(e) ? SpeechRecognizer.createOnDeviceSpeechRecognizer(a) : SpeechRecognizer.createSpeechRecognizer(a);
            rec.setRecognitionListener(new Ouvinte(id));
            rec.startListening(pedido());
        } catch (RuntimeException x) {
            soltar();
            a.evento("voz", json("id", id, "t", "erro", "c", 5));
        }
    }

    private static Intent pedido() {
        return new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE, "pt-BR")
                .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                .putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
                .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
    }

    @JavascriptInterface
    public void vozParar() {
        a.runOnUiThread(() -> {
            if (rec != null) try {
                rec.stopListening();
            } catch (RuntimeException ignored) {
            }
        });
    }

    @JavascriptInterface
    public void vozCancelar() {
        a.runOnUiThread(this::soltar);
    }

    private void soltar() {
        if (rec == null) return;
        SpeechRecognizer r = rec;
        rec = null;
        try {
            r.cancel();
            r.destroy();
        } catch (RuntimeException ignored) {
        }
        a.evento("voz", json("id", vez, "t", "fim", "x", ""));
    }

    private final class Ouvinte implements RecognitionListener {
        private final int id;

        Ouvinte(int id) {
            this.id = id;
        }

        private boolean meu() {
            return rec != null && vez == id;
        }

        private String texto(Bundle b) {
            ArrayList<String> l = b == null ? null : b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
            return l == null || l.isEmpty() || l.get(0) == null ? "" : l.get(0);
        }

        private void acabou(JSONObject o) {
            SpeechRecognizer r = rec;
            rec = null;
            if (r != null) try {
                r.destroy();
            } catch (RuntimeException ignored) {
            }
            a.evento("voz", o);
        }

        @Override
        public void onReadyForSpeech(Bundle b) {
            if (meu()) a.evento("voz", json("id", id, "t", "inicio"));
        }

        @Override
        public void onPartialResults(Bundle b) {
            String s = texto(b);
            if (meu() && !s.isEmpty()) a.evento("voz", json("id", id, "t", "parcial", "x", s));
        }

        @Override
        public void onResults(Bundle b) {
            if (meu()) acabou(json("id", id, "t", "fim", "x", texto(b)));
        }

        @Override
        public void onError(int c) {
            if (!meu()) return;
            // pacote de português ainda não baixado: pede pro serviço de voz do celular baixar
            if (Build.VERSION.SDK_INT >= 33 && (c == SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE || c == SpeechRecognizer.ERROR_LANGUAGE_NOT_SUPPORTED)) try {
                rec.triggerModelDownload(pedido());
            } catch (RuntimeException ignored) {
            }
            acabou(json("id", id, "t", "erro", "c", c));
        }

        @Override
        public void onBeginningOfSpeech() {
        }

        @Override
        public void onRmsChanged(float v) {
        }

        @Override
        public void onBufferReceived(byte[] b) {
        }

        @Override
        public void onEndOfSpeech() {
        }

        @Override
        public void onEvent(int t, Bundle b) {
        }
    }
}
