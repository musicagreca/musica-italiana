/* ===========================================================
   chords.js — trasposizione accordi in notazione italiana
   DO RE MI FA SOL LA SI (maiuscolo) + qualità minuscola
   =========================================================== */

const NOTES_SHARP = ['DO','DO#','RE','RE#','MI','FA','FA#','SOL','SOL#','LA','LA#','SI'];
const NOTES_FLAT  = ['DO','REb','RE','MIb','MI','FA','SOLb','SOL','LAb','LA','SIb','SI'];

// Tonalità che convenzionalmente si scrivono con i bemolle
const FLAT_KEYS = new Set(['FA','SIb','MIb','LAb','REb','SOLb', 'REm','SOLm','DOm','FAm','SIbm','MIbm']);

const NOTE_INDEX = {};
NOTES_SHARP.forEach((n, i) => NOTE_INDEX[n] = i);
NOTES_FLAT.forEach((n, i) => NOTE_INDEX[n] = i);

// Regex per un accordo completo: nota + alterazione + qualità + eventuale basso (/NOTA)
const CHORD_RE = /^(DO|RE|MI|FA|SOL|LA|SI)(#|b)?([^\/\s]*)(?:\/(DO|RE|MI|FA|SOL|LA|SI)(#|b)?)?$/;

function isChordToken(token) {
  return CHORD_RE.test(token.trim());
}

function transposeChord(chord, semitones, targetKeyRoot) {
  const m = chord.match(CHORD_RE);
  if (!m) return chord;
  const [, root, acc, quality, bassRoot, bassAcc] = m;
  const useFlats = targetKeyRoot ? FLAT_KEYS.has(targetKeyRoot) : false;
  const table = useFlats ? NOTES_FLAT : NOTES_SHARP;

  const shiftNote = (note, accidental) => {
    const key = note + (accidental || '');
    const idx = NOTE_INDEX[key];
    if (idx === undefined) return note;
    const newIdx = ((idx + semitones) % 12 + 12) % 12;
    return table[newIdx];
  };

  let result = shiftNote(root, acc) + quality;
  if (bassRoot) {
    result += '/' + shiftNote(bassRoot, bassAcc);
  }
  return result;
}

// Trasla una riga di soli accordi (mantiene spaziatura originale il più possibile)
function transposeChordLine(line, semitones, targetKeyRoot) {
  return line.replace(/(DO|RE|MI|FA|SOL|LA|SI)(#|b)?([^\/\s]*)(?:\/(DO|RE|MI|FA|SOL|LA|SI)(#|b)?)?/g,
    (match) => transposeChord(match, semitones, targetKeyRoot)
  );
}

// Elenco delle 12 tonalità maggiori + minori relative per il menu "Tonalità"
const ALL_KEYS = ['DO','DO#','RE','MIb','MI','FA','FA#','SOL','LAb','LA','SIb','SI'];

function semitonesBetween(fromKey, toKey) {
  const from = NOTE_INDEX[fromKey];
  const to = NOTE_INDEX[toKey];
  if (from === undefined || to === undefined) return 0;
  return to - from;
}

if (typeof module !== 'undefined') {
  module.exports = { transposeChord, transposeChordLine, isChordToken, ALL_KEYS, semitonesBetween, NOTE_INDEX };
}
/* ===========================================================
   Mappa accordo -> codice immagine schema (cartella images/accordi)
   =========================================================== */
const ROOT_IDX_TO_CODE_SHARP = ['do','dodies','re','redies','mi','fa','fadies','sol','soldies','la','ladies','si'];
const ROOT_IDX_TO_CODE_FLAT  = ['do','reb','re','mib','mi','fa','sob','sol','lab','la','sib','si'];

function suffixToImageCodeFull(suf) {
  const s = (suf || '').toLowerCase();
  if (!s) return '';
  if (/^(maj7|major7)/.test(s)) return 'maj7';
  if (/^dim/.test(s)) return 'dim';
  if (/^aug/.test(s)) return 'aug';
  if (/^sus/.test(s)) return 'sus';
  if (/^(m|min)7/.test(s)) return '-7';
  if (/^(m|min)6/.test(s)) return '-6';
  if (/^(m|min)9/.test(s)) return '-9';
  if (/^(m|min)/.test(s)) return '-';
  if (/^7/.test(s)) return '7';
  if (/^6/.test(s)) return '6';
  if (/^9/.test(s)) return '9';
  return '';
}

function chordToImageCode(chordTok) {
  const m = (chordTok || '').trim().match(/^(DO|RE|MI|FA|SOL|LA|SI)(#|b)?([^\/\s]*)/);
  if (!m) return null;
  const [, root, acc, quality] = m;
  const key = root + (acc || '');
  const idx = NOTE_INDEX[key];
  if (idx === undefined) return null;
  const table = acc === 'b' ? ROOT_IDX_TO_CODE_FLAT : ROOT_IDX_TO_CODE_SHARP;
  return table[idx] + suffixToImageCodeFull(quality);
}

// Elenco completo dei codici disponibili (schemi in images/accordi/*.png), raggruppati per nota
const CHORD_LIST = ['do','do-','do6','do7','do9','do-6','do-7','domaj7',
'dodim','doaug','dosus','dodies','dodies-','dodies6','dodies7','dodies9',
'dodies-6','dodies-7','dodiesmaj7','dodiesdim','dodiesaug','dodiessus','reb','reb-',
'reb6','reb7','reb9','reb-6','reb-7','rebmaj7','rebdim','rebaug',
'rebsus','re','re-','re6','re7','re9','re-6','re-7',
'remaj7','redim','reaug','resus','redies','redies-','redies6','redies7',
'redies9','redies-6','redies-7','rediesmaj7','rediesdim','rediesaug','rediessus','mib',
'mib-','mib6','mib7','mib9','mib-6','mib-7','mibmaj7','mibdim',
'mibaug','mibsus','mi','mi-','mi6','mi7','mi9','mi-6',
'mi-7','mimaj7','midim','miaug','misus','fa','fa-','fa6',
'fa7','fa9','fa-6','fa-7','famaj7','fadim','faaug','fasus',
'fadies','fadies-','fadies6','fadies7','fadies9','fadies-6','fadies-7','fadiesmaj7',
'fadiesdim','fadiesaug','fadiessus','sob','sob-','sob6','sob7','sob9',
'sob-6','sob-7','sobmaj7','sobdim','sobaug','sobsus','sol','sol-',
'sol6','sol7','sol9','sol-6','sol-7','solmaj7','soldim','solaug',
'solsus','soldies','soldies-','soldies6','soldies7','soldies9','soldies-6','soldies-7',
'soldiesmaj7','soldiesdim','soldiesaug','soldiessus','lab','lab-','lab6','lab7',
'lab9','lab-6','lab-7','labmaj7','labdim','labaug','labsus','la',
'la-','la6','la7','la9','la-6','la-7','lamaj7','ladim',
'laaug','lasus','ladies','ladies-','ladies6','ladies7','ladies9','ladies-6',
'ladies-7','ladiesmaj7','ladiesdim','ladiesaug','ladiessus','sib','sib-','sib6',
'sib7','sib9','sib-6','sib-7','sibmaj7','sibdim','sibaug','sibsus',
'si','si-','si6','si7','si9','si-6','si-7','simaj7',
'sidim','siaug','sisus'];

const CHORD_ROOTS = [['dodies','Do♯'],['redies','Re♯'],['fadies','Fa♯'],['soldies','Sol♯'],['ladies','La♯'],
['reb','Re♭'],['mib','Mi♭'],['lab','La♭'],['sib','Si♭'],['sob','Sol♭'],
['do','Do'],['re','Re'],['mi','Mi'],['fa','Fa'],['sol','Sol'],['si','Si'],['la','La']];

function chordLabel(code) {
  for (let i = 0; i < CHORD_ROOTS.length; i++) {
    if (code.indexOf(CHORD_ROOTS[i][0]) === 0) {
      let suf = code.slice(CHORD_ROOTS[i][0].length);
      suf = suf.replace(/^-/, 'm');
      return CHORD_ROOTS[i][1] + suf;
    }
  }
  return code;
}

if (typeof module !== 'undefined') {
  module.exports.chordToImageCode = chordToImageCode;
  module.exports.chordLabel = chordLabel;
  module.exports.CHORD_LIST = CHORD_LIST;
}
