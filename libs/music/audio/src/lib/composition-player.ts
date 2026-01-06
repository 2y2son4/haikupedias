import { Composition } from '@haikupedias/core/types';
import { NotePlayer } from './note-player';

/**
 * Playback state
 */
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'stopped';

/**
 * Composition player with scheduling and playback controls
 */
export class CompositionPlayer {
  private notePlayer: NotePlayer;
  private state: PlaybackState = 'idle';
  private startTime = 0;
  private pauseTime = 0;
  private scheduledNotes = 0;

  constructor(private audioContext: AudioContext) {
    this.notePlayer = new NotePlayer(audioContext);
  }

  /**
   * Play a composition
   * @param composition - The composition to play
   * @param noteDuration - Duration of each note in seconds (default: 1.5s)
   */
  play(composition: Composition, noteDuration = 1.5): void {
    if (this.state === 'playing') {
      return; // Already playing
    }

    this.state = 'playing';
    this.startTime = this.audioContext.currentTime;
    this.scheduledNotes = 0;

    // Schedule all notes
    let currentTime = this.startTime;

    for (const bar of composition.bars) {
      // Play each harmonic step (root note of first step is the tonic)
      for (const step of bar.steps) {
        // Play the root note (starting note of this step)
        this.notePlayer.playNote(step.root, currentTime, noteDuration);
        currentTime += noteDuration;
        this.scheduledNotes++;
      }
    }

    // Calculate total duration and schedule state reset
    const totalDuration = this.scheduledNotes * noteDuration;
    setTimeout(() => {
      if (this.state === 'playing') {
        this.state = 'idle';
      }
    }, totalDuration * 1000);
  }

  /**
   * Stop playback
   * Note: Cannot stop oscillators once scheduled in Web Audio API
   * This will mark state as stopped but notes will continue playing
   */
  stop(): void {
    this.state = 'stopped';
    this.scheduledNotes = 0;
  }

  /**
   * Get current playback state
   */
  getState(): PlaybackState {
    return this.state;
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.state === 'playing';
  }

  /**
   * Set playback volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.notePlayer.setVolume(volume);
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.notePlayer.getVolume();
  }
}
