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
      be: be
    };
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

    /* Grundton und Basston farblich abgesetzt, zweite Oktave schwächer.
       Der Basston hat Vorrang – außer er ist ohnehin der Grundton. */
    function klasse(pc, untereOktave) {
      var teile = ['is-akkordton'];
      if (akkord.bassPc !== null && pc === akkord.bassPc && pc !== akkord.grundtonPc) {
        teile = ['is-bass'];
      } else if (pc === akkord.grundtonPc) {
        teile = ['is-grundton'];
      }
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
     5. Seite zeichnen
     --------------------------------------------------------------- */

  var elTonart = document.getElementById('tonart');
  var elProgression = document.getElementById('progression');
  var elVorlage = document.getElementById('vorlage');
  var elErgebnis = document.getElementById('ergebnis');
  var elNotennamen = document.getElementById('notennamen');
  var elSept = document.getElementById('septakkorde');

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

    box.appendChild(buildTastatur(akkord));
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
        tonart: ta.id, progression: progression, noten: notenStil, sept: septAkkorde
      }));
    } catch (e) { /* privater Modus o. Ä. – dann eben nicht */ }

    /* Teilbarer Link, z. B. ?tonart=G-Dur&p=I%20V%20vi%20IV&noten=deutsch&sept=1 */
    try {
      var neu = '?tonart=' + encodeURIComponent(ta.id) +
                '&p=' + encodeURIComponent(progression.trim()) +
                (notenStil === 'deutsch' ? '&noten=deutsch' : '') +
                (septAkkorde ? '&sept=1' : '');
      window.history.replaceState(null, '', neu);
    } catch (e) { /* bei file:// nicht überall erlaubt */ }
  }

  function ladeAusAdresse() {
    try {
      var p = new URLSearchParams(window.location.search);
      return {
        tonart: p.get('tonart'), progression: p.get('p'),
        noten: p.get('noten'), sept: p.get('sept')
      };
    } catch (e) {
      return { tonart: null, progression: null, noten: null, sept: null };
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

  zeichne();
})();
