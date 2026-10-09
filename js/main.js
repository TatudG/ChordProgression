/* Akkord-Progressionen
   Rechnet eine Progression (Stufen oder Akkordsymbole) in eine gewählte Tonart um
   und zeichnet zu jedem Akkord eine Klaviertastatur über zwei Oktaven. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     1. Musiktheorie-Daten
     --------------------------------------------------------------- */

  var SKALA_DUR = [0, 2, 4, 5, 7, 9, 11];
  var SKALA_MOLL = [0, 2, 3, 5, 7, 8, 10];

  /* Leitereigene Dreiklänge, 1. bis 7. Stufe.
     Moll ist hier als Dur-/Moll-Mischung angesetzt: 5. Stufe als Dur
     (harmonisch) und 7. Stufe als Dur (natürlich) – so wird Moll in Pop
     und Rock tatsächlich gespielt. */
  var STUFEN_QUALITAET_DUR  = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
  var STUFEN_QUALITAET_MOLL = ['min', 'dim', 'maj', 'min', 'maj', 'maj', 'maj'];

  /* Leitereigene Septakkorde – für den Umschalter „Septakkorde ergänzen“ */
  var STUFEN_SEPT_DUR  = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'];
  var STUFEN_SEPT_MOLL = ['m7', 'm7b5', 'maj7', 'm7', '7', 'maj7', '7'];

  var ROEMISCH = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  /* Tonbuchstaben in Terzenschichtung: C D E F G A B */
  var BUCHSTABEN = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  var BUCHSTABE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  /* Jeder Akkordtyp kennt vier Dinge:
       intervalle  – Halbtonabstände ab dem Grundton
       suffix      – Schreibweise hinter dem Grundton, z. B. "Am7"
       stufeSuffix – Schreibweise hinter der römischen Ziffer, z. B. "vii°7"
       klein       – wird die römische Ziffer kleingeschrieben? */
  var AKKORDTYPEN = {
    maj:   { intervalle: [0, 4, 7],                    suffix: '',       stufeSuffix: '',      klein: false },
    min:   { intervalle: [0, 3, 7],                    suffix: 'm',      stufeSuffix: '',      klein: true  },
    dim:   { intervalle: [0, 3, 6],                    suffix: '°',      stufeSuffix: '°',     klein: true  },
    aug:   { intervalle: [0, 4, 8],                    suffix: '+',      stufeSuffix: '+',     klein: false },
    sus2:  { intervalle: [0, 2, 7],                    suffix: 'sus2',   stufeSuffix: 'sus2',  klein: false },
    sus4:  { intervalle: [0, 5, 7],                    suffix: 'sus4',   stufeSuffix: 'sus4',  klein: false },
    '5':   { intervalle: [0, 7],                       suffix: '5',      stufeSuffix: '5',     klein: false },
    '6':   { intervalle: [0, 4, 7, 9],                 suffix: '6',      stufeSuffix: '6',     klein: false },
    m6:    { intervalle: [0, 3, 7, 9],                 suffix: 'm6',     stufeSuffix: '6',     klein: true  },
    '7':   { intervalle: [0, 4, 7, 10],                suffix: '7',      stufeSuffix: '7',     klein: false },
    maj7:  { intervalle: [0, 4, 7, 11],                suffix: 'maj7',   stufeSuffix: 'maj7',  klein: false },
    m7:    { intervalle: [0, 3, 7, 10],                suffix: 'm7',     stufeSuffix: '7',     klein: true  },
    m7b5:  { intervalle: [0, 3, 6, 10],                suffix: 'm7♭5',   stufeSuffix: 'ø7',    klein: true  },
    /* Die 9 Halbtöne sind beim Verminderten die verminderte Septime,
       nicht die Sexte – deshalb hier ein eigener Buchstabenschritt. */
    dim7:  { intervalle: [0, 3, 6, 9], schritte: [0, 2, 4, 6], suffix: '°7', stufeSuffix: '°7', klein: true },
    add9:  { intervalle: [0, 4, 7, 14],                suffix: 'add9',   stufeSuffix: 'add9',  klein: false },
    madd9: { intervalle: [0, 3, 7, 14],                suffix: 'm(add9)', stufeSuffix: 'add9', klein: true  },
    '9':   { intervalle: [0, 4, 7, 10, 14],            suffix: '9',      stufeSuffix: '9',     klein: false },
    maj9:  { intervalle: [0, 4, 7, 11, 14],            suffix: 'maj9',   stufeSuffix: 'maj9',  klein: false },
    m9:    { intervalle: [0, 3, 7, 10, 14],            suffix: 'm9',     stufeSuffix: '9',     klein: true  },
    '11':  { intervalle: [0, 4, 7, 10, 14, 17],        suffix: '11',     stufeSuffix: '11',    klein: false },
    m11:   { intervalle: [0, 3, 7, 10, 14, 17],        suffix: 'm11',    stufeSuffix: '11',    klein: true  },
    '13':  { intervalle: [0, 4, 7, 10, 14, 17, 21],    suffix: '13',     stufeSuffix: '13',    klein: false },
    m13:   { intervalle: [0, 3, 7, 10, 14, 17, 21],    suffix: 'm13',    stufeSuffix: '13',    klein: true  },

    /* Quartvorhalte und alterierte Dominanten */
    '7sus4': { intervalle: [0, 5, 7, 10],              suffix: '7sus4',  stufeSuffix: '7sus4', klein: false },
    '7b5':   { intervalle: [0, 4, 6, 10],              suffix: '7♭5',    stufeSuffix: '7♭5',   klein: false },
    '7#5':   { intervalle: [0, 4, 8, 10],              suffix: '7♯5',    stufeSuffix: '7♯5',   klein: false },
    '7b9':   { intervalle: [0, 4, 7, 10, 13],          suffix: '7♭9',    stufeSuffix: '7♭9',   klein: false },
    '7#9':   { intervalle: [0, 4, 7, 10, 15],          suffix: '7♯9',    stufeSuffix: '7♯9',   klein: false },
    '69':    { intervalle: [0, 4, 7, 9, 14],           suffix: '6/9',    stufeSuffix: '6/9',   klein: false },
    m69:     { intervalle: [0, 3, 7, 9, 14],           suffix: 'm6/9',   stufeSuffix: '6/9',   klein: true  },
    m7b9:    { intervalle: [0, 3, 7, 10, 13],          suffix: 'm7♭9',   stufeSuffix: '7♭9',   klein: true  },
    'm7#5':  { intervalle: [0, 3, 8, 10],              suffix: 'm7♯5',   stufeSuffix: '7♯5',   klein: true  },
    /* Moll-Dur-Sept: kleines Dreieck über dem Mollakkord */
    mMaj7:   { intervalle: [0, 3, 7, 11],              suffix: 'm(maj7)', stufeSuffix: 'maj7',  klein: true  }
  };

  /* Zu jedem Halbtonintervall gehört ein Buchstabenschritt ab dem Grundton.
     Nur so entstehen korrekte Namen wie B–D–F♯ statt B–D–G♭. */
  var INTERVALL_SCHRITT = {
    0: 0, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4, 7: 4, 8: 4,
    9: 5, 10: 6, 11: 6, 13: 1, 14: 1, 15: 1, 17: 3, 21: 5
  };

  /* Verschiedene Schreibweisen, die auf einen Akkordtyp zeigen.
     Der längste passende Eintrag gewinnt ("maj7" vor "maj", "m7b5" vor "m7"). */
  var SUFFIX_ZUORDNUNG = {
    '': 'maj', 'maj': 'maj', 'major': 'maj', 'M': 'maj', 'dur': 'maj',
    'm': 'min', 'min': 'min', 'minor': 'min', 'moll': 'min', '-': 'min',
    'dim': 'dim', 'o': 'dim', '°': 'dim',
    'aug': 'aug', '+': 'aug',
    'sus2': 'sus2', 'sus4': 'sus4', 'sus': 'sus4',
    '5': '5',
    '6': '6', 'm6': 'm6', 'min6': 'm6',
    '7': '7', 'dom7': '7',
    'maj7': 'maj7', 'M7': 'maj7', 'j7': 'maj7', 'Δ': 'maj7', 'Δ7': 'maj7',
    'm7': 'm7', 'min7': 'm7',
    'm7b5': 'm7b5', 'm7♭5': 'm7b5', 'ø': 'm7b5', 'ø7': 'm7b5', 'min7b5': 'm7b5',
    'dim7': 'dim7', 'o7': 'dim7', '°7': 'dim7',
    'add9': 'add9', 'add2': 'add9',
    'madd9': 'madd9', 'm(add9)': 'madd9', 'minadd9': 'madd9',
    '9': '9', 'maj9': 'maj9', 'M9': 'maj9', 'm9': 'm9', 'min9': 'm9',
    '11': '11', 'maj11': '11', 'm11': 'm11', 'min11': 'm11',
    '13': '13', 'maj13': '13', 'm13': 'm13', 'min13': 'm13',
    '7sus4': '7sus4', '7sus': '7sus4',
    '7b5': '7b5', '7♭5': '7b5',
    '7#5': '7#5', '7♯5': '7#5', 'aug7': '7#5',
    '7b9': '7b9', '7♭9': '7b9',
    '7#9': '7#9', '7♯9': '7#9',
    'm7b9': 'm7b9', 'm7♭9': 'm7b9',
    'm7#5': 'm7#5', 'm7♯5': 'm7#5',
    '6/9': '69', '69': '69', 'm6/9': 'm69', 'm69': 'm69',
    'mmaj7': 'mMaj7', 'm(maj7)': 'mMaj7', 'minmaj7': 'mMaj7', 'mM7': 'mMaj7',
    'mΔ7': 'mMaj7', 'mΔ': 'mMaj7', '-Δ7': 'mMaj7',
    '-6': 'm6', '-7': 'm7', '-9': 'm9', '-11': 'm11', '-13': 'm13'
  };

  /* Wird eine römische Ziffer klein geschrieben, ist der Akkord moll,
     groß geschrieben Dur. Diese Tabellen rechnen um. */
  var GROSS_ZU_KLEIN = {
    maj: 'min', '6': 'm6', '7': 'm7', maj7: 'm7', add9: 'madd9',
    '9': 'm9', maj9: 'm9', '11': 'm11', '13': 'm13',
    '69': 'm69', '7b5': 'm7b5', '7b9': 'm7b9'
  };
  var KLEIN_ZU_GROSS = {
    min: 'maj', m6: '6', m7: '7', m7b5: '7', madd9: 'add9',
    m9: '9', m11: '11', m13: '13',
    m69: '69', m7b9: '7b9'
  };

  /* Notennamen in zwei Schreibweisen. Im Deutschen ist "B" der Ton, den
     andere Sprachen B♭ nennen; das englische B heißt dort "H". */
  var notenStil = 'international';
  var septAkkorde = false;
  var griffModus = false;

  function notenName(buchstabe, vorzeichen) {
    if (notenStil === 'deutsch' && buchstabe === 'B') {
      if (vorzeichen === 0) { return 'H'; }
      if (vorzeichen === -1) { return 'B'; }
    }
    var zeichen = '';
    if (vorzeichen > 0) { zeichen = new Array(vorzeichen + 1).join('♯'); }
    if (vorzeichen < 0) { zeichen = new Array(-vorzeichen + 1).join('♭'); }
    return buchstabe + zeichen;
  }

  /* Tonarten in chromatischer Reihenfolge. "buchstabe" ist der Tonbuchstabe
     (für die Schreibweise der Akkordtöne), "be" nur die Grundeinstellung.
     Die Beschriftung entsteht daraus zur Anzeigezeit. */
  function tonart(id, buchstabe, grundton, moll, be) {
    return { id: id, buchstabe: buchstabe, grundton: grundton, moll: moll, be: be };
  }

  var TONARTEN = [
    tonart('C-Dur',   'C', 0,  false, false),
    tonart('Db-Dur',  'D', 1,  false, true),
    tonart('D-Dur',   'D', 2,  false, false),
    tonart('Eb-Dur',  'E', 3,  false, true),
    tonart('E-Dur',   'E', 4,  false, false),
    tonart('F-Dur',   'F', 5,  false, true),
    tonart('Gb-Dur',  'G', 6,  false, true),
    tonart('G-Dur',   'G', 7,  false, false),
    tonart('Ab-Dur',  'A', 8,  false, true),
    tonart('A-Dur',   'A', 9,  false, false),
    tonart('Bb-Dur',  'B', 10, false, true),
    tonart('B-Dur',   'B', 11, false, false),

    tonart('C-Moll',   'C', 0,  true, true),
    tonart('Cis-Moll', 'C', 1,  true, false),
    tonart('D-Moll',   'D', 2,  true, true),
    tonart('Eb-Moll',  'E', 3,  true, true),
    tonart('E-Moll',   'E', 4,  true, false),
    tonart('F-Moll',   'F', 5,  true, true),
    tonart('Fis-Moll', 'F', 6,  true, false),
    tonart('G-Moll',   'G', 7,  true, true),
    tonart('Gis-Moll', 'G', 8,  true, false),
    tonart('A-Moll',   'A', 9,  true, false),
    tonart('Bb-Moll',  'B', 10, true, true),
    tonart('B-Moll',   'B', 11, true, false)
  ];

  /* Vorlagen. Die Stufen stehen in der Schreibweise, die auch die
     Groß-/Kleinschreibung auswertet. */
  var VORLAGEN = [
    /* --- Dur, Dreiklänge --- */
    { gruppe: 'Dur',   label: 'I–V–vi–IV',    stufen: 'I V vi IV',              info: 'Pop-Klassiker' },
    { gruppe: 'Dur',   label: 'vi–IV–I–V',    stufen: 'vi IV I V',              info: 'Pop, beginnt auf der 6. Stufe' },
    { gruppe: 'Dur',   label: 'I–vi–IV–V',    stufen: 'I vi IV V',              info: '50er-Jahre / Doo-Wop' },
    { gruppe: 'Dur',   label: 'I–IV–V–I',     stufen: 'I IV V I',               info: 'Kadenz' },
    { gruppe: 'Dur',   label: 'I–V–IV–I',     stufen: 'I V IV I',               info: 'Rock' },
    { gruppe: 'Dur',   label: 'I–iii–IV–V',   stufen: 'I iii IV V',             info: 'aufsteigend' },
    { gruppe: 'Dur',   label: 'I–IV–vi–V',    stufen: 'I IV vi V',              info: 'Pop-Ballade' },
    { gruppe: 'Dur',   label: 'I–iii–vi–IV',  stufen: 'I iii vi IV',            info: 'Pop-Ballade, 3. statt 5. Stufe' },
    { gruppe: 'Dur',   label: 'Kanon',        stufen: 'I V vi iii IV I IV V',   info: 'Pachelbel' },
    /* --- Moll, Dreiklänge --- */
    { gruppe: 'Moll',  label: 'i–VI–III–VII', stufen: 'i VI III VII',           info: 'Moll-Pop' },
    { gruppe: 'Moll',  label: 'i–iv–VII–III', stufen: 'i iv VII III',           info: 'Moll' },
    { gruppe: 'Moll',  label: 'i–VI–iv–V',    stufen: 'i VI iv V',              info: 'Moll-Ballade' },
    { gruppe: 'Moll',  label: 'i–VII–VI–V',   stufen: 'i VII VI V',             info: 'Andalusische Kadenz' },
    { gruppe: 'Moll',  label: 'i–iv–v–i',     stufen: 'i iv v i',               info: 'Moll-Kadenz (natürlich)' },
    { gruppe: 'Moll',  label: 'i–III–VII–VI', stufen: 'i III VII VI',           info: 'absteigend' },
    { gruppe: 'Moll',  label: 'i–v–VI–IV',    stufen: 'i v VI IV',              info: 'Moll-Pop, ohne Leitton' },
    /* --- Septakkorde --- */
    { gruppe: 'Septakkorde', label: 'ii7–V7–Imaj7',   stufen: 'ii7 V7 Imaj7',        info: 'Jazz-Kadenz' },
    { gruppe: 'Septakkorde', label: 'Imaj7–vi7–ii7–V7', stufen: 'Imaj7 vi7 ii7 V7',  info: 'Turnaround' },
    { gruppe: 'Septakkorde', label: 'Imaj7–IVmaj7–iii7–vi7', stufen: 'Imaj7 IVmaj7 iii7 vi7', info: 'Pop mit Septen' },
    { gruppe: 'Septakkorde', label: 'Imaj7–ii7–V7–I6', stufen: 'Imaj7 ii7 V7 I6',   info: 'mit Sextschluss' },
    { gruppe: 'Septakkorde', label: 'iii7–vi7–ii7–V7', stufen: 'iii7 vi7 ii7 V7',  info: 'Kette über die 3. Stufe' },
    { gruppe: 'Septakkorde', label: 'i7–iv7–VII7–III7', stufen: 'i7 iv7 VII7 III7', info: 'Moll mit Septen' },
    { gruppe: 'Septakkorde', label: 'Imaj7–I7',       stufen: 'Imaj7 I7',            info: 'Dur-Sept zur Dominantsept' },
    { gruppe: 'Septakkorde', label: 'V7sus4–V7–I',    stufen: 'V7sus4 V7 I',         info: 'Vorhalt löst sich auf' },
    /* --- Jazz --- */
    { gruppe: 'Jazz',  label: 'Imaj7–VI7–ii7–V7',  stufen: 'Imaj7 VI7 ii7 V7',      info: 'Rhythm Changes, A-Teil' },
    { gruppe: 'Jazz',  label: 'iii7–VI7–ii7–V7',   stufen: 'iii7 VI7 ii7 V7',       info: 'Kette abwärts' },
    { gruppe: 'Jazz',  label: 'ii7–V7–I6/9',       stufen: 'ii7 V7 I6/9',           info: 'Schluss mit Sext-Non-Akkord' },
    { gruppe: 'Jazz',  label: 'iiø7–V7–i7',        stufen: 'iiø7 V7 i7',            info: 'Moll-Kadenz' },
    { gruppe: 'Jazz',  label: 'Imaj7–VI7–II7–V7',  stufen: 'Imaj7 VI7 II7 V7',      info: 'Dominantkette über den Quintfall' },
    { gruppe: 'Jazz',  label: 'V7♭9 – Imaj7',      stufen: 'V7♭9 Imaj7',            info: 'alterierte Dominante' },
    /* --- Blues --- */
    { gruppe: 'Blues', label: '12-Takt-Blues',      stufen: 'I I I I IV IV I I V IV I V',       info: 'Dreiklänge' },
    { gruppe: 'Blues', label: '12-Takt-Blues (7)',  stufen: 'I7 I7 I7 I7 IV7 IV7 I7 I7 V7 IV7 I7 V7', info: 'mit Septakkorden' },
    { gruppe: 'Blues', label: 'Moll-Blues (8 Takte)', stufen: 'i7 i7 i7 i7 iv7 iv7 i7 V7',      info: 'kurz, mit Septen' },
    /* --- Basslinie / Slash-Akkorde --- */
    { gruppe: 'Basslinie', label: 'Bass abwärts',  stufen: 'I I/VII vi I/V',        info: 'C – C/B – Am – C/G' },
    { gruppe: 'Basslinie', label: 'Bass aufwärts', stufen: 'I I/3 IV I/5',          info: 'C – C/E – F – C/G' },
    { gruppe: 'Basslinie', label: 'Bass abwärts (Moll)', stufen: 'i i/VII VI V',   info: 'Am – Am/G – F – E' },
    { gruppe: 'Basslinie', label: 'Bass zur Tonika', stufen: 'V/7 V I/3 I',       info: 'G/B – G – C/E – C' }
  ];

  /* ---------------------------------------------------------------
     2. Anzeige-Helfer
     --------------------------------------------------------------- */

  function tonartLabel(ta) {
    var name = akkordGrundtonName(ta.buchstabe, ta.grundton);
    return (ta.moll ? name.toLowerCase() : name) + (ta.moll ? '-Moll' : '-Dur');
  }

  /* Grundton korrekt benennen: B♭ statt A♯, und im Deutschen B/H tauschen */
  function akkordGrundtonName(buchstabe, pc) {
    var versatz = pc - BUCHSTABE_PC[buchstabe];
    while (versatz > 2) { versatz -= 12; }
    while (versatz < -2) { versatz += 12; }
    return notenName(buchstabe, versatz);
  }

  function skalaVon(ta) { return ta.moll ? SKALA_MOLL : SKALA_DUR; }

  /* ---------------------------------------------------------------
     2b. Vorzeichen und verwandte Tonart
     --------------------------------------------------------------- */

  /* Anzahl der Vorzeichen je Dur-Grundton nach dem Quintenzirkel:
     positiv = ♯, negativ = ♭. Index ist der Halbton (0 = C).
     Eine Moll-Tonart hat die Vorzeichen der Dur-Tonart eine kleine Terz
     höher – c-Moll also die drei ♭ von E♭-Dur. */
  var VORZEICHEN_NACH_QUINTEN = [0, -5, 2, -3, 4, -1, -6, 1, -4, 3, -2, 5];

  /* Reihenfolge, in der die Vorzeichen gesetzt werden */
  var REIHE_KREUZ = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
  var REIHE_FLACH = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

  function vorzeichenVon(ta) {
    var durGrundton = ta.moll ? (ta.grundton + 3) % 12 : ta.grundton;
    var anzahl = VORZEICHEN_NACH_QUINTEN[durGrundton];
    var namen = [];
    var i;
    if (anzahl > 0) {
      for (i = 0; i < anzahl; i++) { namen.push(notenName(REIHE_KREUZ[i], 1)); }
    } else {
      for (i = 0; i < -anzahl; i++) { namen.push(notenName(REIHE_FLACH[i], -1)); }
    }
    return { anzahl: anzahl, namen: namen };
  }

  /* Die Tonart mit denselben Vorzeichen: zu einer Dur-Tonart die Moll-Tonart
     eine kleine Terz tiefer, zu einer Moll-Tonart die Dur-Tonart eine kleine
     Terz höher. */
  function verwandteTonart(ta) {
    var zielGrundton = (ta.moll ? ta.grundton + 3 : ta.grundton + 9) % 12;
    for (var i = 0; i < TONARTEN.length; i++) {
      if (TONARTEN[i].moll !== ta.moll && TONARTEN[i].grundton === zielGrundton) {
        return TONARTEN[i];
      }
    }
    return null;
  }

  /* "3 ♭ (B♭ E♭ A♭) · gleiche Vorzeichen wie E♭-Dur" */
  function vorzeichenSatz(ta) {
    var vorzeichen = vorzeichenVon(ta);
    var text = vorzeichen.anzahl === 0
      ? 'keine Vorzeichen'
      : Math.abs(vorzeichen.anzahl) + ' ' + (vorzeichen.anzahl > 0 ? '♯' : '♭') +
        ' (' + vorzeichen.namen.join(' ') + ')';

    var partner = verwandteTonart(ta);
    if (partner) { text += ' · gleiche Vorzeichen wie ' + tonartLabel(partner); }
    return text;
  }

  /* ---------------------------------------------------------------
     2c. Dieselben Vorzeichen als Notenbild
     --------------------------------------------------------------- */

  /* Schlüssel, Kreuze und Be sind gezeichnet statt getippt: die Seite lädt
     keine Schriftart nach, und die Zeichen der Systemschrift sehen auf jedem
     Gerät anders aus. Alle Maße sind Vielfache von S, dem Abstand zweier
     Notenlinien – so stimmt das Bild in jeder Größe. Ausgangspunkt ist die
     G-Linie des Violinschlüssels (zweite Linie von unten), y zeigt nach
     unten.

     Lage eines Vorzeichens: 0 = unterste Linie, 1 = erster Zwischenraum,
     2 = zweite Linie und so weiter. Die Reihenfolge ist die des
     Quintenzirkels, die Lagen sind die des Violinschlüssels – F♯ sitzt auf
     der obersten Linie, B♭ auf der Mittellinie. */
  var LAGE_KREUZ = [8, 5, 9, 6, 3, 7, 4];
  var LAGE_FLACH = [4, 7, 3, 6, 1, 5, 8];

  /* Violinschlüssel: ein kräftiger Stiel mit Fuß und eine feinere Schleife,
     die oben umklappt und unten die G-Linie umschließt. */
  function schluesselZeichnung(x0, yG, S) {
    function X(u) { return (x0 + u * S).toFixed(1); }
    function Y(v) { return (yG + v * S).toFixed(1); }
    var gruppe = svgElement('g', {
      fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round'
    });

    gruppe.appendChild(svgElement('path', {
      d: 'M ' + X(0) + ' ' + Y(-2.6) +
         ' C ' + X(-0.08) + ' ' + Y(-1.2) + ' ' + X(-0.08) + ' ' + Y(0.6) +
         ' ' + X(-0.08) + ' ' + Y(1.75) +
         ' C ' + X(-0.08) + ' ' + Y(2.2) + ' ' + X(-0.45) + ' ' + Y(2.45) +
         ' ' + X(-0.75) + ' ' + Y(2.3),
      'stroke-width': 0.46 * S
    }));

    gruppe.appendChild(svgElement('path', {
      d: 'M ' + X(0) + ' ' + Y(-2.6) +
         ' C ' + X(-0.6) + ' ' + Y(-2.85) + ' ' + X(-0.95) + ' ' + Y(-3.25) +
         ' ' + X(-0.7) + ' ' + Y(-3.6) +
         ' C ' + X(-0.45) + ' ' + Y(-3.95) + ' ' + X(0.2) + ' ' + Y(-4.0) +
         ' ' + X(0.65) + ' ' + Y(-3.55) +
         ' C ' + X(1.05) + ' ' + Y(-3.1) + ' ' + X(1.0) + ' ' + Y(-2.35) +
         ' ' + X(0.6) + ' ' + Y(-1.7) +
         ' C ' + X(0.2) + ' ' + Y(-1.05) + ' ' + X(-0.35) + ' ' + Y(-0.75) +
         ' ' + X(-0.55) + ' ' + Y(0.0) +
         ' C ' + X(-0.7) + ' ' + Y(0.42) + ' ' + X(-0.3) + ' ' + Y(0.85) +
         ' ' + X(0.2) + ' ' + Y(0.72) +
         ' C ' + X(0.76) + ' ' + Y(0.58) + ' ' + X(0.95) + ' ' + Y(-0.05) +
         ' ' + X(0.55) + ' ' + Y(-0.55) +
         ' C ' + X(0.25) + ' ' + Y(-0.92) + ' ' + X(-0.25) + ' ' + Y(-0.88) +
         ' ' + X(-0.4) + ' ' + Y(-0.5),
      'stroke-width': 0.3 * S
    }));

    return gruppe;
  }

  /* Kreuz: zwei parallele Senkrechte, zwei Querbalken, die nach rechts oben
     laufen. */
  function kreuzZeichnung(x, y, S) {
    var h = 1.12 * S, b = 0.42 * S;
    var gruppe = svgElement('g', {
      fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round',
      'stroke-width': 0.15 * S
    });
    [[-0.15, -0.2], [0.19, 0.14]].forEach(function (paar) {
      gruppe.appendChild(svgElement('line', {
        x1: x + paar[0] * S, y1: y - h, x2: x + paar[1] * S, y2: y + h
      }));
    });
    [[0.28, -0.04], [0.68, 0.36]].forEach(function (balken) {
      gruppe.appendChild(svgElement('line', {
        x1: x - b, y1: y + balken[0] * S, x2: x + b, y2: y + balken[1] * S
      }));
    });
    return gruppe;
  }

  /* Be: ein Stiel, an dem unten ein gefüllter Bauch hängt. */
  function beZeichnung(x, y, S) {
    var gruppe = svgElement('g', { stroke: 'currentColor', 'stroke-linecap': 'round' });
    var stiel = x - 0.3 * S, unten = y + 0.78 * S;
    gruppe.appendChild(svgElement('line', {
      x1: stiel, y1: y - 1.32 * S, x2: stiel, y2: unten, 'stroke-width': 0.15 * S
    }));
    gruppe.appendChild(svgElement('path', {
      d: 'M ' + stiel + ' ' + unten +
         ' C ' + (x + 0.42 * S) + ' ' + (y + 0.86 * S) + ' ' + (x + 0.78 * S) + ' ' + (y + 0.28 * S) +
         ' ' + (x + 0.66 * S) + ' ' + (y - 0.18 * S) +
         ' C ' + (x + 0.56 * S) + ' ' + (y - 0.52 * S) + ' ' + (x + 0.1 * S) + ' ' + (y - 0.42 * S) +
         ' ' + (x - 0.08 * S) + ' ' + (y - 0.05 * S) + ' Z',
      fill: 'currentColor'
    }));
    return gruppe;
  }

  function vorzeichenBild(ta) {
    var vorzeichen = vorzeichenVon(ta);
    var anzahl = Math.abs(vorzeichen.anzahl);
    var S = 10;                       /* Abstand der Notenlinien im Bild */
    var links = 2.2 * S;              /* Platz für den Schlüssel davor */
    var erste = links + 1.75 * S;     /* erstes Vorzeichen hinter dem Schlüssel */
    var schritt = 1.2 * S;
    var oben = 4.6 * S;               /* Rand über der obersten Linie */
    var boden = oben + 4 * S;         /* unterste Linie */
    var breite = erste + anzahl * schritt + 1.1 * S;
    var hoehe = oben + 4 * S + 1.8 * S;

    var svg = svgElement('svg', {
      viewBox: '0 0 ' + breite.toFixed(1) + ' ' + hoehe.toFixed(1),
      'class': 'notenbild',
      role: 'img',
      'aria-label': 'Notenbild: Violinschlüssel ' + (anzahl === 0
        ? 'ohne Vorzeichen'
        : 'mit ' + anzahl + ' Vorzeichen (' + vorzeichen.namen.join(' ') + ')')
    });

    for (var i = 0; i < 5; i++) {
      svg.appendChild(svgElement('line', {
        x1: 0, y1: oben + i * S, x2: breite.toFixed(1), y2: oben + i * S,
        stroke: 'currentColor', 'stroke-width': 0.12 * S
      }));
    }

    svg.appendChild(schluesselZeichnung(links, oben + 2 * S, S));

    var lagen = vorzeichen.anzahl > 0 ? LAGE_KREUZ : LAGE_FLACH;
    var zeichne = vorzeichen.anzahl > 0 ? kreuzZeichnung : beZeichnung;
    for (i = 0; i < anzahl; i++) {
      svg.appendChild(zeichne(
        erste + i * schritt,
        boden - lagen[i] * S / 2,
        S
      ));
    }

    return svg;
  }

  function leitereigenerTyp(index, ta) {
    return (ta.moll ? STUFEN_QUALITAET_MOLL : STUFEN_QUALITAET_DUR)[index];
  }

  /* Leitereigene Septime zu einer Stufe. Schreibt die Stufe Dur, wo die
     Tonart Moll hätte (etwa "VI" in C-Dur), wird die Dominantseptime
     gesetzt – das ergibt den üblichen Zwischendominant. */
  function septVon(index, ta, gross) {
    var leiter = (ta.moll ? STUFEN_SEPT_MOLL : STUFEN_SEPT_DUR)[index];
    var dreiklang = leitereigenerTyp(index, ta);

    if (gross === null) { return leiter; }          /* Ziffer: ganz leitereigen */
    if (gross) { return dreiklang === 'maj' ? leiter : '7'; }
    return dreiklang === 'min' ? leiter : (dreiklang === 'dim' ? 'm7b5' : 'm7');
  }

  function findeAkkordtyp(rest) {
    if (Object.prototype.hasOwnProperty.call(SUFFIX_ZUORDNUNG, rest)) {
      return SUFFIX_ZUORDNUNG[rest];
    }
    var schluessel = Object.keys(SUFFIX_ZUORDNUNG).sort(function (a, b) {
      return b.length - a.length;
    });
    for (var i = 0; i < schluessel.length; i++) {
      if (schluessel[i] && rest.indexOf(schluessel[i]) === 0) {
        return SUFFIX_ZUORDNUNG[schluessel[i]];
      }
    }
    return null;
  }

  /* ---------------------------------------------------------------
     3. Progression lesen
     --------------------------------------------------------------- */

  /* Ein einzelner Tonname: "C", "F♯", "B♭", im Deutschen auch "H".
     Ergibt Tonbuchstabe, Vorzeichen und Halbtonklasse. */
  function parseTonbuchstabe(text) {
    var treffer = /^([A-Ga-gHh])([#♯b♭]?)$/.exec(text);
    if (!treffer) { return null; }

    var geschrieben = treffer[1].toUpperCase();
    var buchstabe = geschrieben === 'H' ? 'B' : geschrieben; /* deutsches H = englisches B */

    var zeichen = treffer[2];
    var vorzeichen = 0;
    if (zeichen === '#' || zeichen === '♯') { vorzeichen = 1; }
    if (zeichen === 'b' || zeichen === '♭') { vorzeichen = -1; }
    /* In deutscher Schreibweise ist ein geschriebenes "B" das englische B♭ –
       das gilt nur für "B", nicht für das zu "B" gewordene "H". */
    if (notenStil === 'deutsch' && geschrieben === 'B' && zeichen === '') { vorzeichen = -1; }

    return {
      buchstabe: buchstabe,
      vorzeichen: vorzeichen,
      grundton: ((BUCHSTABE_PC[buchstabe] + vorzeichen) % 12 + 12) % 12
    };
  }

  /* Grundton einer Stufe: Buchstabe einen Schritt weiter in der Tonleiter,
     Halbtonklasse aus der Skala der Tonart. */
  function stufenGrundton(index, vorzeichen, ta) {
    return {
      buchstabe: BUCHSTABEN[(BUCHSTABEN.indexOf(ta.buchstabe) + index) % 7],
      vorzeichen: vorzeichen,
      grundton: (((ta.grundton + skalaVon(ta)[index] + vorzeichen) % 12) + 12) % 12
    };
  }

  /* Akkordsymbol wie "Am7", "Cmaj7", "F♯dim" in Grundton + Typ zerlegen */
  function parseAkkordsymbol(text) {
    var treffer = /^([A-Ga-gHh][#♯b♭]?)(.*)$/.exec(text);
    if (!treffer) { return null; }

    var ton = parseTonbuchstabe(treffer[1]);
    if (!ton) { return null; }

    var rest = treffer[2].replace(/[\s()]/g, '');
    var typ = findeAkkordtyp(rest);
    if (!typ) { return null; }

    ton.typ = typ;
    return ton;
  }

  /* Stufenangabe wie "IV", "bVII", "vi", "2" oder "V7" zerlegen.
     Bei römischen Ziffern entscheidet die Groß-/Kleinschreibung über Dur
     oder Moll; ein angehängter Zusatz ("7", "maj7", "°") hat Vorrang. */
  function parseStufe(text, ta) {
    /* Bewusst ohne "i"-Flag: nur ein kleines "b" ist ein Erniedrigungszeichen.
       Sonst würde "B7" als tiefalterierte 7. Stufe gelesen statt als B-Dur-Sept. */
    var treffer = /^([#♯b♭]?)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i|[1-7])(.*)$/.exec(text);
    if (!treffer) { return null; }

    var zeichen = treffer[1];
    var rohstufe = treffer[2];
    var rest = treffer[3].replace(/[\s()]/g, '');

    var istZahl = /^[1-7]$/.test(rohstufe);
    var index;
    var gross = null; /* null = Schreibweise sagt nichts über Dur/Moll aus */

    if (istZahl) {
      index = parseInt(rohstufe, 10) - 1;
    } else {
      var geschrieben = text.replace(/^[#♯b♭]/, '').slice(0, rohstufe.length);
      index = ROEMISCH.indexOf(geschrieben.toUpperCase());
      if (index === -1) { return null; }
      gross = geschrieben === geschrieben.toUpperCase();
    }

    var typ;
    if (rest) {
      typ = findeAkkordtyp(rest);
      if (!typ) { return null; }
      if (gross === true && KLEIN_ZU_GROSS[typ]) { typ = KLEIN_ZU_GROSS[typ]; }
      if (gross === false && GROSS_ZU_KLEIN[typ]) { typ = GROSS_ZU_KLEIN[typ]; }
    } else if (septAkkorde) {
      typ = septVon(index, ta, gross);
    } else if (gross === null) {
      typ = leitereigenerTyp(index, ta);
    } else {
      typ = gross ? 'maj' : 'min';
    }

    var vorzeichen = 0;
    if (zeichen === '#' || zeichen === '♯') { vorzeichen = 1; }
    if (zeichen === 'b' || zeichen === '♭') { vorzeichen = -1; }

    var ton = stufenGrundton(index, vorzeichen, ta);
    ton.typ = typ;
    ton.stufe = index + 1;
    return ton;
  }

  /* Basston eines Slash-Akkords. Erlaubt sind Tonnamen ("C/G") und Stufen
     ("I/VII") – die Stufe ist praktisch, weil eine Vorlage damit in jeder
     Tonart funktioniert. */
  function parseBass(text, ta) {
    var ton = parseTonbuchstabe(text);
    if (ton) { return ton; }

    var treffer = /^([#♯b♭]?)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i|[1-7])$/.exec(text);
    if (!treffer) { return null; }

    var vorzeichen = 0;
    if (treffer[1] === '#' || treffer[1] === '♯') { vorzeichen = 1; }
    if (treffer[1] === 'b' || treffer[1] === '♭') { vorzeichen = -1; }

    var rohstufe = treffer[2];
    var index = /^[1-7]$/.test(rohstufe)
      ? parseInt(rohstufe, 10) - 1
      : ROEMISCH.indexOf(rohstufe.toUpperCase());
    if (index === -1) { return null; }

    return stufenGrundton(index, vorzeichen, ta);
  }

  /* Slash-Akkord in Akkord und Basston trennen. "C6/9" ist keiner: dort steht
     hinter dem Schrägstrich keine Tonangabe, das bleibt ein Akkordzusatz. */
  function zerlegeSlash(text) {
    var stelle = text.lastIndexOf('/');
    if (stelle <= 0 || stelle === text.length - 1) { return null; }
    return { oben: text.slice(0, stelle), bass: text.slice(stelle + 1) };
  }

  function parseToken(token, ta) {
    var teile = zerlegeSlash(token);
    if (teile) {
      var oben = parseStufe(teile.oben, ta) || parseAkkordsymbol(teile.oben);
      var bass = parseBass(teile.bass, ta);
      if (oben && bass) {
        oben.bass = bass;
        return oben;
      }
      /* Kein gültiger Basston – dann ist der Schrägstrich Teil des Namens. */
    }
    return parseStufe(token, ta) || parseAkkordsymbol(token);
  }

  /* Aus Grundton + Typ den fertigen Akkord bauen. Die Tonnamen entstehen
     durch Terzenschichtung ab dem Grundtonbuchstaben – dadurch heißt der
     Akkord B–D–F♯ und nicht B–D–G♭. */
  function baueAkkord(rohdaten) {
    var info = AKKORDTYPEN[rohdaten.typ];
    var grundIndex = BUCHSTABEN.indexOf(rohdaten.buchstabe);

    var pcs = [];
    var toene = [];
    var namenNachPc = {};

    info.intervalle.forEach(function (intervall, i) {
      var pc = (((rohdaten.grundton + intervall) % 12) + 12) % 12;
      pcs.push(pc);

      if (namenNachPc[pc]) { return; } /* derselbe Ton schon benannt */

      var schritt = info.schritte ? info.schritte[i] : INTERVALL_SCHRITT[intervall];
      if (schritt === undefined) { schritt = 0; }
      var buchstabe = BUCHSTABEN[(grundIndex + schritt) % 7];

      var versatz = pc - BUCHSTABE_PC[buchstabe];
      while (versatz > 2) { versatz -= 12; }
      while (versatz < -2) { versatz += 12; }

      var name = notenName(buchstabe, versatz);
      namenNachPc[pc] = name;
      toene.push(name);
    });

    var stufe = '';
    if (rohdaten.stufe) {
      var numeral = ROEMISCH[rohdaten.stufe - 1];
      stufe = (info.klein ? numeral.toLowerCase() : numeral) + info.stufeSuffix;
    }

    /* Vorzeichen der Tonart nur, wo der Akkord selbst keins vorgibt */
    var be = rohdaten.vorzeichen < 0 ? true
           : rohdaten.vorzeichen > 0 ? false
           : null;

    /* Welche Töne bestimmen den Klang? Quinte und Undezime dürfen fehlen –
       Gitarrengriffe lassen sie regelmäßig weg, alles andere nicht. */
    var pflicht = [];
    function merkePflicht(iv) {
      var pc = (((rohdaten.grundton + iv) % 12) + 12) % 12;
      if (pflicht.indexOf(pc) === -1) { pflicht.push(pc); }
    }
    info.intervalle.forEach(function (iv) { if (iv !== 7 && iv !== 17) { merkePflicht(iv); } });
    if (pflicht.length === 0) { info.intervalle.forEach(merkePflicht); } /* nur Grundton + Quinte */

    var symbol = akkordGrundtonName(rohdaten.buchstabe, rohdaten.grundton) + info.suffix;
    var bassPc = null;

    /* Basston eines Slash-Akkords: eigener Name, eigene Farbe auf der Tastatur.
       Ist er kein Akkordton (C/B, C/D), kommt er als tiefster Ton dazu. */
    if (rohdaten.bass) {
      bassPc = rohdaten.bass.grundton;
      var bassName = akkordGrundtonName(rohdaten.bass.buchstabe, bassPc);
      symbol += '/' + bassName;
      if (pcs.indexOf(bassPc) === -1) {
        pcs.push(bassPc);
        toene.unshift(bassName);
      }
      if (!namenNachPc[bassPc]) { namenNachPc[bassPc] = bassName; }
    }

    return {
      stufe: stufe,
      symbol: symbol,
      toene: toene,
      pcs: pcs,
      namenNachPc: namenNachPc,
      grundtonPc: rohdaten.grundton,
      bassPc: bassPc,
      pflicht: pflicht,
      typ: rohdaten.typ,
      be: be
    };
  }

  /* Welche Rolle spielt ein Ton in diesem Akkord? Bestimmt die Farbe in
     Klaviatur und Gitarrengriff. */
  function rolle(akkord, pc) {
    if (akkord.bassPc !== null && pc === akkord.bassPc && pc !== akkord.grundtonPc) {
      return 'bass';
    }
    return pc === akkord.grundtonPc ? 'grundton' : 'akkordton';
  }

  /* Name einer Taste ohne Akkordbezug – hier zählt nur die Tonart */
  var ANZEIGE_NAMEN = {
    international: {
      kreuz: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'],
      be:    ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
    },
    deutsch: {
      kreuz: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'H'],
      be:    ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B', 'H']
    }
  };

  function tasteName(pc, be) {
    var namen = ANZEIGE_NAMEN[notenStil];
    return (be ? namen.be : namen.kreuz)[((pc % 12) + 12) % 12];
  }

  /* ---------------------------------------------------------------
     4. Klaviertastatur über zwei Oktaven (C4–B5, MIDI 60–83)
     --------------------------------------------------------------- */

  var WEISSE_TOENE  = [0, 2, 4, 5, 7, 9, 11]; /* Halbtonabstand je weißer Taste */
  var SCHWARZE_NACH = [0, 1, 3, 4, 5];        /* schwarze Taste steht nach dieser weißen */
  var SCHWARZER_TON = [1, 3, 6, 8, 10];
  var ANZAHL_WEISS  = 14;                     /* zwei Oktaven zu je sieben Tasten */

  var T_W = 34;   /* Breite einer weißen Taste */
  var T_H = 116;  /* Höhe der Tastatur */
  var S_W = 21;   /* Breite einer schwarzen Taste */
  var S_H = 72;   /* Höhe einer schwarzen Taste */

  function svgElement(name, attribute) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.keys(attribute).forEach(function (k) { el.setAttribute(k, attribute[k]); });
    return el;
  }

  function buildTastatur(akkord) {
    var svg = svgElement('svg', {
      viewBox: '0 0 ' + (ANZAHL_WEISS * T_W) + ' ' + T_H,
      'class': 'akkord__tastatur',
      role: 'img',
      'aria-label': 'Klaviatur, markiert sind die Töne ' + akkord.toene.join(', ')
    });

    var imAkkord = {};
    akkord.pcs.forEach(function (pc) { imAkkord[pc] = true; });

    /* Namen der markierten Tasten kommen aus dem Akkord selbst,
       damit Liste und Tastatur dieselbe Schreibweise zeigen. */
    function beschriftung(pc) {
      return akkord.namenNachPc[pc] || tasteName(pc, akkord.be);
    }

    /* Grundton und Basston farblich abgesetzt, zweite Oktave schwächer */
    function klasse(pc, untereOktave) {
      var teile = ['is-' + rolle(akkord, pc)];
      if (!untereOktave) { teile.push('is-obere'); }
      return teile.join(' ');
    }

    var weisseBeschriftungen = [];

    /* weiße Tasten */
    for (var i = 0; i < ANZAHL_WEISS; i++) {
      var oktave = Math.floor(i / 7);
      var pc = (60 + oktave * 12 + WEISSE_TOENE[i % 7]) % 12;
      var aktiv = !!imAkkord[pc];

      svg.appendChild(svgElement('rect', {
        x: i * T_W, y: 0, width: T_W, height: T_H,
        'class': 'taste-weiss' + (aktiv ? ' ' + klasse(pc, oktave === 0) : '')
      }));

      var weisse = svgElement('text', {
        x: i * T_W + T_W / 2, y: T_H - 10,
        'class': 'tasten-label' + (aktiv ? ' tasten-label--aktiv' : '')
      });
      weisse.textContent = beschriftung(pc);
      weisseBeschriftungen.push(weisse);
    }

    /* schwarze Tasten liegen darüber */
    for (var o = 0; o < 2; o++) {
      for (var k = 0; k < SCHWARZE_NACH.length; k++) {
        var weissIndex = o * 7 + SCHWARZE_NACH[k];
        var sPc = (60 + o * 12 + SCHWARZER_TON[k]) % 12;
        var sAktiv = !!imAkkord[sPc];

        svg.appendChild(svgElement('rect', {
          x: (weissIndex + 1) * T_W - S_W / 2, y: 0,
          width: S_W, height: S_H, rx: 3,
          'class': 'taste-schwarz' + (sAktiv ? ' ' + klasse(sPc, o === 0) : '')
        }));

        if (sAktiv) {
          var schwarze = svgElement('text', {
            x: (weissIndex + 1) * T_W, y: S_H - 10,
            'class': 'tasten-label tasten-label--aktiv'
          });
          schwarze.textContent = beschriftung(sPc);
          svg.appendChild(schwarze);
        }
      }
    }

    /* weiße Beschriftungen zuletzt, damit sie oben liegen */
    weisseBeschriftungen.forEach(function (t) { svg.appendChild(t); });

    return svg;
  }

  /* ---------------------------------------------------------------
     4b. Gitarrengriff
     --------------------------------------------------------------- */

  /* Leere Saiten von der tiefsten zur höchsten, als MIDI-Nummern (E2 … E4) */
  var SAITEN_MIDI = [40, 45, 50, 55, 59, 64];

  var GRIFF_WEITE    = 4;  /* größter Abstand zwischen zwei gegriffenen Bünden */
  var GRIFF_MAX_BUND = 12; /* weiter oben am Hals wird nicht gesucht */

  function pcAusMidi(midi) { return ((midi % 12) + 12) % 12; }

  /* Die Griffbilder, die man aus jedem Liederbuch kennt, je Akkordtyp und
     Grundton (0 = C … 11 = B). Notiert von der tiefsten zur höchsten Saite,
     'x' heißt „nicht anschlagen". Nur einstellige Bünde – deshalb steht die
     Ziffernfolge als Zeichenkette da.
     Die Suche unten findet für diese Akkorde zwar auch gültige Griffe, aber
     oft ungewohnte; hier steht der Griff, den eine Gitarristin erwartet. */
  var GRIFFBILDER = {
    maj: {
      0:  'x32010', 1:  'x46664', 2:  'xx0232', 3:  'x65343',
      4:  '022100', 5:  '133211', 6:  '244322', 7:  '320003',
      8:  '466544', 9:  'x02220', 10: 'x13331', 11: 'x24442'
    },
    min: {
      0:  'x35543', 1:  'x46654', 2:  'xx0231', 3:  'x68876',
      4:  '022000', 5:  '133111', 6:  '244222', 7:  '355333',
      8:  '466444', 9:  'x02210', 10: 'x13321', 11: 'x24432'
    }
  };

  function musterZuFrets(muster) {
    return muster.split('').map(function (z) { return z === 'x' ? null : parseInt(z, 10); });
  }

  /* Prüft ein Griffmuster aus der Tabelle nach denselben Regeln wie die
     Suche. Dadurch kann ein Tippfehler in der Tabelle keinen falschen Akkord
     erzeugen: passt das Muster nicht, rechnet die Suche selbst weiter. Für
     Slash-Akkorde passt kein Tabellengriff, weil deren Basston ein anderer
     ist – auch dann übernimmt die Suche. */
  function griffPasst(frets, akkord) {
    var imAkkord = {}, zahler = [], klingt = 0, tiefste = null, i, s;
    akkord.pcs.forEach(function (pc) { imAkkord[pc] = true; });
    for (i = 0; i < 12; i++) { zahler[i] = 0; }

    for (s = 0; s < 6; s++) {
      var f = frets[s];
      if (f === null) { continue; }
      var pitch = SAITEN_MIDI[s] + f;
      var pc = pcAusMidi(pitch);
      if (!imAkkord[pc]) { return false; }
      zahler[pc]++;
      klingt++;
      if (tiefste === null || pitch < tiefste) { tiefste = pitch; }
    }
    if (klingt < 3) { return false; }
    for (i = 0; i < akkord.pflicht.length; i++) {
      if (!zahler[akkord.pflicht[i]]) { return false; }
    }
    var erwartet = akkord.bassPc === null ? akkord.grundtonPc : akkord.bassPc;
    return pcAusMidi(tiefste) === erwartet;
  }

  /* Sucht einen greifbaren Griff. Alle Pflicht-Töne müssen klingen, keine
     Saite darf einen akkordfremden Ton spielen, und der Basston muss der
     tiefste klingende Ton sein – nur so stimmt ein Slash-Akkord.
     Unter allen Möglichkeiten gewinnt die bequemste: offene Saiten und tiefe
     Lagen sind angenehmer als ein Barregriff weiter oben am Hals. */
  function sucheGriff(akkord, bassGenau) {
    var imAkkord = {};
    akkord.pcs.forEach(function (pc) { imAkkord[pc] = true; });

    var bassPc = akkord.bassPc === null ? akkord.grundtonPc : akkord.bassPc;

    /* Je Saite kommen nur Bünde infrage, die einen Akkordton treffen */
    var moeglich = SAITEN_MIDI.map(function (midi) {
      var liste = [null];
      for (var f = 0; f <= GRIFF_MAX_BUND; f++) {
        if (imAkkord[pcAusMidi(midi + f)]) { liste.push(f); }
      }
      return liste;
    });

    var frets = [null, null, null, null, null, null];
    var zahler = [];                              /* wie oft jeder Halbton klingt */
    for (var i = 0; i < 12; i++) { zahler[i] = 0; }

    var beste = null;

    /* Je kleiner der Wert, desto bequemer der Griff. Die Gewichte sind
       Erfahrungswerte: tiefe Lage und kleine Spanne sind angenehm, eine
       stumme Saite mitten im Griff ist es gar nicht (die muss der Anschlag
       treffen, nicht die Greifhand), und ein voller Klang ist besser als
       drei klingende Saiten. */
    function bewerte() {
      var klingt = 0, gegriffen = 0, tiefster = 99, hoechster = 0, buende = {};
      var erste = -1, letzte = -1;

      frets.forEach(function (f, i) {
        if (f === null) { return; }
        klingt++;
        if (erste === -1) { erste = i; }
        letzte = i;
        if (f === 0) { return; }
        gegriffen++;
        buende[f] = true;
        if (f < tiefster) { tiefster = f; }
        if (f > hoechster) { hoechster = f; }
      });

      if (klingt < 3) { return Infinity; }                     /* drei Saiten müssen klingen */
      if (Object.keys(buende).length > 4) { return Infinity; } /* mehr Finger gibt es nicht */

      var stummKosten = 0;
      frets.forEach(function (f, i) {
        if (f !== null) { return; }
        stummKosten += (i > erste && i < letzte) ? 16 : (i < erste ? 4 : 10);
      });

      /* Sprung zwischen zwei benachbarten gegriffenen Saiten: ein weiter Weg
         für einen Finger ist schwerer als die Gesamtspanne verrät. Leere
         Saiten zählen nicht mit – von einer leeren Saite auf Bund 2 und
         zurück greift sich von selbst. */
      var sprung = 0, vorher = null;
      frets.forEach(function (f) {
        if (f === null || f === 0) { return; }
        if (vorher !== null) { sprung += Math.abs(f - vorher); }
        vorher = f;
      });

      var lage = tiefster === 99 ? 0 : tiefster;
      var weite = hoechster === 0 ? 0 : hoechster - tiefster;

      return lage * 6 + weite * 5 + sprung * 1.5 + stummKosten
             + gegriffen * 0.2 - klingt * 2;
    }

    function rek(s, tiefstePitch, minBund, maxBund) {
      if (s === 6) {
        for (var k = 0; k < akkord.pflicht.length; k++) {
          if (!zahler[akkord.pflicht[k]]) { return; }
        }
        var bass = pcAusMidi(tiefstePitch);
        if (bassGenau ? bass !== bassPc : !imAkkord[bass]) { return; }

        var wert = bewerte();
        if (wert !== Infinity && (beste === null || wert < beste.wert)) {
          beste = { frets: frets.slice(), wert: wert };
        }
        return;
      }

      var kandidaten = moeglich[s];
      for (var c = 0; c < kandidaten.length; c++) {
        var f = kandidaten[c];
        if (f !== null && f !== 0) {
          if (minBund < 99 && f - minBund > GRIFF_WEITE) { continue; }
          if (maxBund > 0 && maxBund - f > GRIFF_WEITE) { continue; }
        }

        var pitch = f === null ? null : SAITEN_MIDI[s] + f;
        var pc = pitch === null ? null : pcAusMidi(pitch);

        frets[s] = f;
        if (pc !== null) { zahler[pc]++; }
        rek(s + 1,
            pitch === null ? tiefstePitch
                           : (tiefstePitch === null ? pitch : Math.min(tiefstePitch, pitch)),
            f === null || f === 0 ? minBund : Math.min(minBund, f),
            f === null || f === 0 ? maxBund : Math.max(maxBund, f));
        if (pc !== null) { zahler[pc]--; }
        frets[s] = null;
      }
    }

    rek(0, null, 99, 0);
    return beste;
  }

  var GRIFF_SAITENABSTAND = 26;
  var GRIFF_BUNDABSTAND   = 30;
  var GRIFF_RAND          = 32;
  var GRIFF_OBEN          = 46;   /* Höhe der ersten Linie unter den Zeichen */

  function buildGitarre(akkord) {
    /* Bekannte Griffe zuerst; sonst mit dem richtigen Basston suchen, sonst
       ohne diese Bedingung. */
    var frets = null;
    var tabelle = GRIFFBILDER[akkord.typ];
    if (tabelle && tabelle[akkord.grundtonPc] !== undefined) {
      var muster = musterZuFrets(tabelle[akkord.grundtonPc]);
      if (griffPasst(muster, akkord)) { frets = muster; }
    }
    if (!frets) {
      var griff = sucheGriff(akkord, true) || sucheGriff(akkord, false);
      if (!griff) { return null; }
      frets = griff.frets;
    }
    var tiefster = 99, hoechster = 0, hatLeer = false;
    frets.forEach(function (f) {
      if (f === null) { return; }
      if (f === 0) { hatLeer = true; }
      else { tiefster = Math.min(tiefster, f); hoechster = Math.max(hoechster, f); }
    });
    if (tiefster === 99) { tiefster = 0; }

    /* Kommt eine leere Saite vor, beginnt das Bild am Sattel – sonst dort,
       wo der Griff liegt. */
    var start = (hatLeer || tiefster <= 1) ? 1 : tiefster;
    var reihen = Math.min(6, Math.max(5, hoechster - start + 2));

    var breite = GRIFF_SAITENABSTAND * 5 + GRIFF_RAND * 2;
    var unten = GRIFF_OBEN + reihen * GRIFF_BUNDABSTAND;

    function xVon(s) { return GRIFF_RAND + s * GRIFF_SAITENABSTAND; }
    function yVon(f) { return GRIFF_OBEN + (f - start + 0.5) * GRIFF_BUNDABSTAND; }

    /* Liegt der Griff nicht am Sattel, steht links die Lagenangabe („2. Bund").
       Dafür beginnt die Zeichenfläche links vor der Null – sonst würde die
       Angabe am Rand abgeschnitten. */
    var links = start > 1 ? 56 : 0;

    var svg = svgElement('svg', {
      viewBox: (-links) + ' 0 ' + (breite + links) + ' ' + (unten + 12),
      'class': 'akkord__griff',
      role: 'img',
      'aria-label': 'Gitarrengriff ' + akkord.symbol + ': Saiten von tief nach hoch ' +
        frets.map(function (f) { return f === null ? 'x' : String(f); }).join(', ')
    });

    /* Saiten und Bünde */
    for (var s = 0; s < 6; s++) {
      svg.appendChild(svgElement('line', {
        x1: xVon(s), y1: GRIFF_OBEN, x2: xVon(s), y2: unten, 'class': 'griff-saite'
      }));
    }
    for (var r = 0; r <= reihen; r++) {
      var y = GRIFF_OBEN + r * GRIFF_BUNDABSTAND;
      svg.appendChild(svgElement('line', {
        x1: xVon(0), y1: y, x2: xVon(5), y2: y,
        'class': (r === 0 && start === 1) ? 'griff-sattel' : 'griff-bund'
      }));
    }

    /* Bundangabe, wenn der Griff nicht am Sattel beginnt */
    if (start > 1) {
      var lage = svgElement('text', {
        x: GRIFF_RAND - 10, y: GRIFF_OBEN + GRIFF_BUNDABSTAND * 0.5 + 4,
        'class': 'griff-lage', 'text-anchor': 'end'
      });
      lage.textContent = start + '. Bund';
      svg.appendChild(lage);
    }

    /* Zeichen über den Saiten: x = nicht anschlagen, o = leer */
    frets.forEach(function (f, i) {
      var zeichen = svgElement('text', {
        x: xVon(i), y: GRIFF_OBEN - 14, 'class': 'griff-zeichen'
      });
      zeichen.textContent = f === null ? '×' : (f === 0 ? '○' : '');
      if (zeichen.textContent) { svg.appendChild(zeichen); }
    });

    /* Balken: der tiefste Ton und ein höherer im selben Bund, alle Saiten
       dazwischen mindestens so hoch gegriffen – das ist der übliche Barregriff. */
    var tiefsteSaite = -1;
    for (var s2 = 0; s2 < 6; s2++) { if (frets[s2] !== null) { tiefsteSaite = s2; break; } }

    var balken = null;
    var balkenBund = frets[tiefsteSaite];
    if (balkenBund > 0) {
      var letzte = -1, passt = true;
      for (var s3 = tiefsteSaite + 1; s3 < 6; s3++) {
        if (frets[s3] === balkenBund) { letzte = s3; }
        else if (frets[s3] !== null && frets[s3] < balkenBund) { passt = false; break; }
      }
      if (passt && letzte - tiefsteSaite >= 2) {
        balken = { von: tiefsteSaite, bis: letzte };
      }
    }

    /* Punkte für die gegriffenen Töne */
    frets.forEach(function (f, i) {
      if (f === null || f === 0) { return; }
      var pc = pcAusMidi(SAITEN_MIDI[i] + f);
      var farbe = 'griff-punkt--' + rolle(akkord, pc);

      if (balken && f === balkenBund && i >= balken.von && i <= balken.bis) {
        if (i === balken.von) {          /* der Balken zeichnet die ganze Reihe */
          svg.appendChild(svgElement('rect', {
            x: xVon(balken.von) - 9, y: yVon(f) - 9,
            width: xVon(balken.bis) - xVon(balken.von) + 18, height: 18, rx: 9,
            'class': 'griff-balken ' + farbe
          }));
        }
        return;
      }

      svg.appendChild(svgElement('circle', {
        cx: xVon(i), cy: yVon(f), r: 9, 'class': 'griff-punkt ' + farbe
      }));
    });

    return svg;
  }

  /* ---------------------------------------------------------------
     5. Seite zeichnen
     --------------------------------------------------------------- */

  var elTonart = document.getElementById('tonart');
  var elProgression = document.getElementById('progression');
  var elVorlage = document.getElementById('vorlage');
  var elErgebnis = document.getElementById('ergebnis');
  var elNotennamen = document.getElementById('notennamen');
  var elSept = document.getElementById('septakkorde');
  var elGitarre = document.getElementById('gitarre');
  var elLegendeKlavier = document.getElementById('legende-klavier');
  var elLegendeGitarre = document.getElementById('legende-gitarre');

  /* Die Legende erklärt die Farben – und die sind in beiden Ansichten
     dieselben, nur die vierte Zeile gilt bloß fürs Klavier. */
  function zeigeLegende() {
    elLegendeKlavier.hidden = griffModus;
    elLegendeGitarre.hidden = !griffModus;
  }

  function holeTonart(id) {
    for (var i = 0; i < TONARTEN.length; i++) {
      if (TONARTEN[i].id === id) { return TONARTEN[i]; }
    }
    return TONARTEN[0];
  }

  function tokenisieren(eingabe) {
    return eingabe.replace(/[–—|,]/g, ' ').split(/\s+/).filter(function (t) { return t.length > 0; });
  }

  function karte(token, ta) {
    var box = document.createElement('article');
    var rohdaten = parseToken(token, ta);

    if (!rohdaten) {
      box.className = 'akkord akkord--fehler';
      var fehlerKopf = document.createElement('div');
      fehlerKopf.className = 'akkord__kopf';
      var fehlerName = document.createElement('p');
      fehlerName.className = 'akkord__name';
      fehlerName.textContent = token;
      fehlerKopf.appendChild(fehlerName);
      box.appendChild(fehlerKopf);

      var meldung = document.createElement('p');
      meldung.className = 'akkord__toene';
      meldung.textContent = 'nicht erkannt – möglich sind z. B. I, vi, V7 oder C, Am, G7';
      box.appendChild(meldung);
      return box;
    }

    var akkord = baueAkkord(rohdaten);
    if (akkord.be === null) { akkord.be = ta.be; }
    box.className = 'akkord';

    var kopf = document.createElement('div');
    kopf.className = 'akkord__kopf';

    if (akkord.stufe) {
      var stufe = document.createElement('span');
      stufe.className = 'akkord__stufe';
      stufe.textContent = akkord.stufe;
      kopf.appendChild(stufe);
    }

    var name = document.createElement('p');
    name.className = 'akkord__name';
    name.textContent = akkord.symbol;
    kopf.appendChild(name);
    box.appendChild(kopf);

    var toene = document.createElement('p');
    toene.className = 'akkord__toene';
    toene.textContent = akkord.toene.join(' · ');
    box.appendChild(toene);

    /* Klavier ist die Hauptansicht, Gitarre die Alternative. Findet sich
       wider Erwarten kein Griff, bleibt die Klaviatur stehen. */
    var bild = griffModus ? buildGitarre(akkord) : null;
    box.appendChild(bild || buildTastatur(akkord));
    return box;
  }

  function zeichne() {
    var ta = holeTonart(elTonart.value);
    var tokens = tokenisieren(elProgression.value);

    elErgebnis.textContent = '';

    if (tokens.length === 0) {
      var leer = document.createElement('p');
      leer.className = 'leer';
      leer.textContent = 'Noch keine Progression eingegeben.';
      elErgebnis.appendChild(leer);
      merke(ta, '');
      return;
    }

    var kopf = document.createElement('p');
    kopf.className = 'ergebnis__kopf';
    var stark = document.createElement('strong');
    stark.textContent = tonartLabel(ta);
    kopf.appendChild(stark);
    kopf.appendChild(document.createTextNode(
      ' · ' + tokens.length + (tokens.length === 1 ? ' Akkord' : ' Akkorde') +
      ' · ' + elProgression.value.trim()
    ));
    elErgebnis.appendChild(kopf);

    /* Vorzeichen der Tonart – der Quintenzirkel zum Nachlesen, als Text
       und als Notenbild. */
    var vorzeichenZeile = document.createElement('p');
    vorzeichenZeile.className = 'ergebnis__vorzeichen';
    vorzeichenZeile.appendChild(vorzeichenBild(ta));
    var vorzeichenText = document.createElement('span');
    vorzeichenText.textContent = vorzeichenSatz(ta);
    vorzeichenZeile.appendChild(vorzeichenText);
    elErgebnis.appendChild(vorzeichenZeile);

    tokens.forEach(function (token) {
      elErgebnis.appendChild(karte(token, ta));
    });

    merke(ta, elProgression.value);
  }

  /* ---------------------------------------------------------------
     6. Einstellung merken und in die Adresse schreiben
     --------------------------------------------------------------- */

  var SPEICHER = 'chordprogression.einstellung';

  function merke(ta, progression) {
    try {
      window.localStorage.setItem(SPEICHER, JSON.stringify({
        tonart: ta.id, progression: progression, noten: notenStil,
        sept: septAkkorde, griff: griffModus
      }));
    } catch (e) { /* privater Modus o. Ä. – dann eben nicht */ }

    /* Teilbarer Link, z. B. ?tonart=G-Dur&p=I%20V%20vi%20IV&noten=deutsch&sept=1 */
    try {
      var neu = '?tonart=' + encodeURIComponent(ta.id) +
                '&p=' + encodeURIComponent(progression.trim()) +
                (notenStil === 'deutsch' ? '&noten=deutsch' : '') +
                (septAkkorde ? '&sept=1' : '') +
                (griffModus ? '&griff=gitarre' : '');
      window.history.replaceState(null, '', neu);
    } catch (e) { /* bei file:// nicht überall erlaubt */ }
  }

  function ladeAusAdresse() {
    try {
      var p = new URLSearchParams(window.location.search);
      return {
        tonart: p.get('tonart'), progression: p.get('p'),
        noten: p.get('noten'), sept: p.get('sept'), griff: p.get('griff')
      };
    } catch (e) {
      return { tonart: null, progression: null, noten: null, sept: null, griff: null };
    }
  }

  function ladeAusSpeicher() {
    try {
      var roh = window.localStorage.getItem(SPEICHER);
      return roh ? JSON.parse(roh) : null;
    } catch (e) { return null; }
  }

  /* ---------------------------------------------------------------
     7. Auswahlfelder füllen und starten
     --------------------------------------------------------------- */

  function fuelleTonarten() {
    [['Dur-Tonarten', false], ['Moll-Tonarten', true]].forEach(function (paar) {
      var optgroup = document.createElement('optgroup');
      optgroup.label = paar[0];
      TONARTEN.filter(function (t) { return t.moll === paar[1]; }).forEach(function (t) {
        var opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = tonartLabel(t);
        optgroup.appendChild(opt);
      });
      elTonart.appendChild(optgroup);
    });
  }

  function fuelleVorlagen() {
    var gruppen = [];
    VORLAGEN.forEach(function (v) {
      if (gruppen.indexOf(v.gruppe) === -1) { gruppen.push(v.gruppe); }
    });

    gruppen.forEach(function (gruppe) {
      var optgroup = document.createElement('optgroup');
      optgroup.label = gruppe;
      VORLAGEN.filter(function (v) { return v.gruppe === gruppe; }).forEach(function (v) {
        var opt = document.createElement('option');
        opt.value = v.stufen;
        opt.textContent = v.label + ' – ' + v.info;
        optgroup.appendChild(opt);
      });
      elVorlage.appendChild(optgroup);
    });
  }

  /* Die Vorlagenauswahl zeigt die passende Vorlage oder "eigene Eingabe".
     Ein Wert, den es nicht gibt, würde das Feld sonst leer stehen lassen. */
  function setzeVorlage(text) {
    elVorlage.value = text.trim();
    if (elVorlage.selectedIndex === -1) { elVorlage.value = ''; }
  }

  function beschrifteTonartenNeu() {
    Array.prototype.forEach.call(elTonart.options, function (opt) {
      opt.textContent = tonartLabel(holeTonart(opt.value));
    });
  }

  /* Schreibweise der Notennamen gilt seitenweit, deshalb zuerst festlegen */
  var ausAdresse = ladeAusAdresse();
  var gemerkt = ladeAusSpeicher();

  if (ausAdresse.noten === 'deutsch' || (!ausAdresse.noten && gemerkt && gemerkt.noten === 'deutsch')) {
    notenStil = 'deutsch';
  }
  elNotennamen.checked = notenStil === 'deutsch';

  if (ausAdresse.sept === '1' || (!ausAdresse.sept && gemerkt && gemerkt.sept)) {
    septAkkorde = true;
  }
  elSept.checked = septAkkorde;

  if (ausAdresse.griff === 'gitarre' || (!ausAdresse.griff && gemerkt && gemerkt.griff)) {
    griffModus = true;
  }
  elGitarre.checked = griffModus;

  fuelleTonarten();
  fuelleVorlagen();

  var startTonart = (ausAdresse.tonart && holeTonart(ausAdresse.tonart).id === ausAdresse.tonart)
    ? ausAdresse.tonart
    : (gemerkt && gemerkt.tonart) || 'C-Dur';
  var startProgression = ausAdresse.progression
    ? ausAdresse.progression
    : (gemerkt && gemerkt.progression) || 'I V vi IV';

  elTonart.value = holeTonart(startTonart).id;
  elProgression.value = startProgression;
  setzeVorlage(startProgression);
  zeigeLegende();

  elTonart.addEventListener('change', function () {
    setzeVorlage(elProgression.value);
    zeichne();
  });

  elProgression.addEventListener('input', function () {
    setzeVorlage(elProgression.value);
    zeichne();
  });

  elVorlage.addEventListener('change', function () {
    if (elVorlage.value) {
      elProgression.value = elVorlage.value;
      zeichne();
    }
  });

  elNotennamen.addEventListener('change', function () {
    notenStil = elNotennamen.checked ? 'deutsch' : 'international';
    beschrifteTonartenNeu();
    zeichne();
  });

  elSept.addEventListener('change', function () {
    septAkkorde = elSept.checked;
    zeichne();
  });

  elGitarre.addEventListener('change', function () {
    griffModus = elGitarre.checked;
    zeigeLegende();
    zeichne();
  });

  zeichne();
})();
