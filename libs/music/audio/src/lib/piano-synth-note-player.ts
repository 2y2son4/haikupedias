import { NoteValue } from '@haikupedias/core/types';
import * as Tone from 'tone';
import { INotePlayer } from './note-player.interface';

/**
 * Note name mapping for Tone.js
 */
const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

/**
 * Note player using Tone.js with polyphonic FM synthesizer
 * Creates rich, piano-like sounds using frequency modulation synthesis
 */
export class PianoSynthNotePlayer implements INotePlayer {
  private synth: Tone.PolySynth;
  private volume: Tone.Volume;

  constructor(private audioContext: AudioContext) {
    // Create volume node for master control
    this.volume = new Tone.Volume(-10).toDestination(); // -10dB default (approximately 30% volume)

    // Create polyphonic synth with piano-like settings
    // Using FM synthesis for richer harmonic content
    this.synth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01,
      modulationIndex: 14,
      oscillator: {
        type: 'triangle',
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.4,
        release: 0.8,
      },
      modulation: {
        type: 'square',
      },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.5,
      },
    }).connect(this.volume);
  }

  /**
   * Convert note value (0-11) to Tone.js note name
   * Uses octave 4 as the base octave for consistency
   */
  private noteValueToName(note: NoteValue): string {
    return `${NOTE_NAMES[note]}4`;
  }

  /**
   * Play a single note with specified duration
   * @param note - Note value (0-11)
   * @param startTime - When to start playing (in audio context time)
   * @param duration - How long to play the note (in seconds)
   */
  playNote(note: NoteValue, startTime: number, duration: number): void {
    // Ensure Tone.js context is started (required for browser autoplay policies)
    if (Tone.context.state !== 'running') {
      Tone.start();
    }

    const noteName = this.noteValueToName(note);

    // Convert audio context time to Tone.js time
    const toneTime = startTime - this.audioContext.currentTime + Tone.now();

    // Trigger note with attack and release
    this.synth.triggerAttackRelease(noteName, duration, toneTime);
  }

  /**
   * Set master volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    // Convert linear volume (0-1) to decibels (-60 to 0)
    const db = clampedVolume === 0 ? -60 : 20 * Math.log10(clampedVolume);
    this.volume.volume.value = db;
  }

  /**
   * Get current volume (0.0 to 1.0)
   */
  getVolume(): number {
    const db = this.volume.volume.value;
    // Convert decibels back to linear scale
    if (db <= -60) return 0;
    return Math.pow(10, db / 20);
  }
}
