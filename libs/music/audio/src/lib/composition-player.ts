import { ScheduledNote } from '@haikupedias/music/arrangers/base-arranger';
import { NotePlayer } from './note-player';

/**
 * Playback state
 */
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'stopped';

/**
 * Composition player with scheduling and playback controls
 *
 * This class is a simple audio playback engine that plays scheduled notes.
 * It does not contain any musical interpretation logic - that is handled by arrangers.
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
   * Play a sequence of scheduled notes
   * @param notes - Array of notes with timing information
   */
  play(notes: ScheduledNote[]): void {
    if (this.state === 'playing') {
      return; // Already playing
    }

    this.state = 'playing';
    this.startTime = this.audioContext.currentTime;
    this.scheduledNotes = notes.length;

    // Schedule all notes
    for (const note of notes) {
      this.notePlayer.playNote(
        note.note,
        this.startTime + note.startTime,
        note.duration,
      );
    }

    // Calculate total duration and schedule state reset
    const lastNote = notes[notes.length - 1];
    const totalDuration = lastNote.startTime + lastNote.duration;

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
