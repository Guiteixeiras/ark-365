package app.desafio365;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import java.time.LocalDate;
import java.time.ZonedDateTime;

/** Alarme diário do próprio celular: toca com o app fechado e volta depois de reiniciar. */
public class Lembrete extends BroadcastReceiver {
    static final String ACAO = "app.desafio365.LEMBRAR";
    static final String CANAL = "lembrete";

    static SharedPreferences pref(Context c) {
        return c.getSharedPreferences("lembrete", Context.MODE_PRIVATE);
    }

    @Override
    public void onReceive(Context c, Intent i) {
        try {
            if (ACAO.equals(i.getAction())) avisar(c);
        } finally {
            agendar(c);
        }
    }

    static void agendar(Context c) {
        AlarmManager am = c.getSystemService(AlarmManager.class);
        PendingIntent pi = PendingIntent.getBroadcast(c, 1, new Intent(c, Lembrete.class).setAction(ACAO),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        am.cancel(pi);
        SharedPreferences p = pref(c);
        if (!p.getBoolean("on", false)) return;
        long t = Regra.proximo(ZonedDateTime.now(), p.getString("h", "21:00")).toInstant().toEpochMilli();
        if (am.canScheduleExactAlarms()) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
        else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
    }

    static void criarCanal(Context c) {
        NotificationChannel n = new NotificationChannel(CANAL, "Lembrete diário", NotificationManager.IMPORTANCE_HIGH);
        n.setDescription("Lembra de registrar o dia");
        n.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
        c.getSystemService(NotificationManager.class).createNotificationChannel(n);
    }

    /** O aviso não leva nada do que foi escrito: só o convite pra registrar. */
    static void avisar(Context c) {
        SharedPreferences p = pref(c);
        if (!p.getBoolean("on", false) || MainActivity.visivel) return;
        if (!Regra.deveAvisar(LocalDate.now().toString(), p.getString("inicio", ""), p.getString("fim", ""), p.getString("nota", ""))) return;
        criarCanal(c);
        PendingIntent abrir = PendingIntent.getActivity(c, 2,
                new Intent(c, MainActivity.class).setAction("registrar").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(c, CANAL)
                .setSmallIcon(R.drawable.selo)
                .setColor(0xFF6324D6)
                .setContentTitle("Como foi hoje?")
                .setContentText("Um minuto pra pintar o quadradinho do dia.")
                .setContentIntent(abrir)
                .setAutoCancel(true)
                .setCategory(Notification.CATEGORY_REMINDER)
                .setVisibility(Notification.VISIBILITY_PRIVATE)
                .build();
        c.getSystemService(NotificationManager.class).notify(1, n);
    }
}
