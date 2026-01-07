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
 * Note player using Tone.js with high-quality piano samples
 * Samples from https://nbrosowsky.github.io/tonejs-instruments/
 */
export class PianoNotePlayer implements INotePlayer {
  private sampler: Tone.Sampler;
  private volume: Tone.Volume;
  private isReady = false;

  constructor(private audioContext: AudioContext) {
    // Create volume node for master control
    this.volume = new Tone.Volume(-10).toDestination(); // -10dB default (approximately 30% volume)

    // Create piano sampler with high-quality samples from tonejs-instruments
    // Using minified sample set for faster loading
    this.sampler = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3',
        A1: 'A1.mp3',
        A2: 'A2.mp3',
        A3: 'A3.mp3',
        A4: 'A4.mp3',
        A5: 'A5.mp3',
        A6: 'A6.mp3',
        A7: 'A7.mp3',
        C1: 'C1.mp3',
        C2: 'C2.mp3',
        C3: 'C3.mp3',
        C4: 'C4.mp3',
        C5: 'C5.mp3',
        C6: 'C6.mp3',
        C7: 'C7.mp3',
        C8: 'C8.mp3',
        'D#1': 'Ds1.mp3',
        'D#2': 'Ds2.mp3',
        'D#3': 'Ds3.mp3',
        'D#4': 'Ds4.mp3',
        'D#5': 'Ds5.mp3',
        'D#6': 'Ds6.mp3',
        'D#7': 'Ds7.mp3',
        'F#1': 'Fs1.mp3',
        'F#2': 'Fs2.mp3',
        'F#3': 'Fs3.mp3',
        'F#4': 'Fs4.mp3',
        'F#5': 'Fs5.mp3',
        'F#6': 'Fs6.mp3',
        'F#7': 'Fs7.mp3',
      },
      release: 1,
      baseUrl: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/',
      onload: () => {
        this.isReady = true;
      },
    }).connect(this.volume);
  }

  /**
   * Convert note value (0-11) to Tone.js note name
   * Uses octave 4 as the base octave for consistency with synthetic player
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
}
