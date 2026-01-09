import { NoteValue } from '@haikupedias/core/types';
import * as Tone from 'tone';
import { INSTRUMENT_SAMPLES, NOTE_NAMES } from './static/notes';
import { INotePlayer, InstrumentType } from './models/music-audio.model';

/**
 * Note player using Tone.js with selectable instrument samples
 * Samples from https://nbrosowsky.github.io/tonejs-instruments/
 */
export class InstrumentNotePlayer implements INotePlayer {
  private sampler: Tone.Sampler | null = null;
  private volume: Tone.Volume;
  private isReady = false;
  private currentInstrument: InstrumentType;

  constructor(
    private audioContext: AudioContext,
    instrument: InstrumentType = 'piano',
  ) {
    this.currentInstrument = instrument;

    // Create volume node for master control
    this.volume = new Tone.Volume(-10).toDestination(); // -10dB default (approximately 30% volume)

    // Load initial instrument
    this.loadInstrument(instrument);
  }

  /**
   * Load a specific instrument
   */
  private loadInstrument(instrument: InstrumentType): void {
    this.isReady = false;

    // Dispose of old sampler if exists
    if (this.sampler) {
      this.sampler.dispose();
    }

    // Create new sampler with instrument samples
    this.sampler = new Tone.Sampler({
      urls: INSTRUMENT_SAMPLES[instrument],
      release: 1,
      baseUrl: `https://nbrosowsky.github.io/tonejs-instruments/samples/${instrument}/`,
      onload: () => {
        this.isReady = true;
      },
    }).connect(this.volume);
  }

  /**
   * Change the current instrument
   * @param instrument - The instrument to switch to
   */
  changeInstrument(instrument: InstrumentType): void {
    if (this.currentInstrument === instrument) {
      return; // Already loaded
    }

    this.currentInstrument = instrument;
    this.loadInstrument(instrument);
  }

  /**
   * Get the current instrument
   */
  getCurrentInstrument(): InstrumentType {
    return this.currentInstrument;
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
    if (!this.sampler) return;

    // Ensure Tone.js context is started (required for browser autoplay policies)
    if (Tone.context.state !== 'running') {
      Tone.start();
    }

    const noteName = this.noteValueToName(note);

    // Convert audio context time to Tone.js time
    const toneTime = startTime - this.audioContext.currentTime + Tone.now();

    // Trigger note with attack and release
    this.sampler.triggerAttackRelease(noteName, duration, toneTime);
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

  /**
   * Check if sampler is ready (samples loaded)
   */
  isPlayerReady(): boolean {
    return this.isReady;
  }

  /**
   * Clean up resources and dispose of Tone.js nodes
   * Should be called when the player is no longer needed to prevent memory leaks
   */
  dispose(): void {
    if (this.sampler) {
      this.sampler.dispose();
      this.sampler = null;
    }
    if (this.volume) {
      this.volume.dispose();
    }
    this.isReady = false;
  }
}
