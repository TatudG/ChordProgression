# Akkord-Progressionen

Eine einzelne Webseite: Tonart wählen, Progression eingeben – jeder Akkord wird
mit Name, Tönen und Klaviertastatur angezeigt, auf Wunsch stattdessen mit
Gitarrengriff. Läuft auf Rechner und Handy, braucht keinen Server und keine
Internetverbindung.

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

Hat man eine Vorlage gewählt, steht im Feld die Stufenfolge **in den Akkorden
der Tonart**: aus `I V vi IV` wird in G♭-Dur `G♭ D♭ E♭m C♭`. Gelesen wird
dabei weiter die Stufenfolge – deshalb wandert die Vorlage bei einem
Tonartwechsel mit, und der Sept-Umschalter greift auch dann. Sobald man ins
Feld tippt, gilt es als eigene Eingabe und bleibt genau so stehen, wie getippt.

**Vorlage** – 37 bekannte Progressionen in sechs Gruppen (Dur, Moll,
Septakkorde, Jazz, Blues, Basslinie) füllen das Eingabefeld. Eigene Eingaben
setzen die Auswahl auf „eigene Eingabe" zurück.

**Akkorde zusammenstellen** – der Knopf unter dem Vorlagenfeld baut eine
Abfolge aus zwei Auswahlfeldern statt aus getipptem Text. **Ton** bietet die
zwölf Töne in der Schreibweise der Tonart – in G♭-Dur also G♭, in E-Dur F♯ –
und darunter die andere Schreibweise derselben Töne. **Art** bietet 31
Akkordtypen in fünf Gruppen, von Dur und Moll über Septakkorde und
Sus-Vorhalte bis zu den Alterationen. „Hinzufügen" hängt den Akkord an die
nummerierte Reihe darunter; das × an einem Plättchen, „↶ Zurück" und „Leeren"
nehmen ihn wieder heraus.

Angefangen wird bei dem, was schon im Feld steht – eine fertige Progression
lässt sich so ergänzen, statt sie neu zu tippen. Die Karten erscheinen erst
mit **Fertig**, und erst dann wird die Abfolge ins Eingabefeld übernommen;
bis dahin steht dort die alte Progression, und unter der Steuerung nur ein
Hinweis. Wird der Auswahlbereich stattdessen nur zugemacht, bleibt alles wie
vorher – auch eine gewählte Vorlage kommt zurück.

**Septakkorde ergänzen** – Stufen ohne Zusatz bekommen die leitereigene
Septime: aus `I V vi IV` wird in C-Dur `Cmaj7 G7 Am7 Fmaj7`, aus `1 6 3 7`
wird `Cmaj7 Am7 Em7 Bm7♭5`. Steht eine Dur-Stufe, die in der Tonart gar nicht
Dur wäre (`VI` in C-Dur), wird die Dominantseptime gesetzt (`A7`) – das ist
der übliche Zwischendominant.

**Deutsche Notennamen** – im Deutschen ist `B` der Ton, den andere Sprachen
`B♭` nennen, und das englische `B` heißt `H`. Der Umschalter gilt für Anzeige
*und* Eingabe: mit aktivem Schalter liefert `B` den Ton B♭ und `H` den Ton B.

