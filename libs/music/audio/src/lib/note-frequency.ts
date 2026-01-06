import { NoteValue } from '@haikupedias/core/types';

/**
 * Base frequency for A4 (440 Hz)
 */
const A4_FREQUENCY = 440;

/**
 * MIDI note number for A4
 */
const A4_MIDI_NOTE = 69;

/**
 * Convert a note value (0-11) to a frequency in Hz
 * Uses equal temperament tuning
 *
 * @param note - Note value where 0 = C, 1 = C#, 2 = D, etc.
 * @param octave - Octave number (default 4 for middle C octave)
 * @returns Frequency in Hz
 */
export function noteToFrequency(note: NoteValue, octave = 4): number {
  // Calculate MIDI note number
  // C4 = 60, so C of octave 4 is 60 + note
  const midiNote = 12 * (octave + 1) + note;

  // Calculate frequency using equal temperament formula
  // f = 440 * 2^((n - 69) / 12)
  const semitoneDistance = midiNote - A4_MIDI_NOTE;
  const frequency = A4_FREQUENCY * Math.pow(2, semitoneDistance / 12);

  return frequency;
}

/**
 * Get frequency for a specific note name
 * Useful for testing and debugging
 */
export function getFrequencyForNote(noteName: string, octave = 4): number {
  const noteMap: { [key: string]: NoteValue } = {
    C: 0,
    'C#': 1,
    D: 2,
    'D#': 3,
    E: 4,
    F: 5,
    'F#': 6,
    G: 7,
    'G#': 8,
    A: 9,
    'A#': 10,
    B: 11,
  };

  const noteValue = noteMap[noteName];
  if (noteValue === undefined) {
    throw new Error(`Invalid note name: ${noteName}`);
  }

  return noteToFrequency(noteValue as NoteValue, octave);
}
