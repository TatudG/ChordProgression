# Akkord-Progressionen

Eine einzelne Webseite: Tonart wählen, Progression eingeben – jeder Akkord wird
mit Name, Tönen und Klaviertastatur angezeigt, auf Wunsch stattdessen mit
Gitarrengriff oder mit dem Fingersatz auf den Tasten, und lässt sich auf Klick
anhören. Läuft auf Rechner und Handy, braucht keinen Server und keine
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
zwölf Töne, jeder mit beiden Namen in einem Eintrag: `C♯/D♭`, `D♯/E♭`,
`F♯/G♭`, `G♯/A♭`, `A♯/B♭`. Vorn steht die Schreibweise der Tonart – in
G♭-Dur also `D♭/C♯` –, und gebaut wird der Akkord in dieser Schreibweise:
in C-Dur wird aus `D♯/E♭` ein D♯m, in G♭-Dur ein D♭m. **Art** bietet 31
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

**Vorschlag zur Tonart** – tippt man fertige Akkorde statt Stufen, muss man
nicht wissen, in welcher Tonart man gerade denkt: stehen mindestens zwei
Akkorde im Feld, die besser zu einer anderen Tonart passen als zur eingestellten,
erscheint über den Karten eine Zeile *„Diese Akkorde klingen nach C-Dur – dort
sind es die Stufen I V vi IV"* mit einem Knopf daneben. Ein Klick stellt die
Tonart ein; die Karten rechnen mit ihr neu, und die Ideen zum Variieren richten
sich danach. Bei Stufen im Feld kommt der Vorschlag nicht – dort gibt die
gewählte Tonart jeden Ton ohnehin selbst an.

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

**Anhören** – mit angeknipsten Hör-Knöpfen steht unter jeder Karte ein Knopf
*▶ Anhören*; er spielt den Akkord so, wie er dasteht: die Töne von unten nach
oben, beim Slash-Akkord mit dem Basston zuunterst. Für das Gehör lässt sich so
nachvollziehen, wie eine
Stufe in der Tonart klingt, und der Unterschied zwischen zwei Karten ist
unmittelbar zu hören. Der Klang entsteht im Browser (Web Audio), es wird nichts
nachgeladen. **Nur auf Klick**: beim Laden der Seite und beim Tippen erklingt
nichts – der Browser gibt Ton ohnehin erst nach einer Nutzerhandlung heraus.
Ein zweiter Klick löst den ersten Klang ab, statt beide übereinander zu legen.
Unerkannte Karten haben keinen Knopf, weil es dort nichts zu hören gibt.

**Anhören-Knöpfe** – der Schalter neben den Notennamen blendet die
Hör-Knöpfe ein und wieder aus. Von Anfang an ist er aus, die Karten stehen
also ruhig da; wer die Akkorde hören will, knipst ihn an. Beim Ausblenden
verstummt ein noch klingender Ton.

**Fingersatz** – der Schalter daneben legt die Finger der rechten Hand auf die
Tasten: `1` ist der Daumen, `5` der kleine Finger. Er ist von Anfang an aus.
Ohne ihn zeigt die Tastatur die Töne in der unteren Oktave (ab C4); mit ihm
zeigt sie die Lage, in der die Hand wirklich liegt – das kann eine Oktave
höher sein, und der Akkord steht dann manchmal mit einem anderen Ton im Bass,
weil ein gemeinsamer Ton liegen bleiben soll. Die Zahlen folgen der Abfolge:
jeder Akkord greift dort weiter, wo die Hand vom vorigen her liegt, derselbe
Akkord kann an anderer Stelle also andere Zahlen tragen. Was mehr als fünf
Töne hat (`C13`), fasst keine Hand auf einmal – dort steht statt der Zahlen ein
Hinweis. Im Griffbild gibt es keinen Fingersatz, weil die Gitarre anders
gegriffen wird.

Tonart, Progression, Schreibweise sowie Sept-, Gitarren-, Anhören- und
Fingersatz-Schalter landen in der Adresse (`?tonart=G-Dur&p=…&sept=1&griff=gitarre`,
mit Hör-Knöpfen `&hoeren=1`, mit Fingersatz `&fingersatz=1`) und im
Browserspeicher. Ein kopierter Link stellt also genau denselben Zustand wieder
her.

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
                Variieren, Anhören der Akkorde, Fingersatz, Zeichnung von
                Tastatur, Griffbild und Notenbild
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
  übrigen Akkordtöne blau, der Basston grün; dieselben Töne in der anderen
  Oktave blasser. Ohne Fingersatz ist das die obere, mit Fingersatz die, in der
  die Hand nicht liegt.

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

### Wie der Tonart-Vorschlag entsteht

- Alle 24 Tonarten werden durchgezählt und jede an denselben Akkorden gemessen.
  Punkte gibt es, wenn der Grundton auf einer Stufe der Tonleiter liegt und das
  Tongeschlecht zur leitereigenen Stufe passt; die Tonika am Anfang oder am Ende
  zählt doppelt, weil sie die Tonart festlegt. Ein Akkord, dessen Grundton gar
  nicht zur Tonart gehört, zieht sie nach unten.
