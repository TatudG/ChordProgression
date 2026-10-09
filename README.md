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

## Bedienung

**Tonart** – 12 Dur- und 12 Moll-Tonarten. Sie bestimmt die konkreten Akkorde
zu den Stufen und ob Töne mit ♯ oder ♭ geschrieben werden.

**Progression** – mehrere Schreibweisen, auch gemischt, getrennt durch
Leerzeichen:

| Eingabe                        | Bedeutung                                        |
| ------------------------------ | ------------------------------------------------ |
| `I V vi IV`                    | Stufen; groß = Dur, klein = Moll                  |
| `1 5 6 4`                      | Stufen als Zahlen, Dur/Moll aus der Tonleiter     |
| `C G Am F`                     | fertige Akkorde, unabhängig von der Tonart        |
| `V7`, `IVmaj7`, `vii°`, `iiø7` | Stufen mit Zusatz – der Zusatz hat Vorrang        |
| `C/G`, `I/VII`, `I/3`          | Slash-Akkord: Basston als Tonname oder als Stufe  |

Erkannte Zusätze sind unter anderem `6`, `m6`, `7`, `maj7`, `m7`, `m7♭5`,
`°7`, `m(maj7)`, `sus2`, `sus4`, `7sus4`, `5`, `add9`, `9`, `maj9`, `m9`,
`11`, `m11`, `13`, `m13`, `6/9`, `7♭5`, `7♯5`, `7♭9`, `7♯9` und die
Schreibweisen `Δ7`, `ø7`, `-`, `+`.

Nicht erkannte Angaben erscheinen als gestrichelte Karte mit Hinweis, statt
stillschweigend etwas Falsches zu zeigen.

**Vorlage** – 37 bekannte Progressionen in sechs Gruppen (Dur, Moll,
Septakkorde, Jazz, Blues, Basslinie) füllen das Eingabefeld. Eigene Eingaben
setzen die Auswahl auf „eigene Eingabe" zurück.

**Septakkorde ergänzen** – Stufen ohne Zusatz bekommen die leitereigene
Septime: aus `I V vi IV` wird in C-Dur `Cmaj7 G7 Am7 Fmaj7`, aus `1 6 3 7`
wird `Cmaj7 Am7 Em7 Bm7♭5`. Steht eine Dur-Stufe, die in der Tonart gar nicht
Dur wäre (`VI` in C-Dur), wird die Dominantseptime gesetzt (`A7`) – das ist
der übliche Zwischendominant.

**Deutsche Notennamen** – im Deutschen ist `B` der Ton, den andere Sprachen
`B♭` nennen, und das englische `B` heißt `H`. Der Umschalter gilt für Anzeige
*und* Eingabe: mit aktivem Schalter liefert `B` den Ton B♭ und `H` den Ton B.

Tonart, Progression, Schreibweise und Sept-Umschalter landen in der Adresse
(`?tonart=G-Dur&p=…&sept=1`) und im Browserspeicher. Ein kopierter Link stellt
also genau denselben Zustand wieder her.

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
- Bei einem Slash-Akkord zählt der Basston mit: `C/G` zeigt G grün, `C/B`
  nimmt das B zusätzlich in die Tonliste auf (tiefster Ton, deshalb vorn).
- Die Klaviatur zeigt zwei Oktaven (C4–B5). Der Grundton ist orange, die
  übrigen Akkordtöne blau, der Basston grün; dieselben Töne eine Oktave
  höher blasser.

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

- Akkorde per Web Audio anspielen (kein Zusatzpaket nötig) – auch als
  Hörprobe der Basslinie bei Slash-Akkorden
- Größerer Tastaturumfang mit horizontalem Scrollen
- Umkehrungen auf der Tastatur tatsächlich in der richtigen Lage zeigen,
  statt nur den Basston zu markieren
- Töne weglassen (`C(no3)`) und Alterationen wie `7♯11`
