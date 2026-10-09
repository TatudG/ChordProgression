# Akkord-Progressionen

Eine einzelne Webseite: Tonart wählen, Progression eingeben – jeder Akkord wird
mit Name, Tönen und Klaviertastatur angezeigt. Läuft auf Rechner und Handy,
braucht keinen Server und keine Internetverbindung.

## Öffnen

`index.html` doppelklicken. Fertig – es gibt nichts zu installieren und nichts
zu bauen.

Für das Handy im selben WLAN:

```sh
python3 -m http.server 8000
```

Dann am Handy `http://<IP-des-Rechners>:8000` aufrufen. Die IP steht in den
Netzwerkeinstellungen oder in der Ausgabe von `ipconfig getifaddr en0`.

> Auf diesem Rechner blockiert die nicht akzeptierte Xcode-Lizenz gerade
> `python3` und `git`. Einmalig nötig: `sudo xcodebuild -license accept`.

## Bedienung

**Tonart** – 12 Dur- und 12 Moll-Tonarten. Sie bestimmt die konkreten Akkorde
zu den Stufen und ob Töne mit ♯ oder ♭ geschrieben werden.

**Progression** – drei Schreibweisen, auch gemischt, getrennt durch Leerzeichen:

| Eingabe          | Bedeutung                                              |
| ---------------- | ------------------------------------------------------ |
| `I V vi IV`      | Stufen; groß = Dur, klein = Moll                        |
| `1 5 6 4`        | Stufen als Zahlen, Dur/Moll aus der Tonleiter           |
| `C G Am F`       | fertige Akkorde, unabhängig von der Tonart              |
| `V7`, `IVmaj7`, `vii°`, `iiø7` | Stufen mit Zusatz – der Zusatz hat Vorrang |

Nicht erkannte Angaben erscheinen als gestrichelte Karte mit Hinweis, statt
stillschweigend etwas Falsches zu zeigen.

**Vorlage** – bekannte Progressionen (Pop, Jazz, Moll, 12-Takt-Blues) füllen
das Eingabefeld. Eigene Eingaben setzen die Auswahl auf „eigene Eingabe" zurück.

**Deutsche Notennamen** – im Deutschen ist `B` der Ton, den andere Sprachen
`B♭` nennen, und das englische `B` heißt `H`. Der Umschalter gilt für Anzeige
*und* Eingabe: mit aktivem Schalter liefert `B` den Ton B♭ und `H` den Ton B.

Tonart, Progression und Schreibweise landen in der Adresse (`?tonart=G-Dur&p=…`)
und im Browserspeicher. Ein kopierter Link stellt also genau denselben Zustand
wieder her.

## Aufbau

```
index.html      die Seite
css/style.css   das gesamte Design (Farben und Maße als CSS-Variablen)
js/main.js      Musiktheorie, Eingabe-Parser und Tastatur-Zeichnung
```

Kein Framework, kein Bundler, keine externen Schriften oder Bibliotheken.

### Wie die Akkorde entstehen

- Leitereigene Dreiklänge in Dur: `maj min min maj maj min dim`
- In Moll ist die 5. Stufe als Dur angesetzt (harmonisch) und die 7. als Dur
  (natürlich) – so wird Moll in Pop und Rock tatsächlich gespielt.
- Tonnamen entstehen durch **Terzenschichtung** ab dem Grundtonbuchstaben,
  nicht aus der reinen Halbtonzahl. Deshalb heißt der Akkord `B–D–F♯` und
  nicht `B–D–G♭`, und `E♭°7` endet auf `D♭♭` statt auf `C`.
- Die Klaviatur zeigt zwei Oktaven (C4–B5). Der Grundton ist orange, die
  übrigen Akkordtöne blau; dieselben Töne eine Oktave höher blasser.

## Veröffentlichen (GitHub Pages)

```sh
git add -A
git commit -m "Akkord-Progressionen"
git push
```

Danach im Repository unter *Settings → Pages* als Quelle „Deploy from a
branch", Branch `main`, Ordner `/ (root)` wählen. Die Seite liegt dann unter
`https://<benutzername>.github.io/<repository>/`.

Veröffentlicht werden nur `index.html`, `css/` und `js/` – diese README gehört
nicht ins Netz.

## Mögliche Erweiterungen

- Akkorde per Web Audio anspielen (kein Zusatzpaket nötig)
- Umkehrungen und Slash-Akkorde (`C/G`)
- Größerer Tastaturumfang mit horizontalem Scrollen