**Gitarrengriffe** – zeigt jede Karte als Griffbild statt als
Tastatur. Die Klaviatur bleibt die Hauptansicht; ohne den Schalter ändert sich
nichts. Im Bild ist der Grundton orange, die übrigen Akkordtöne blau, der
Basston eines Slash-Akkords grün. `○` heißt leere Saite, `×` nicht anschlagen;
ein Balken ist ein Barregriff, und links steht bei Griffen weiter oben am Hals
die Lage („2. Bund").

**Einordnung auf jeder Karte** – unter der Klaviatur stehen zwei kurze Zeilen
(so liegen die Tastaturen aller Karten auf einer Linie, egal wie lang die Sätze
sind). Die
erste sagt, was der Akkord in dieser Tonart tut: *Tonika – Ruhepunkt*, *Dominante
– erzeugt Spannung*, *Tonikaparallele*, *Subdominante – öffnet und weitet*,
dazu die Abweichungen (*Zwischendominante*, *Moll-Subdominante*, *Lehnakkord*).
Die zweite, mit ↳ eingeleitet, beschreibt den Schritt vom vorigen Akkord:
*Quintfall*, *Ganzschluss*, *Plagalschluss*, *Halbschluss*, *Trugschluss*, *ii–V*
und so weiter. Der erste Akkord hat keinen Schritt, der letzte bekommt, wenn er
auf der Dominante stehen bleibt, den *Halbschluss*.

**Ideen zum Variieren** – unter den Karten stehen Vorschläge, dieselbe
Progression einmal anders zu spielen. Jeder Vorschlag nennt seinen Namen und
einen Satz dazu und zeigt im Knopf die fertige Abfolge **in den Akkorden der
gewählten Tonart** – ein Klick übernimmt sie ins Eingabefeld, wo sie sich
weiterbearbeiten lässt. Angeboten werden je nach Abfolge: *Trugschluss*,
*Offen enden*, *Moll-Subdominante*, *Zwischendominante* und *Durchgang im Bass*.
Passt nichts davon, bleibt der Abschnitt verborgen.

Tonart, Progression, Schreibweise sowie Sept- und Gitarren-Umschalter landen in
der Adresse (`?tonart=G-Dur&p=…&sept=1&griff=gitarre`) und im Browserspeicher.
Ein kopierter Link stellt also genau denselben Zustand wieder her.

**Vorzeichen der Tonart** – über den Karten steht, wie viele ♯ oder ♭ zur
gewählten Tonart gehören, wie sie heißen und welche Tonart dieselben
Vorzeichen hat (die „parallele" Moll- bzw. Dur-Tonart). Daneben steht
dasselbe als Notenbild: Violinschlüssel mit den Vorzeichen auf ihren Linien.
Beides zusammen hilft beim Nachvollziehen am Instrument – c-Moll hat die drei
♭ von E♭-Dur und wird auf denselben Tönen gespielt.

## Aufbau

```
index.html      die Seite
css/style.css   das gesamte Design (Farben und Maße als CSS-Variablen)
js/main.js      Musiktheorie, Eingabe-Parser, Funktionsbestimmung, Ideen zum
                Variieren, Zeichnung von Tastatur, Griffbild und Notenbild
```

Kein Framework, kein Bundler, keine externen Schriften oder Bibliotheken –
die drei Umrisse der Notenschrift sind als Pfaddaten eingebettet (siehe
„Wie die Vorzeichen entstehen"), nachgeladen wird nichts.

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

### Wie die Einordnung entsteht

- Zuerst wird die **Stufe** bestimmt: auf welchem Ton der Tonleiter der Grundton
  des Akkords liegt. Das geschieht nach dem Ton, nicht nach dem Tongeschlecht –
  `Fm` in C-Dur steht auf der vierten Stufe, ist dort aber Moll.
- Aus Stufe und Tongeschlecht folgt die **Funktion**. Hier gilt die
  Funktionslehre Riemanns: Tonika, Subdominante, Dominante, dazu die
  Parallelklänge. Weicht das Tongeschlecht von der Tonleiter ab, entstehen die
  interessanten Fälle – Moll-Subdominante, Zwischendominante, die Dur-Dominante
  im Moll. Ein Akkord, dessen Grundton gar nicht in der Tonart liegt, ist ein
  **Lehnakkord**.
- Über die 3. und 6. Stufe sind sich die Lehrbücher nicht einig: je nach
  Zählung sind sie Dominant- oder Tonikaparallele, beziehungsweise Subdominant-
  oder Tonikaparallele. Die Seite nimmt die gebräuchlichere Lesart und
  beschreibt im Text lieber, wie der Akkord klingt, statt eine Deutung zu
  behaupten.
- Der **Schritt** zum vorigen Akkord wird zuerst nach den Kadenznamen geprüft –
  Trugschluss vor Ganzschluss, weil die sechste Stufe auch als Tonika zählt –,
  danach nach dem Abstand der beiden Grundtöne (Quintfall, Quint aufwärts,
  Halbton, Ganzton, Terzverwandtschaft, Tritonus, gleicher Ton als Umdeutung).
  „Halbschluss" gibt es nur für den letzten Akkord, und nur, wenn die
  Progression dort offen stehen bleibt.

### Wie die Ideen entstehen

Jede Idee wird aus der Abfolge selbst gebaut, nicht aus einer Liste:

- **Trugschluss** – endet die Abfolge auf der Tonika, wird sie durch die
  sechste Stufe ersetzt.
- **Offen enden** – steht vor der letzten Tonika die Dominante, lässt sich die
  Tonika ganz weglassen; aus der Kadenz wird eine Frage. Angeboten wird das erst
  ab drei Akkorden, sonst bliebe ein einziger übrig.
- **Moll-Subdominante** – in Dur wird jede Subdominante zu Moll; das ist der
  Klang aus der Paralleltonart.
- **Zwischendominante** – vor die erste sechste oder zweite Stufe kommt ein
  Dur-Akkord mit Septime auf ihrer Oberquinte.
- **Durchgang im Bass** – der vorletzte Akkord bekommt einen Basston einen
  Ganztonschritt über dem letzten Grundton; der Bass geht dann in einem Schritt
  nach Hause. Nur wenn dieser Ton zur Tonart gehört.

Die neuen Akkorde entstehen über die **Terzenschichtung** ab dem Grundton des
jeweiligen Akkords – deshalb heißen sie in G♭-Dur auch `C♭m` und `B♭7` und
nicht `Bm` und `A♯7`. Steht in der Abfolge etwas, das die Seite nicht erkennt,
bleibt es beim Vorschlag an seinem Platz stehen, statt stillschweigend zu
verschwinden.

### Wie die Vorzeichen entstehen

- Die Anzahl kommt aus dem **Quintenzirkel**: von C aus sieben Schritte auf-
  und abwärts, das ergibt für jeden Grundton die Zahl der ♯ bzw. ♭. Eine
  Moll-Tonart hat die Vorzeichen der Dur-Tonart eine kleine Terz höher, also
  c-Moll die drei ♭ von E♭-Dur.
- Gesetzt werden sie in der festen Reihenfolge des Zirkels: ♯ in `F C G D A E B`,
  ♭ in `B E A D G C F` – nie anders.
- Schlüssel, Kreuze und Be im Notenbild sind **gezeichnete Umrisse, keine
  Schriftzeichen**. Die Seite lädt keine Notenschrift-Schriftart nach – die
  Zeichen der Systemschrift sehen auf jedem Gerät anders aus, und ein
  Violinschlüssel lässt sich mit gleichbleibender Strichbreite nicht
  überzeugend zeichnen, weil er von dicken und dünnen Stellen lebt.
- Die drei Umrisse stammen aus der freien Notenschrift-Schrift **Bravura**
  (© Steinberg Media Technologies GmbH, SIL Open Font License 1.1); in
  `js/main.js` liegen sie als Pfaddaten, sonst wird nichts mitgeliefert. Der
  Lizenztext steht unter <https://openfontlicense.org>. Eingebettet ist die
  Schrift selbst nicht.
- Jedes Vorzeichen sitzt auf der Lage, auf der es in echter Notation steht
  (F♯ auf der obersten Linie, B♭ auf der Mittellinie, G♭ auf der zweiten).
  Der Umriss ist so gezeichnet, dass die *Mitte des Bauchs* auf der
  Notenposition liegt – genau wie bei einem Notenkopf.

### Wie die Gitarrengriffe entstehen

- Für die 24 Dur- und Moll-Dreiklänge stehen die gängigen Griffbilder fest in
  einer Tabelle (`GRIFFBILDER` in `js/main.js`) – das sind die Griffe, die man
  aus dem Liederbuch kennt.
- Für alles andere (Septakkorde, sus, Alterationen, Slash-Akkorde) sucht die
  Seite selbst: jede Saite darf nur einen Akkordton spielen, die
  kennzeichnenden Töne (Terz, Septime, Alteration) müssen klingen, die Quinte
  darf fehlen, der Basston muss der tiefste klingende Ton sein. Unter allen
  Möglichkeiten gewinnt die bequemste – offene Saiten und tiefe Lagen sind
  angenehmer als ein Barregriff weit oben am Hals.
- Jedes Tabellenmuster wird vor der Anzeige nach denselben Regeln geprüft.
  Passt es nicht zum Akkord (etwa bei `C/E`, weil der Basston ein anderer ist),
  übernimmt die Suche – ein Tippfehler in der Tabelle kann also keinen falschen
  Akkord zeigen.

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
- Andere Stimmungen (Drop D, Kapodaster) und ein Umschalter zwischen mehreren
  Griffvarianten je Akkord