- Vorgeschlagen wird nur, was die eingestellte Tonart **übertrifft**. Zwei
  Tonarten, die die Akkorde gleich gut erklären, streiten nicht – dann bleibt
  es bei der gewählten. Deshalb erscheint der Vorschlag auch nicht mehr, sobald
  man ihn angenommen hat.
- Genannt werden die Stufen nur, wenn jeder Akkord im Feld eine hat. Steht
  Unerkanntes dabei, bleibt es beim bloßen Namen der Tonart.

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

### Wie der Klang entsteht

- Die Töne des Akkords werden von unten nach oben gestapelt: der Grundton
  beginnt bei C3, jeder weitere Ton liegt über dem vorigen. Ein Basston, der
  ohnehin zum Akkord gehört, rückt nach unten – `C/E` klingt also in der ersten
  Umkehrung. Ein Basston, der nicht zum Akkord gehört (`C/B`), kommt als
  tiefster Ton dazu.
- Jeder Ton ist ein Dreieck-Oszillator mit einer Hüllkurve: in 15 ms auf
  Lautstärke, dann rund zwei Sekunden ausklingend. Die Lautstärke wird durch
  die Zahl der Töne geteilt, damit ein Siebenklang nicht lauter ist als ein
  Dreiklang.

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

### Wie der Fingersatz entsteht

- Eine Hand kann einen Akkord auf mehrere Weisen greifen: mit verschiedenem Ton
  im Bass und in verschiedenen Oktaven. Zuerst werden deshalb die möglichen
  **Lagen** aufgestellt – jeder Akkordton genau einmal, höchstens eine Oktave
  (zwölf Halbtöne) weit, und ganz auf der gezeichneten Tastatur (C4–B5). Zu
  jeder Lage werden die Fingerfolgen durchgerechnet (höchstens zehn). Die
  tiefste Lage ist die, die die Tastatur auch ohne Fingersatz zeigt: in C-Dur
  also C–E–G, in G-Dur aber D–G–B, weil das tiefe G unter C4 liegt (der
  Grundton muss also nicht im Bass stehen – eine Umkehrung ist kein Fehler,
  sie kostet nur ein wenig, damit ein Akkord nicht ohne Grund mit einem
  anderen Ton im Bass dasteht).
- Drei Wünsche entscheiden, welche Lage gewinnt – und zwar nicht Akkord für
  Akkord, sondern die ganze Abfolge auf einmal, damit ein liegen gebliebener
  Ton nicht am nächsten Akkord scheitert:
  - **Ein Ton, der schon im Akkord davor lag, behält seinen Finger.** Das wiegt
    am schwersten: ein verlorener Ton zählt so viel wie hundert kleine
    Unbequemlichkeiten oder ein Meter Handbewegung. Deshalb darf die Hand hier
    auch einen Ton umkehren, statt in die bequemere Grundstellung zu springen.
  - **Die Hand soll bequem liegen.** Wie weit zwei Finger auseinander liegen,
    hängt vom Tonabstand ab: Halbton und Ganzton einen Finger weiter, die Terz
    zwei, ab der Quinte vier. Aus diesen Wunschabständen kommt die Spanne des
    Griffs; verteilt wird sie nach den wirklichen Tonabständen – wo die Musik
    weiter springt, liegt ein Finger weiter weg. Ein Dreiklang in weiter Lage
    (C–E–G) wird so zu `1 3 5`.
  - **Die Hand soll nicht springen.** Von zwei gleich guten Lagen gewinnt die
    näher an der vorigen. Ohne Vorgabe liegt sie so tief wie möglich – so, wie
    die Tastatur ohne Fingersatz gezeichnet ist. In `I V vi IV` bekommt so
    jeder Akkord `1 3 5`, und in `C G7 C` bleibt das G über den Wechsel hinweg
    unter dem kleinen Finger.
- Weil das Gedächtnis von Akkord zu Akkord weiterläuft, kann derselbe Akkord
  an anderer Stelle andere Zahlen tragen. Der erste Akkord einer Abfolge liegt
  so tief wie möglich, also in der Oktave, die die Tastatur ohne Fingersatz
  zeigt; erst wo die Hand schon liegt, darf sie einen Ton umkehren, um einen
  anderen liegen zu lassen. Nach einem Akkord, den eine Hand nicht fasst, fängt
  die Lage wieder von vorn an – niemand weiß, wo die Finger dann gerade liegen.
- Was mehr als fünf Töne hat (`C13`) oder gar nicht erkannt wurde, bekommt
  keine Zahlen, sondern den Hinweis, dass es keine Hand auf einmal fasst.

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

- Größerer Tastaturumfang mit horizontalem Scrollen
- Umkehrungen auf der Tastatur tatsächlich in der richtigen Lage zeigen,
  statt nur den Basston zu markieren
- Fingersatz auch für die linke Hand und für das Griffbild
- Töne weglassen (`C(no3)`) und Alterationen wie `7♯11`
- Andere Stimmungen (Drop D, Kapodaster) und ein Umschalter zwischen mehreren
  Griffvarianten je Akkord
