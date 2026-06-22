/**
 * Playback state
 */
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'stopped';

/**
 * Available instruments from tonejs-instruments
 */
export type InstrumentType =
  | 'bass-electric'
  | 'bassoon'
  | 'cello'
  | 'flute'
  | 'guitar-acoustic'
  | 'guitar-electric'
  | 'harmonium'
  | 'organ'
  | 'piano'
  | 'saxophone'
  // | 'violin'
  | 'xylophone';

  import { NoteValue } from '@haikupedias/core/types';

  /**
   * Interface for note playback implementations
   * Allows different sound engines (Web Audio API, Tone.js, etc.)
   */
  export interface INotePlayer {
    /**
     * Play a single note with specified duration
     * @param note - Note value (0-11)
     * @param startTime - When to start playing (in audio context time)
     * @param duration - How long to play the note (in seconds)
     */
    playNote(note: NoteValue, startTime: number, duration: number): void;

    /**
     * Set master volume
     * @param volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume: number): void;

    /**
     * Get current volume (0.0 to 1.0)
     */
    getVolume(): number;
  }

