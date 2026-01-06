/**
 * Numeric representation of notes (0-11)
 * 0 = C, 1 = C#, 2 = D, etc.
 */
export type NoteValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/**
 * Interval in semitones
 */
export type IntervalValue = number;

/**
 * A harmonic step in a bar
 */
export interface HarmonicStep {
  root: NoteValue;
  interval: IntervalValue;
  result: NoteValue;
}

/**
 * A musical bar containing harmonic steps
 */
export interface Bar {
  tonic: NoteValue;
  steps: HarmonicStep[];
}

/**
 * Complete musical composition
 */
export interface Composition {
  bars: Bar[];
}
