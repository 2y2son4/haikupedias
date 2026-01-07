import { NoteValue } from '@haikupedias/core/types';
import { noteToFrequency } from './note-frequency';
import { INotePlayer } from './note-player.interface';

/**
 * Note player using Web Audio API oscillators (synthetic sounds)
 */
export class SyntheticNotePlayer implements INotePlayer {
  private gainNode: GainNode;

  constructor(private audioContext: AudioContext) {
    // Create a gain node for volume control
    this.gainNode = audioContext.createGain();
    this.gainNode.connect(audioContext.destination);
    this.gainNode.gain.value = 0.3; // Default volume (30%)
  }

  /**
   * Play a single note with specified duration
   * @param note - Note value (0-11)
   * @param startTime - When to start playing (in audio context time)
   * @param duration - How long to play the note (in seconds)
   */
  playNote(note: NoteValue, startTime: number, duration: number): void {
    const frequency = noteToFrequency(note);

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine'; // Simple sine wave for clean sound
    oscillator.frequency.value = frequency;

    // Create envelope gain node for smooth attack/release
    const noteGain = this.audioContext.createGain();
    noteGain.gain.value = 0;

    // Connect: oscillator -> noteGain -> masterGain -> destination
    oscillator.connect(noteGain);
    noteGain.connect(this.gainNode);

    // Schedule envelope: quick attack, sustain, then release
    const attackTime = 0.05; // 50ms attack
    const releaseTime = 0.1; // 100ms release

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(1, startTime + attackTime);
    noteGain.gain.setValueAtTime(1, startTime + duration - releaseTime);
    noteGain.gain.linearRampToValueAtTime(0, startTime + duration);

    // Start and stop oscillator
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    // Clean up after note finishes
    oscillator.onended = () => {
      oscillator.disconnect();
      noteGain.disconnect();
    };
  }

  /**
   * Set master volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.value = clampedVolume;
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.gainNode.gain.value;
  }
}
