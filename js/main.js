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
    { gruppe: 'Basslinie', label: 'Bass abwärts',  stufen: 'I I/VII vi I/V',      info: 'I – I/VII – vi – I/V' },
    { gruppe: 'Basslinie', label: 'Bass aufwärts', stufen: 'I I/3 IV I/5',         info: 'I – I/3 – IV – I/5' },
    { gruppe: 'Basslinie', label: 'Bass abwärts (Moll)', stufen: 'i i/VII VI V',   info: 'i – i/VII – VI – V' },
    { gruppe: 'Basslinie', label: 'Bass zur Tonika', stufen: 'V/7 V I/3 I',        info: 'V/7 – V – I/3 – I' }
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

  /* Die Umrisse von Schlüssel, Kreuz und Be sind der Schrift *Bravura*
     entnommen (© Steinberg Media Technologies GmbH, SIL Open Font License
     1.1). Sie ist hier nicht eingebunden – eingebettet sind nur diese drei
     Formen, damit die Seite weiterhin nichts nachlädt.

     Selbst gezeichnet hat das nicht funktioniert: ein Violinschlüssel lebt
     vom Wechsel zwischen dicken und dünnen Stellen, und das lässt sich nicht
     mit gleichbleibender Strichbreite zeichnen. Es muss eine gefüllte
     Umrissform sein.

     Die Zahlen sind Schrift-Einheiten (1000 je Geviert, 250 je
     Notenlinienabstand) mit nach unten gedrehter y-Achse. Beim Zeichnen wird
     nur mit 1/250 skaliert. */
  var BILD_JE_ABSTAND = 250;
  var BILD_SCHLUESSEL = 'M361 -262C364 -243 364 -244 346 -238C258 -208 201 -129 201 -44C201 46 248 110 316 133C324 136 336 139 343 139C351 139 355 134 355 128C355 121 347 118 340 115C298 97 268 54 268 8C268 -49 307 -92 368 -109C384 -113 386 -112 388 -101L438 197C440 208 439 208 424 211C408 214 388 216 368 216C193 216 80 119 80 -20C80 -79 90 -158 173 -252C233 -319 279 -356 326 -394C336 -402 338 -401 340 -390ZM470 -943C503 -943 530 -916 530 -861C530 -750 435 -660 356 -591C349 -585 345 -586 343 -599C339 -625 337 -659 337 -691C337 -847 409 -943 470 -943ZM430 -103C428 -115 429 -118 441 -117C522 -110 589 -42 589 46C589 109 551 160 495 188C483 194 481 194 479 182ZM376 -415C374 -427 376 -428 382 -434C490 -535 572 -662 572 -815C572 -902 548 -988 507 -1048C492 -1070 466 -1098 455 -1098C441 -1098 410 -1072 390 -1050C316 -968 292 -843 292 -739C292 -681 299 -616 306 -575C308 -563 309 -561 297 -551C153 -432 0 -289 0 -87C0 87 119 252 364 252C387 252 413 250 433 246C444 244 446 243 448 255C460 322 475 409 475 456C475 604 375 622 316 622C262 622 236 606 236 593C236 586 245 583 268 576C299 567 335 540 335 482C335 427 300 380 239 380C172 380 132 433 132 495C132 560 171 658 322 658C389 658 519 628 519 458C519 401 501 306 490 244C488 232 489 233 503 227C604 187 671 102 671 -11C671 -139 577 -252 430 -252C404 -252 404 -252 401 -270Z';
  var BILD_FLACH = 'M47 81C47 81 44 21 44 -19C44 -35 45 -47 46 -51C53 -71 93 -100 116 -100C145 -100 157 -67 157 -42C157 12 111 66 68 93C64 95 61 96 58 96C49 96 47 86 47 81ZM12 170C15 174 18 175 21 175C24 175 27 173 27 173C57 156 81 129 106 112C195 50 226 -11 226 -57C226 -114 182 -150 136 -153C119 -153 95 -145 81 -136C75 -131 64 -122 59 -122C57 -122 56 -122 54 -123C47 -126 43 -133 43 -140C44 -162 50 -402 50 -422C50 -433 41 -439 31 -439C17 -439 1 -429 0 -411C0 -411 4 160 12 170Z';
  var BILD_KREUZ = 'M168 45C162 65 115 85 92 85C86 85 81 83 80 80C78 76 77 54 77 30C77 -1 78 -36 80 -44C82 -61 128 -82 153 -82C160 -82 166 -80 168 -76C170 -71 172 -46 172 -19C172 8 170 36 168 45ZM237 -118C244 -121 249 -129 249 -135V-206C249 -211 246 -214 242 -214C240 -214 239 -214 237 -213C237 -213 217 -205 212 -204C205 -204 198 -209 198 -217V-339C198 -345 192 -350 184 -350C174 -350 168 -345 168 -339V-209C167 -199 164 -186 155 -180C143 -173 109 -159 92 -155C83 -155 80 -167 80 -175V-295C80 -301 73 -306 66 -306C56 -306 50 -301 50 -295V-160C50 -146 44 -136 38 -133C32 -130 12 -122 12 -122C5 -120 0 -112 0 -106V-35C0 -29 3 -26 8 -26C12 -26 31 -35 34 -37C35 -37 36 -38 37 -38C44 -38 50 -28 50 -20V79C50 90 45 99 39 102C33 104 12 113 12 113C5 115 0 123 0 129V200C0 206 3 209 8 209C9 209 11 208 12 208C12 208 26 202 35 199C36 198 37 198 38 198C45 198 50 209 50 214V337C50 343 56 348 63 348C73 348 80 343 80 337V198C80 185 85 178 90 176L151 151C152 151 154 150 155 150C163 150 168 162 168 168V293C168 299 174 304 181 304C192 304 198 299 198 293V151C198 143 202 131 209 128C216 125 237 117 237 117C244 114 249 106 249 100V29C249 24 246 21 242 21C240 21 239 21 237 22L211 32C205 32 198 26 198 14V-79C198 -86 203 -105 211 -108Z';

  /* Maße der Umrisse in Notenlinienabständen, aus der Schrift ausgelesen:
     „oben" ragt über den Ursprung hinaus, „unten" darunter. Beim Schlüssel
     ist der Ursprung die unterste Notenlinie, bei den Vorzeichen die
     Notenposition. */
  var BILD_MASS = {
    schluessel: { breite: 2.684, oben: -4.392, unten: 2.632 },
    flach: { breite: 0.904, oben: -1.756, unten: 0.700 },
    kreuz: { breite: 0.996, oben: -1.400, unten: 1.392 }
  };

  /* Lage eines Vorzeichens: 0 = unterste Linie, 1 = erster Zwischenraum,
     2 = zweite Linie und so weiter. Die Reihenfolge ist die des
     Quintenzirkels, die Lagen sind die des Violinschlüssels – F♯ sitzt auf
     der obersten Linie, B♭ auf der Mittellinie.

     Bei den ♭ sind die Lagen von jeher so verteilt, dass alle im System
     bleiben: B♭ auf der Mittellinie, E♭ im vierten Zwischenraum, A♭ im
     zweiten, D♭ auf der vierten Linie, G♭ auf der zweiten – und C♭ im dritten
     Zwischenraum, F♭ im ersten, statt unter dem System zu landen. */
  var LAGE_KREUZ = [8, 5, 9, 6, 3, 7, 4];
  var LAGE_FLACH = [4, 7, 3, 6, 2, 5, 1];

  /* Aufbau des Bildes, alles in Notenlinienabständen. */
  var BILD_RAND = 0.35;             /* Luft um das Bild */
  var BILD_LINKS = 0.2;             /* Einzug des Schlüssels */
  var BILD_ABSTAND = 0.62;          /* Luft zwischen Schlüssel und Vorzeichen */
  var BILD_SCHRITT = 1.1;           /* Abstand von Vorzeichen zu Vorzeichen */
  var BILD_STRICH = 0.085;          /* Dicke der Notenlinien */
  var BILD_PX = 10;                 /* Pixel je Notenlinienabstand */

  function vorzeichenBild(ta) {
    var vorzeichen = vorzeichenVon(ta);
    var anzahl = Math.abs(vorzeichen.anzahl);
    var istKreuz = vorzeichen.anzahl > 0;
    var lagen = istKreuz ? LAGE_KREUZ : LAGE_FLACH;
    var mass = istKreuz ? BILD_MASS.kreuz : BILD_MASS.flach;
    var form = istKreuz ? BILD_KREUZ : BILD_FLACH;

    /* Die fünf Notenlinien liegen zwischen y = 0 und y = 4; die unterste
       Linie ist der Ursprung des Schlüssels. */
    var oben = 4 + BILD_MASS.schluessel.oben;
    var unten = 4 + BILD_MASS.schluessel.unten;
    var y, i;

    for (i = 0; i < anzahl; i++) {
      y = 4 - lagen[i] / 2;
      oben = Math.min(oben, y + mass.oben);
      unten = Math.max(unten, y + mass.unten);
    }

    var versatz = BILD_RAND - oben;          /* alles in den sichtbaren Bereich */
    var hoehe = (unten - oben) + 2 * BILD_RAND;
    var ersteMitte = BILD_LINKS + BILD_MASS.schluessel.breite + BILD_ABSTAND + mass.breite / 2;
    var breite = ersteMitte + (anzahl > 0 ? (anzahl - 1) * BILD_SCHRITT : 0) +
                 mass.breite / 2 + BILD_RAND;

    var svg = svgElement('svg', {
      viewBox: '0 0 ' + breite.toFixed(2) + ' ' + hoehe.toFixed(2),
      width: Math.round(breite * BILD_PX),
      height: Math.round(hoehe * BILD_PX),
      'class': 'notenbild',
      role: 'img',
      'aria-label': 'Notenbild: Violinschlüssel ' + (anzahl === 0
        ? 'ohne Vorzeichen'
        : 'mit ' + anzahl + ' Vorzeichen (' + vorzeichen.namen.join(' ') + ')')
    });

    /* Ein Zeichen an die Stelle (x, y) setzen – y ist die Notenposition,
       der Umriss wird auf Notenlinienabstände heruntergerechnet. */
    function setze(form, x, y) {
      svg.appendChild(svgElement('path', {
        d: form,
        fill: 'currentColor',
        transform: 'translate(' + x.toFixed(3) + ',' + (y + versatz).toFixed(3) +
                   ') scale(' + (1 / BILD_JE_ABSTAND).toFixed(6) + ')'
      }));
    }

    for (i = 0; i < 5; i++) {
      svg.appendChild(svgElement('line', {
        x1: 0, y1: (i + versatz).toFixed(3), x2: breite.toFixed(2), y2: (i + versatz).toFixed(3),
        'class': 'notenbild__linie', 'stroke-width': BILD_STRICH
      }));
    }

    /* Der Schlüssel steht auf der untersten Linie (y = 4), nicht auf einer
       Notenposition – seine Spirale umschließt dadurch die G-Linie. */
    setze(BILD_SCHLUESSEL, BILD_LINKS, 4);

    for (i = 0; i < anzahl; i++) {
      setze(form, ersteMitte + i * BILD_SCHRITT - mass.breite / 2, 4 - lagen[i] / 2);
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
      stufe = stufenZeichen(rohdaten.stufe, rohdaten.typ);
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
      /* Wurde der Akkord als Stufe geschrieben oder als fertiger Akkord?
         Steht eine Stufe im Feld, gibt die Tonart den Ton an – dann ist die
         Tonart bereits gewählt und muss nicht mehr erraten werden. */
      alsStufe: !!rohdaten.stufe,
      /* Buchstabe und Vorzeichen des Grundtons werden mitgegeben: für die
         Funktionsbestimmung und die Vorschläge wird der Akkord von dort aus
         weitergedacht (Quinte hoch, Stufe darüber …). */
      buchstabe: rohdaten.buchstabe,
      vorzeichen: rohdaten.vorzeichen,
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
  var elBau = document.getElementById('bau');
  var elBauOeffnen = document.getElementById('bau-oeffnen');
  var elBauTon = document.getElementById('bau-ton');
  var elBauArt = document.getElementById('bau-art');
  var elBauHinzu = document.getElementById('bau-hinzu');
  var elBauListe = document.getElementById('bau-liste');
  var elBauLeer = document.getElementById('bau-leer');
  var elBauZurueck = document.getElementById('bau-zurueck');
  var elBauAlles = document.getElementById('bau-alles');
  var elBauFertig = document.getElementById('bau-fertig');
  var elIdeen = document.getElementById('ideen');
  var elIdeenListe = document.getElementById('ideen-liste');

  /* Die Vorschläge unter den Karten. Jeder Knopf trägt die fertige Abfolge
     für die gewählte Tonart – ein Klick übernimmt sie ins Eingabefeld, wo
     sich alles weiterbearbeiten lässt. */
  function zeigeIdeen(akkorde, tokens, ta) {
    elIdeenListe.textContent = '';

    var ideen = ideenFuer(akkorde, tokens, ta);
    elIdeen.hidden = ideen.length === 0;

    ideen.forEach(function (idee) {
      var punkt = document.createElement('li');
      punkt.className = 'idee';

      var text = document.createElement('div');
      text.className = 'idee__text';

      var name = document.createElement('p');
      name.className = 'idee__name';
      name.textContent = idee.name;
      text.appendChild(name);

      var satz = document.createElement('p');
      satz.className = 'idee__satz';
      satz.textContent = idee.satz;
      text.appendChild(satz);
      punkt.appendChild(text);

      var knopf = document.createElement('button');
      knopf.type = 'button';
      knopf.className = 'knopf idee__knopf';
      knopf.textContent = idee.folge;
      knopf.addEventListener('click', function () { uebernimmIdee(idee.folge); });
      punkt.appendChild(knopf);

      elIdeenListe.appendChild(punkt);
    });
  }

  function uebernimmIdee(folge) {
    schliesseBau();
    elProgression.value = folge;
    setzeVorlage(folge);        /* eine Idee ist keine Vorlage */
    zeichne();
  }

  /* Der Vorschlag zur Tonart, als Zeile über den Karten – dort, wo man die
     Tonart sieht. Ein Klick stellt sie ein; Karten und Ideen rechnen dann
     von selbst damit weiter. */
  function vorschlagZeile(vorschlag, akkorde) {
    var zeile = document.createElement('div');
    zeile.className = 'vorschlag';

    var satz = document.createElement('p');
    satz.className = 'vorschlag__satz';
    satz.appendChild(document.createTextNode('Diese Akkorde klingen nach '));

    var name = document.createElement('strong');
    name.textContent = tonartLabel(vorschlag);
    satz.appendChild(name);

    /* Die Stufen nur nennen, wenn jeder Akkord im Feld eine hat – sonst
       stünde eine Stufenfolge da, die nicht zu allem passt, was man sieht. */
    var stufen = [];
    var alleDrin = akkorde.length > 0;
    akkorde.forEach(function (akkord) {
      var grad = akkord ? stufeInTonart(akkord, vorschlag) : 0;
      if (!grad) { alleDrin = false; return; }
      stufen.push(stufenZeichen(grad, akkord.typ));
    });

    satz.appendChild(document.createTextNode(alleDrin
      ? ' – dort sind es die Stufen ' + stufen.join(' ') + '.'
      : '.'));
    zeile.appendChild(satz);

    var knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'knopf vorschlag__knopf';
    knopf.textContent = tonartLabel(vorschlag) + ' übernehmen';
    knopf.addEventListener('click', function () {
      elTonart.value = vorschlag.id;
      schreibeFeld();
      zeichne();
    });
    zeile.appendChild(knopf);

    return zeile;
  }

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

  /* Eine Stufenfolge in die Akkordnamen der Tonart übersetzen: aus
     "I V vi IV" wird in G♭-Dur "G♭ D♭ E♭m C♭". Das Eingabefeld zeigt so
     immer, was tatsächlich gespielt wird. Etwas Unerkanntes bleibt stehen. */
  function akkordnamen(text, ta) {
    return tokenisieren(text).map(function (token) {
      var rohdaten = parseToken(token, ta);
      return rohdaten ? baueAkkord(rohdaten).symbol : token;
    }).join(' ');
  }

  /* Eine Absatzzeile zur Einordnung – Funktionsname fett, Erklärung dahinter */
  function einordnung(klasse, name, text, zeichen) {
    var absatz = document.createElement('p');
    absatz.className = klasse;
    if (zeichen) { absatz.appendChild(document.createTextNode(zeichen + ' ')); }
    var fett = document.createElement('strong');
    fett.textContent = name;
    absatz.appendChild(fett);
    absatz.appendChild(document.createTextNode(' – ' + text));
    return absatz;
  }

  function karte(token, akkord, vorher, istLetzter) {
    var box = document.createElement('article');

    if (!akkord) {
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

    /* Die Einordnung steht unter dem Bild, nicht darüber: sonst rutscht die
       Tastatur von Karte zu Karte auf eine andere Höhe, je nachdem, wie lang
       die Sätze sind. So liegen alle Tastaturen auf einer Linie.

       Was der Akkord in der Tonart tut, steht in jedem Fall da; der Schritt
       vom vorigen nur, wenn es einen gibt. */
    box.appendChild(einordnung('akkord__funktion',
      akkord.funktion.name, akkord.funktion.text));

    if (vorher) {
      var schritt = schrittVon(vorher, akkord, istLetzter);
      if (schritt) {
        box.appendChild(einordnung('akkord__schritt', schritt.name, schritt.text, '↳'));
      }
    }

    return box;
  }

  /* Die Vorlage ist die Stufenfolge, nicht der Text im Feld: steht im Feld
     "G♭ D♭ E♭m C♭", wird trotzdem "I V vi IV" gelesen. Nur so ändern der
     Tonart- und der Sept-Umschalter weiterhin alle Karten. */
  function quelleDerProgression() {
    return elVorlage.value || elProgression.value;
  }

  function zeichne() {
    var ta = holeTonart(elTonart.value);
    var tokens = tokenisieren(quelleDerProgression());

    elErgebnis.textContent = '';

    /* Während zusammengestellt wird, steht die Abfolge in der Auswahl – die
       Karten erscheinen erst mit "Fertig". Gemerkt wird in dieser Zeit
       nichts: eine halb gebaute Abfolge gehört nicht in die Adresse. */
    if (bauOffen) {
      var warte = document.createElement('p');
      warte.className = 'leer';
      warte.textContent = 'Akkorde zusammenstellen – mit „Fertig" erscheinen hier die Karten.';
      elErgebnis.appendChild(warte);
      elIdeen.hidden = true;
      return;
    }

    if (tokens.length === 0) {
      var leer = document.createElement('p');
      leer.className = 'leer';
      leer.textContent = 'Noch keine Progression eingegeben.';
      elErgebnis.appendChild(leer);
      elIdeen.hidden = true;
      merke(ta, '');
      return;
    }

    var kopf = document.createElement('p');
    kopf.className = 'ergebnis__kopf';
    var stark = document.createElement('strong');
    stark.textContent = tonartLabel(ta);
    kopf.appendChild(stark);
    kopf.appendChild(document.createTextNode(
      ' · ' + tokens.length + (tokens.length === 1 ? ' Akkord' : ' Akkorde')
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

    /* Erst alle Akkorde lesen, dann zeichnen: jeder Karte wird der vorige
       Akkord mitgegeben, damit sie den Schritt beschreiben kann. Unerkanntes
       zählt dabei nicht als Vorgänger. */
    var akkorde = tokens.map(function (token) { return leseAkkord(token, ta); });

    /* Stehen fertige Akkorde im Feld, die besser zu einer anderen Tonart
       passen, wird sie vorgeschlagen – noch vor den Karten, denn mit ihr
       ändert sich deren ganze Einordnung. */
    var vorschlag = vorschlagTonart(akkorde, ta);
    if (vorschlag) { elErgebnis.appendChild(vorschlagZeile(vorschlag, akkorde)); }

    tokens.forEach(function (token, i) {
      var vorher = null;
      for (var j = i - 1; j >= 0; j--) {
        if (akkorde[j]) { vorher = akkorde[j]; break; }
      }
      elErgebnis.appendChild(karte(token, akkorde[i], vorher, i === tokens.length - 1));
    });

    zeigeIdeen(akkorde, tokens, ta);

    /* Gemerkt und in die Adresse kommt die Stufenfolge, nicht der Feldtext:
       eine Vorlage lässt sich so in jeder Tonart wieder herstellen. */
    merke(ta, quelleDerProgression().trim());
  }

  /* ---------------------------------------------------------------
     5b. Akkorde zusammenstellen
     --------------------------------------------------------------- */

  /* Ton und Art aus zwei Auswahlfeldern zu einer Abfolge aneinanderreihen,
     statt von Hand zu tippen. Die Abfolge steht als nummerierte Reihe da;
     fertig ist sie mit "Fertig" – dann erscheinen die Karten.

     Der Ton steht getrennt in zwei Schreibweisen: welche zuerst kommt,
     richtet sich nach der Tonart (in G♭-Dur zuerst G♭, in E-Dur zuerst F♯).
     Beide Listen sind nach Halbton geordnet, liegen also auf demselben Index. */
  var BAU_TON_KREUZ = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0],
                       ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]];
  var BAU_TON_FLACH = [['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0],
                       ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0]];

  /* Reihenfolge und Gruppierung der Akkordarten. Die Beschriftung entsteht
     aus AKKORDTYPEN – im Auswahlfeld steht also dasselbe wie im Akkord. */
  var BAU_ARTEN = [
    { gruppe: 'Dreiklänge',           typen: ['maj', 'min', 'dim', 'aug', '5'] },
    { gruppe: 'Mit Septime',          typen: ['7', 'maj7', 'm7', 'm7b5', 'dim7', 'mMaj7'] },
    { gruppe: 'Vorhalte und Zusätze', typen: ['6', 'm6', 'sus2', 'sus4', '7sus4', 'add9', 'madd9'] },
    { gruppe: 'Erweiterungen',        typen: ['9', 'maj9', 'm9', '11', 'm11', '13', 'm13'] },
    { gruppe: 'Alteriert',            typen: ['7b9', '7#9', '7b5', '7#5', '69', 'm69'] }
  ];

  var bauListe = [];               /* gewählte Akkorde, in der Reihenfolge der Eingabe */
  var bauOffen = false;            /* Auswahlbereich sichtbar */
  var bauVorlageVorher = '';       /* Vorlage, die beim Öffnen aufgegeben wurde */

  function bauArtLabel(typ) {
    if (typ === 'maj') { return 'Dur'; }
    if (typ === 'min') { return 'Moll'; }
    return AKKORDTYPEN[typ].suffix;
  }

  /* Aus dem Wert "B|-1" des Auswahlfelds wird Buchstabe und Vorzeichen */
  function bauTonAusWert(wert) {
    var teile = wert.split('|');
    return { buchstabe: teile[0], versatz: parseInt(teile[1], 10) };
  }

  /* Ein Eintrag der Abfolge als Akkordsymbol. "roh" sind Zeichen, die aus dem
     Eingabefeld stammen und sich nicht in Ton + Art auflösen ließen (etwa
     eine Stufe wie "I") – die bleiben unverändert stehen. */
  function bauSymbol(eintrag) {
    if (eintrag.roh !== undefined) { return eintrag.roh; }
    return baueAkkord({
      buchstabe: eintrag.buchstabe,
      grundton: (((BUCHSTABE_PC[eintrag.buchstabe] + eintrag.versatz) % 12) + 12) % 12,
      vorzeichen: eintrag.versatz,
      typ: eintrag.typ
    }).symbol;
  }

  /* Was im Feld steht, ist der Ausgangspunkt der Zusammenstellung – so lässt
     sich eine fertige Abfolge weiterbearbeiten statt neu anzufangen. */
  function bauEintragAus(token, ta) {
    var rohdaten = parseToken(token, ta);
    if (rohdaten && !rohdaten.bass) {
      var eintrag = {
        buchstabe: rohdaten.buchstabe, versatz: rohdaten.vorzeichen, typ: rohdaten.typ
      };
      if (bauSymbol(eintrag) === token) { return eintrag; }
    }
    return { roh: token };
  }

  function fuelleBauToene() {
    var ta = holeTonart(elTonart.value);
    var passt = ta.be ? BAU_TON_FLACH : BAU_TON_KREUZ;
    var anders = ta.be ? BAU_TON_KREUZ : BAU_TON_FLACH;
    var vorher = elBauTon.value;
    var doppelt = [];
    var i;

    function gruppe(titel, liste) {
      var optgroup = document.createElement('optgroup');
      optgroup.label = titel;
      liste.forEach(function (eintrag) {
        var opt = document.createElement('option');
        opt.value = eintrag[0] + '|' + eintrag[1];
        opt.textContent = notenName(eintrag[0], eintrag[1]);
        optgroup.appendChild(opt);
      });
      elBauTon.appendChild(optgroup);
    }

    /* Nur die fünf Töne mit zwei Namen stehen doppelt: dieselbe Taste,
       anderer Name. */
    for (i = 0; i < anders.length; i++) {
      if (anders[i][0] !== passt[i][0]) { doppelt.push(anders[i]); }
    }

    elBauTon.textContent = '';
    gruppe('Töne', passt);
    if (doppelt.length) { gruppe('andere Schreibweise', doppelt); }

    elBauTon.value = vorher || 'C|0';
    if (elBauTon.selectedIndex === -1) { elBauTon.value = 'C|0'; }
  }

  function fuelleBauArten() {
    BAU_ARTEN.forEach(function (teil) {
      var optgroup = document.createElement('optgroup');
      optgroup.label = teil.gruppe;
      teil.typen.forEach(function (typ) {
        var opt = document.createElement('option');
        opt.value = typ;
        opt.textContent = bauArtLabel(typ);
        optgroup.appendChild(opt);
      });
      elBauArt.appendChild(optgroup);
    });
  }

  function zeichneBauListe() {
    elBauListe.textContent = '';
    elBauListe.hidden = bauListe.length === 0;
    elBauLeer.hidden = bauListe.length > 0;

    bauListe.forEach(function (eintrag, nummer) {
      var punkt = document.createElement('li');
      punkt.className = 'bau__punkt';

      var zahl = document.createElement('span');
      zahl.className = 'bau__nummer';
      zahl.textContent = nummer + 1;
      punkt.appendChild(zahl);

      var name = document.createElement('span');
      name.className = 'bau__name';
      name.textContent = bauSymbol(eintrag);
      punkt.appendChild(name);

      var weg = document.createElement('button');
      weg.type = 'button';
      weg.className = 'bau__weg';
      weg.textContent = '×';
      weg.setAttribute('aria-label', bauSymbol(eintrag) + ' wieder entfernen');
      weg.addEventListener('click', function () {
        bauListe.splice(nummer, 1);
        bauGeaendert();
      });
      punkt.appendChild(weg);

      elBauListe.appendChild(punkt);
    });
  }

  /* Die Abfolge ins Eingabefeld übernehmen – erst damit gilt sie als
     Progression und die Karten erscheinen. Solange zusammengestellt wird,
     bleibt das Feld unangetastet: dort steht bis "Fertig" die alte
     Progression. */
  function uebernimmBauListe() {
    elProgression.value = bauListe.map(bauSymbol).join(' ');
  }

  function bauGeaendert() {
    zeichneBauListe();
    zeichne();
  }

  function zeigeBau() {
    elBau.hidden = !bauOffen;
    elBauOeffnen.setAttribute('aria-expanded', bauOffen ? 'true' : 'false');
    elBauOeffnen.textContent = bauOffen ? 'Zusammenstellen schließen' : 'Akkorde zusammenstellen';
    if (bauOffen) { zeichneBauListe(); }
  }

  function oeffneBau() {
    var ta = holeTonart(elTonart.value);
    /* Was schon im Feld steht, ist der Anfang der Abfolge – so lässt sich
       eine fertige Progression weiterbauen, statt neu anzufangen. */
    bauListe = tokenisieren(elProgression.value).map(function (token) {
      return bauEintragAus(token, ta);
    });
    bauVorlageVorher = elVorlage.value;
    bauOffen = true;
    setzeVorlage('');       /* eine Zusammenstellung ist keine Vorlage */
    fuelleBauToene();
    zeigeBau();
    zeichne();
  }

  /* Den Auswahlbereich schließen, ohne die Abfolge zu übernehmen. Wird er
     nur zugemacht, kommt eine zuvor gewählte Vorlage zurück – sonst hätte
     ein Blick in die Zusammenstellung die Tonartbindung gekostet. */
  function schliesseBau(vorlageZurueck) {
    if (!bauOffen) { return; }
    bauOffen = false;
    if (vorlageZurueck && bauVorlageVorher) { setzeVorlage(bauVorlageVorher); }
    zeigeBau();
  }

  /* ---------------------------------------------------------------
     5c. Funktion und Schritt – was ein Akkord in der Tonart tut
     --------------------------------------------------------------- */

  /* Welche Aufgabe ein Akkord in der Tonart hat. Die Einteilung ist die
     gebräuchliche deutsche Funktionslehre: Tonika (Ruhe), Subdominante
     (Weitung), Dominante (Spannung), dazu die Parallelklänge im Terzabstand.

     Über die dritte und die sechste Stufe sind sich die Lehrbücher uneins –
     die iii lässt sich als Dominant- wie als Tonikagegenklang lesen, die vi
     als Tonikaparallele oder als Subdominantgegenklang. Hier steht jeweils
     die gängigere Lesart; der kurze Satz beschreibt ohnehin die Wirkung und
     nicht den Streit. */
  var FUNKTION_DUR = [
    { rolle: 'tonika',       name: 'Tonika',
      text: 'Ruhepunkt – hier kommt die Progression an.' },
    { rolle: 'subdominante', name: 'Subdominantenparallele',
      text: 'die weiche Subdominante – öffnet und schiebt zur Dominante.' },
    { rolle: 'dominante',    name: 'Dominantparallele',
      text: 'schwacher Dominantklang – drängt nur leise, färbt aber.' },
    { rolle: 'subdominante', name: 'Subdominante',
      text: 'öffnet und weitet – führt weg vom Ruhepunkt.' },
    { rolle: 'dominante',    name: 'Dominante',
      text: 'erzeugt Spannung und will zur Tonika zurück.' },
    { rolle: 'tonika',       name: 'Tonikaparallele',
      text: 'das Moll-Zuhause – klingt nach Tonika, nur weicher.' },
    { rolle: 'dominante',    name: 'Dominante ohne Grundton',
      text: 'spannt wie die Dominante, schwebt aber, weil ihr Grundton fehlt.',
      /* Nur der verminderte Dreiklang hat den Grundton nicht – bei anderem
         Tongeschlecht steht der Satz auf der Karte dem Klang entgegen. */
      ohneGestalt: { name: 'Dominante',
        text: 'sitzt auf dem Leitton – drängt zur Tonika, hier nur mit anderem Tongeschlecht.' } }
  ];

  var FUNKTION_MOLL = [
    { rolle: 'tonika',       name: 'Tonika',
      text: 'Ruhepunkt – hier kommt die Progression an.' },
    { rolle: 'subdominante', name: 'Subdominante',
      text: 'die verminderte Subdominante – dunkel, leitet weiter.',
      ohneGestalt: { text: 'auf der zweiten Stufe – dunkel, leitet weiter.' } },
    { rolle: 'tonika',       name: 'Tonikaparallele',
      text: 'die Dur-Parallele – heller als die Tonika.' },
    { rolle: 'subdominante', name: 'Subdominante',
      text: 'öffnet und weitet – führt weg vom Ruhepunkt.' },
    { rolle: 'dominante',    name: 'Dominante',
      text: 'erzeugt Spannung und will zur Tonika zurück.' },
    { rolle: 'subdominante', name: 'Subdominantenparallele',
      text: 'farbiger Ausweichklang – oft das Ziel eines Trugschlusses.' },
    { rolle: 'dominante',    name: 'Dominantparallele',
      text: 'tiefe Dominante – drängt weniger stark als die fünfte Stufe.' }
  ];

  /* Tongeschlecht eines Akkordtyps. Vorhalte und Powerchords haben keine
     Terz – bei ihnen bleibt es offen. */
  var TYP_MOLL  = { min: 1, m7: 1, m9: 1, m11: 1, m13: 1, m6: 1, m69: 1, madd9: 1,
                    mMaj7: 1, m7b9: 1, 'm7#5': 1 };
  var TYP_VERM  = { dim: 1, dim7: 1, m7b5: 1 };
  var TYP_UEBER = { aug: 1, '7#5': 1 };
  var TYP_OFFEN = { sus2: 1, sus4: 1, '7sus4': 1, '5': 1 };
  /* Dur mit kleiner Septime – die eigentliche Dominantform */
  var TYP_DOM7  = { '7': 1, '9': 1, '13': 1, '7b9': 1, '7#9': 1, '7b5': 1, '7#5': 1 };

  function tongeschlecht(typ) {
    if (TYP_VERM[typ])  { return 'vermindert'; }
    if (TYP_UEBER[typ]) { return 'übermäßig'; }
    if (TYP_MOLL[typ])  { return 'moll'; }
    if (TYP_OFFEN[typ]) { return 'offen'; }
    return 'dur';
  }

  /* Wie die Tonleiter eine Stufe erwartet – in denselben Worten, die
     tongeschlecht() für einen Akkordtyp liefert, damit sich beides
     vergleichen lässt. */
  function erwartetesGeschlecht(qualitaet) {
    return qualitaet === 'dim' ? 'vermindert'
         : qualitaet === 'min' ? 'moll' : 'dur';
  }

  /* Die Stufe als römische Ziffer samt Zusatz: groß für Dur, klein für Moll
     und vermindert. Nur an einer Stelle geschrieben, damit das Abzeichen auf
     der Karte und die Bezeichnung in der Karte dieselbe Schreibweise haben. */
  function stufenZeichen(grad, typ) {
    var info = AKKORDTYPEN[typ] || {};
    var numeral = ROEMISCH[grad - 1];
    return (info.klein ? numeral.toLowerCase() : numeral) + (info.stufeSuffix || '');
  }

  /* Auf welcher Stufe der Tonart der Grundton liegt – nach dem Ton, nicht nach
     dem Tongeschlecht: Fm in C-Dur ist die vierte Stufe, nur eben Moll. */
  function stufeInTonart(akkord, ta) {
    var skala = ta.moll ? SKALA_MOLL : SKALA_DUR;
    for (var i = 0; i < skala.length; i++) {
      if ((((ta.grundton + skala[i]) % 12) + 12) % 12 === akkord.grundtonPc) {
        return i + 1;
      }
    }
    return 0;
  }

  /* Was der Akkord in dieser Tonart tut. Von der leitereigenen Stufe wird
     abgewichen, wenn das Tongeschlecht ein anderes ist als erwartet – daraus
     entstehen die interessanten Fälle: Moll-Subdominante, Zwischendominante
     und die Dur-Dominante im Moll. */
  function funktionVon(akkord, ta) {
    var grad = stufeInTonart(akkord, ta);
    var geschlecht = tongeschlecht(akkord.typ);

    if (!grad) {
      return { grad: 0, rolle: 'fremd', name: 'Lehnakkord',
        text: 'gehört nicht zu dieser Tonart – von außen geliehen, das klingt überraschend.' };
    }

    var erwartet = (ta.moll ? STUFEN_QUALITAET_MOLL : STUFEN_QUALITAET_DUR)[grad - 1];
    var geschlechtErwartet = erwartetesGeschlecht(erwartet);
    var basis = (ta.moll ? FUNKTION_MOLL : FUNKTION_DUR)[grad - 1];

    if (!ta.moll && grad === 4 && geschlecht === 'moll') {
      return { grad: grad, rolle: 'subdominante', name: 'Moll-Subdominante',
        text: 'die verdunkelte Subdominante – aus der Paralleltonart geliehen.' };
    }
    if (!ta.moll && grad === 5 && geschlecht === 'moll') {
      return { grad: grad, rolle: 'dominante', name: 'Moll-Dominante',
        text: 'zieht schwächer als die Dur-Dominante, weil der Leitton fehlt.' };
    }
    if (!ta.moll && grad === 1 && TYP_DOM7[akkord.typ]) {
      return { grad: grad, rolle: 'dominante', name: 'Dominantsept auf der Tonika',
        text: 'zieht als Dur-Akkord mit kleiner Septime zur Subdominante – bluesig.' };
    }
    if (!ta.moll && geschlechtErwartet !== 'dur' && geschlecht === 'dur') {
      return { grad: grad, rolle: 'dominante', name: 'Zwischendominante',
        text: 'ein Dur-Akkord dort, wo die Tonart Moll erwartet – er deutet auf den nächsten hin.' };
    }
    if (ta.moll && grad === 5 && geschlecht === 'dur') {
      return { grad: grad, rolle: 'dominante', name: 'Dominante',
        text: 'als Dur mit Leitton (harmonisches Moll) – zieht stark zur Tonika.' };
    }
    if (ta.moll && grad === 5 && geschlecht === 'moll') {
      return { grad: grad, rolle: 'dominante', name: 'Moll-Dominante',
        text: 'die natürliche Moll-Dominante – ohne Leitton, sie zieht schwächer.' };
    }
    /* Der Leitton-Akkord und die verminderte zweite Stufe sind über ihre
       Gestalt beschrieben. Passt die Gestalt nicht, gilt nur die Aufgabe –
       sonst behauptete die Karte etwas, was der Akkord gar nicht zeigt
       (Fm in G♭-Dur hat seinen Grundton durchaus). */
    if (geschlecht !== geschlechtErwartet && basis.ohneGestalt) {
      return { grad: grad, rolle: basis.rolle,
        name: basis.ohneGestalt.name || basis.name,
        text: basis.ohneGestalt.text };
    }

    return { grad: grad, rolle: basis.rolle, name: basis.name, text: basis.text };
  }

  /* Was der Schritt vom vorigen Akkord bewirkt. Die Schlussarten haben
     Vorrang – sie sind das, was man hört. Bleibt keine übrig, beschreibt
     der Abstand der Grundtöne die Wirkung. */
  function schrittVon(vorher, jetzt, istLetzter) {
    if (vorher.funktion.rolle === 'dominante' && jetzt.funktion.grad === 6) {
      return { name: 'Trugschluss',
        text: 'statt der Tonika kommt die sechste Stufe – der erwartete Schluss wird umgangen.' };
    }
    if (vorher.funktion.rolle === 'dominante' && jetzt.funktion.rolle === 'tonika') {
      return { name: 'Ganzschluss',
        text: 'die Dominante löst sich zur Tonika auf – hier ist die Progression zu Hause.' };
    }
    if (vorher.funktion.rolle === 'subdominante' && jetzt.funktion.rolle === 'tonika') {
      return { name: 'Plagalschluss',
        text: 'der sanfte Schluss ohne Dominante – die „Amen“-Wendung.' };
    }
    if (istLetzter && jetzt.funktion.rolle === 'dominante') {
      return { name: 'Halbschluss',
        text: 'die Progression endet offen auf der Dominante – es klingt wie eine Frage.' };
    }
    if (vorher.funktion.grad === 2 && jetzt.funktion.rolle === 'dominante') {
      return { name: 'ii–V',
        text: 'die Subdominante bereitet die Dominante vor – die Schlussformel des Jazz.' };
    }
    if (vorher.funktion.rolle === 'subdominante' && jetzt.funktion.rolle === 'dominante') {
      return { name: 'Subdominante zur Dominante',
        text: 'die Spannung wächst – von hier aus wird die Auflösung erwartet.' };
    }

    var abstand = (((jetzt.grundtonPc - vorher.grundtonPc) % 12) + 12) % 12;
    var nachAbstand = {
      5:  { name: 'Quintfall',      text: 'der Grundton fällt eine Quinte – der stärkste Zug nach vorn.' },
      7:  { name: 'Quint aufwärts', text: 'öffnend, aber weniger zwingend als der Quintfall.' },
      1:  { name: 'Halbtonschritt', text: 'der kleinste Schritt – der Bass zieht sich weiter.' },
      11: { name: 'Halbtonschritt', text: 'der kleinste Schritt – der Bass zieht sich weiter.' },
      2:  { name: 'Ganztonschritt', text: 'nur einen Schritt weiter – verbindet, ohne zu drängen.' },
      10: { name: 'Ganztonschritt', text: 'nur einen Schritt zurück – verbindet, ohne zu drängen.' },
      3:  { name: 'Terzverwandt',   text: 'zwei gemeinsame Töne – farbig statt zwingend.' },
      4:  { name: 'Terzverwandt',   text: 'zwei gemeinsame Töne – farbig statt zwingend.' },
      8:  { name: 'Terzverwandt',   text: 'zwei gemeinsame Töne – farbig statt zwingend.' },
      9:  { name: 'Terzverwandt',   text: 'zwei gemeinsame Töne – farbig statt zwingend.' },
      6:  { name: 'Tritonus',       text: 'der weiteste Schritt – sehr spannungsvoll, fast fremd.' },
      0:  { name: 'Umdeutung',      text: 'derselbe Grundton in anderer Farbe – der Akkord wird umgedeutet.' }
    };
    return nachAbstand[abstand] || null;
  }

  /* Einen Akkord lesen und gleich einordnen. Unerkanntes bleibt null. */
  function leseAkkord(token, ta) {
    var rohdaten = parseToken(token, ta);
    if (!rohdaten) { return null; }
    var akkord = baueAkkord(rohdaten);
    if (akkord.be === null) { akkord.be = ta.be; }
    akkord.funktion = funktionVon(akkord, ta);

    /* Ein fertig getippter Akkord trägt sein Abzeichen selbst nicht mit sich –
       steht er aber auf einer Stufe der Tonart, gehört es hin (Fm in C-Dur
       ist die vierte Stufe, moll). Von außen geliehene bleiben ohne. */
    if (!akkord.stufe && akkord.funktion.grad) {
      akkord.stufe = stufenZeichen(akkord.funktion.grad, akkord.typ);
    }

    return akkord;
  }

  /* ---------------------------------------------------------------
     5d. Ideen zum Variieren
     --------------------------------------------------------------- */

  /* Ein Akkord auf einem eigenen Grundton. Buchstabe und Vorzeichen entstehen
     durch Terzenschichtung ab dem Tonbuchstaben der Tonart – in G♭-Dur heißt
     die vierte Stufe deshalb C♭ und nicht B. */
  function akkordUeber(buchstabe, buchstabenSchritt, pc, typ) {
    var b = BUCHSTABEN[(BUCHSTABEN.indexOf(buchstabe) + buchstabenSchritt) % 7];
    var zielPc = ((pc % 12) + 12) % 12;
    var versatz = zielPc - BUCHSTABE_PC[b];
    while (versatz > 2) { versatz -= 12; }
    while (versatz < -2) { versatz += 12; }
    return baueAkkord({ buchstabe: b, grundton: zielPc, vorzeichen: versatz, typ: typ }).symbol;
  }

  /* Die leitereigene Stufe mit einem bestimmten Tongeschlecht */
  function stufenAkkord(grad, typ, ta) {
    var skala = ta.moll ? SKALA_MOLL : SKALA_DUR;
    return akkordUeber(ta.buchstabe, grad - 1, ta.grundton + skala[grad - 1], typ);
  }

  /* Die Dominante eines Akkords: eine Quinte höher, als Dur mit Septime */
  function dominanteVon(akkord) {
    return akkordUeber(akkord.buchstabe, 4, akkord.grundtonPc + 7, '7');
  }

  /* Die Vorschläge arbeiten auf der ganzen Abfolge, nicht nur auf den
     erkannten Akkorden: was nicht erkannt wurde, bleibt beim Übernehmen an
     seinem Platz stehen. "akkorde" enthält dafür null an diesen Stellen. */
  function ideenFuer(akkorde, tokens, ta) {
    var liste = [];
    var skala = ta.moll ? SKALA_MOLL : SKALA_DUR;

    var erkannt = [];
    akkorde.forEach(function (a, i) { if (a) { erkannt.push(i); } });
    if (erkannt.length === 0) { return liste; }

    var letzterI = erkannt[erkannt.length - 1];
    var letzter = akkorde[letzterI];
    var vorletzterI = erkannt.length > 1 ? erkannt[erkannt.length - 2] : -1;
    var vorletzter = vorletzterI >= 0 ? akkorde[vorletzterI] : null;

    function an(i) { return akkorde[i] ? akkorde[i].symbol : tokens[i]; }

    /* Die Abfolge mit Ersetzungen an einzelnen Stellen; "weg" lässt eine
       Stelle ganz heraus. */
    function folgeMit(ersatz, weg) {
      var teile = [];
      for (var i = 0; i < akkorde.length; i++) {
        if (i === weg) { continue; }
        teile.push(ersatz[i] !== undefined ? ersatz[i] : an(i));
      }
      return teile.join(' ');
    }

    /* Am Ende nicht nach Hause, sondern zur sechsten Stufe */
    if (letzter.funktion.grad === 1) {
      var sechste = stufenAkkord(6, ta.moll ? 'maj' : 'min', ta);
      var amEnde = {};
      amEnde[letzterI] = sechste;
      liste.push({
        name: 'Trugschluss',
        satz: 'Am Ende nicht die Tonika, sondern die sechste Stufe (' + sechste +
              ' statt ' + letzter.symbol + ') – der erwartete Schluss wird umgangen, ' +
              'die Progression klingt weiter.',
        folge: folgeMit(amEnde)
      });
    }

    /* Auf der Dominante stehen bleiben – erst dann ist es eine Abfolge,
       die man auch hört. */
    if (erkannt.length >= 3 && letzter.funktion.grad === 1 &&
        vorletzter.funktion.rolle === 'dominante') {
      liste.push({
        name: 'Offen enden',
        satz: 'Die letzte Tonika weglassen und auf der Dominante stehen bleiben – ' +
              'dieselben Akkorde, aber es klingt wie eine Frage (Halbschluss).',
        folge: folgeMit({}, letzterI)
      });
    }

    /* Die Subdominante verdunkeln */
    if (!ta.moll) {
      var stellen = {};
      var hatteSubdominante = false;
      akkorde.forEach(function (a, i) {
        if (a && a.funktion.grad === 4) { stellen[i] = stufenAkkord(4, 'min', ta); hatteSubdominante = true; }
      });
      if (hatteSubdominante) {
        liste.push({
          name: 'Moll-Subdominante',
          satz: 'Die Subdominante wird Moll (' + stufenAkkord(4, 'min', ta) + ' statt ' +
                stufenAkkord(4, 'maj', ta) + ') – ein Klang aus der Paralleltonart, ' +
                'dunkler und weicher.',
          folge: folgeMit(stellen)
        });
      }
    }

    /* Eine Zwischendominante vor die sechste oder zweite Stufe setzen */
    var zielI = -1;
    erkannt.forEach(function (i) {
      var g = akkorde[i].funktion.grad;
      if (zielI === -1 && (g === 6 || g === 2)) { zielI = i; }
    });
    if (zielI !== -1) {
      var ziel = akkorde[zielI];
      var einschub = {};
      einschub[zielI] = dominanteVon(ziel) + ' ' + ziel.symbol;
      liste.push({
        name: 'Zwischendominante',
        satz: 'Ein Dur-Akkord mit Septime kurz vor ' + ziel.symbol + ' (' +
              (ziel.funktion.grad === 6 ? 'sechste' : 'zweite') +
              ' Stufe) – er deutet auf ihn hin und zieht stärker.',
        folge: folgeMit(einschub)
      });
    }

    /* Ein Durchgang im Bass zum letzten Akkord */
    if (vorletzter && vorletzter.symbol.indexOf('/') === -1) {
      var bassPc = (((letzter.grundtonPc + 2) % 12) + 12) % 12;
      var inTonart = skala.some(function (s) {
        return (((ta.grundton + s) % 12) + 12) % 12 === bassPc;
      });
      if (inTonart && bassPc !== vorletzter.grundtonPc) {
        var bassName = akkordGrundtonName(
          BUCHSTABEN[(BUCHSTABEN.indexOf(letzter.buchstabe) + 1) % 7], bassPc);
        var mitBass = {};
        mitBass[vorletzterI] = vorletzter.symbol + '/' + bassName;
        liste.push({
          name: 'Durchgang im Bass',
          satz: 'Der vorletzte Akkord bekommt den Basston ' + bassName + ' – der Bass ' +
                'geht dann in einem Schritt zum letzten Akkord.',
          folge: folgeMit(mitBass)
        });
      }
    }

    return liste;
  }

  /* ---------------------------------------------------------------
     5e. Welche Tonart ist das?
     --------------------------------------------------------------- */

  /* Wie gut eine Tonart zu fertig getippten Akkorden passt. Gezählt wird,
     was man hört: liegt der Grundton auf einer Stufe der Tonleiter, stimmt
     das Tongeschlecht mit der leitereigenen Stufe überein, und steht die
     Tonika am Anfang oder am Ende der Abfolge? Ein Akkord, dessen Grundton
     gar nicht zur Tonart gehört, zieht die Tonart dagegen nach unten. */
  function passung(akkorde, ta) {
    var leitereigen = ta.moll ? STUFEN_QUALITAET_MOLL : STUFEN_QUALITAET_DUR;
    var punkte = 0;

    akkorde.forEach(function (akkord, i) {
      var grad = stufeInTonart(akkord, ta);
      if (!grad) { punkte -= 3; return; }

      punkte += 2;
      var geschlecht = tongeschlecht(akkord.typ);
      var stimmt = geschlecht === erwartetesGeschlecht(leitereigen[grad - 1]);
      if (stimmt) { punkte += 1; }

      /* Die Tonika ist das Fundament der Tonart: steht sie vorn oder hinten,
         ist die Sache so gut wie sicher. */
      if (grad === 1 && stimmt && (i === 0 || i === akkorde.length - 1)) {
        punkte += 2;
      }
    });

    return punkte;
  }

  /* Die Tonart, die die getippten Akkorde am besten erklärt – und zwar nur,
     wenn es überhaupt eine bessere gibt als die eingestellte: bei Stufen im
     Feld gibt die Tonart ohnehin jeden Ton an, ein einzelner Akkord passt in
     zu viele Tonarten, und was die eingestellte Tonart genauso gut erklärt,
     soll sie auch bleiben. */
  function vorschlagTonart(akkorde, ta) {
    var fertige = [];

    akkorde.forEach(function (akkord) {
      if (akkord && akkord.alsStufe) { fertige = null; }
    });
    if (fertige === null) { return null; }

    akkorde.forEach(function (akkord) { if (akkord) { fertige.push(akkord); } });
    if (fertige.length < 2) { return null; }

    var besterWert = passung(fertige, ta);
    var beste = null;

    TONARTEN.forEach(function (kandidat) {
      var wert = passung(fertige, kandidat);
      if (wert > besterWert) { besterWert = wert; beste = kandidat; }
    });

    return beste;
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

  /* Im Feld stehen die Akkorde der Tonart, nicht die Stufen – "I V vi IV"
     wird in G♭-Dur zu "G♭ D♭ E♭m C♭". Die Vorlage im Auswahlfeld bleibt
     dabei die Stufenfolge (siehe quelleDerProgression). */
  function schreibeFeld() {
    if (elVorlage.value) {
      elProgression.value = akkordnamen(elVorlage.value, holeTonart(elTonart.value));
    }
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
  fuelleBauArten();
  fuelleBauToene();
  schreibeFeld();
  zeigeLegende();

  /* Eine andere Tonart transponiert die Vorlage mit, statt die alten
     Akkorde stehen zu lassen. */
  elTonart.addEventListener('change', function () {
    /* Die Tonliste richtet sich nach der Tonart: in G♭-Dur steht G♭ vorne,
       in E-Dur F♯. Die gewählten Akkorde behalten ihre Schreibweise. */
    if (bauOffen) { fuelleBauToene(); zeichneBauListe(); }
    schreibeFeld();
    zeichne();
  });

  /* Tippen im Feld ist eine eigene Eingabe – die Vorlagenauswahl springt
     dann auf "eigene Eingabe", das Feld bleibt genau so, wie getippt. Von
     Hand getippt heißt auch: die Zusammenstellung ist beendet. */
  elProgression.addEventListener('input', function () {
    schliesseBau();
    setzeVorlage(elProgression.value);
    zeichne();
  });

  elVorlage.addEventListener('change', function () {
    schliesseBau();
    schreibeFeld();
    zeichne();
  });

  elNotennamen.addEventListener('change', function () {
    notenStil = elNotennamen.checked ? 'deutsch' : 'international';
    beschrifteTonartenNeu();
    schreibeFeld();          /* B♭ heißt dann B */
    /* Im Zusammenstellen heißt der Ton im Auswahlfeld und auf den Plättchen
       jetzt anders – die Abfolge selbst bleibt dieselbe. */
    if (bauOffen) { fuelleBauToene(); zeichneBauListe(); }
    zeichne();
  });

  elSept.addEventListener('change', function () {
    septAkkorde = elSept.checked;
    schreibeFeld();          /* aus G wird Gmaj7 */
    zeichne();
  });

  elGitarre.addEventListener('change', function () {
    griffModus = elGitarre.checked;
    zeigeLegende();
    zeichne();
  });

  /* ---- Akkorde zusammenstellen ---- */

  elBauOeffnen.addEventListener('click', function () {
    if (bauOffen) {
      /* Nur zugemacht, nichts übernommen: eine aufgegebene Vorlage kommt
         zurück, sonst wäre die Tonartbindung durch einen Blick verloren. */
      schliesseBau(true);
      zeichne();
    } else {
      oeffneBau();
    }
  });

  elBauHinzu.addEventListener('click', function () {
    var ton = bauTonAusWert(elBauTon.value);
    bauListe.push({
      buchstabe: ton.buchstabe, versatz: ton.versatz, typ: elBauArt.value
    });
    bauGeaendert();
  });

  elBauZurueck.addEventListener('click', function () {
    if (!bauListe.length) { return; }
    bauListe.pop();
    bauGeaendert();
  });

  elBauAlles.addEventListener('click', function () {
    if (!bauListe.length) { return; }
    bauListe = [];
    bauGeaendert();
  });

  elBauFertig.addEventListener('click', function () {
    /* ohne Akkord gibt es nichts zu übernehmen – dann bleibt das Feld, wie
       es war, und nur der Auswahlbereich geht zu */
    if (bauListe.length) { uebernimmBauListe(); }
    bauOffen = false;
    zeigeBau();
    zeichne();
  });

  zeichne();
})();
