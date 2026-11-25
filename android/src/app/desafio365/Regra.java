package app.desafio365;

import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/** Regras do lembrete, sem nada do Android, pra poder testar no computador. */
final class Regra {
    private Regra() {}

    /** Próxima vez que o relógio marca hh:mm, contando de agora (sempre no futuro). */
    static ZonedDateTime proximo(ZonedDateTime agora, String hhmm) {
        LocalTime h = hora(hhmm);
        ZoneId z = agora.getZone();
        ZonedDateTime t = agora.toLocalDate().atTime(h).atZone(z);
        if (!t.isAfter(agora)) t = agora.toLocalDate().plusDays(1).atTime(h).atZone(z);
        return t;
    }

    static LocalTime hora(String hhmm) {
        try {
            return LocalTime.parse(hhmm);
        } catch (RuntimeException e) {
            return LocalTime.of(21, 0);
        }
    }

    /** Datas em aaaa-mm-dd. Avisa só dentro do desafio e só se o dia ainda não tem nota. */
    static boolean deveAvisar(String hoje, String inicio, String fim, String diaComNota) {
        if (inicio.isEmpty() || fim.isEmpty()) return false;
        return hoje.compareTo(inicio) >= 0 && hoje.compareTo(fim) <= 0 && !hoje.equals(diaComNota);
    }
}
