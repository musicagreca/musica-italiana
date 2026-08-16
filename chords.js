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
