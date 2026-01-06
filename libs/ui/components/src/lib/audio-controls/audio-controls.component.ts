import { Component, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Composition } from '@haikupedias/core/types';
import {
  AudioContextManager,
  CompositionPlayer,
} from '@haikupedias/music/audio';

type PlaybackState = 'idle' | 'playing' | 'stopped';

@Component({
  selector: 'lib-audio-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-controls.component.html',
  styleUrl: './audio-controls.component.scss',
})
export class AudioControlsComponent {
  // Input composition to play
  composition = input.required<Composition | null>();

  // Output event for restarting the entire process
  restart = output<void>();

  private audioManager: AudioContextManager | null = null;
  private player: CompositionPlayer | null = null;

  playbackState = signal<PlaybackState>('idle');
  isInitialized = signal(false);
  errorMessage = signal<string | null>(null);
  hasPlayed = signal(false);

  constructor() {
    // Auto-initialize audio when component is created
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      this.audioManager = new AudioContextManager();
      await this.audioManager.initialize();

      const context = this.audioManager.getContext();
      this.player = new CompositionPlayer(context);

      this.isInitialized.set(true);
    } catch (error) {
      this.errorMessage.set(
        'Failed to initialize audio. Please refresh the page.',
      );
      console.error('Audio initialization error:', error);
    }
  }

  async play() {
    const comp = this.composition();
    if (!this.player || !comp) return;

    try {
      this.playbackState.set('playing');
      this.errorMessage.set(null);
      this.hasPlayed.set(true);

      // Play composition with 1.2 second notes
      this.player.play(comp, 1.2);

      // Calculate total duration: (tonic + 4 steps) * bars * note duration
      const totalNotes = comp.bars.length * 5;
      const duration = totalNotes * 1.2 * 1000;

      // Reset state after playback completes
      setTimeout(() => {
        this.playbackState.set('stopped');
      }, duration);
    } catch (error) {
      this.errorMessage.set('Playback failed. Please try again.');
      this.playbackState.set('stopped');
      console.error('Playback error:', error);
    }
  }

  replay() {
    this.play();
  }

  onRestart() {
    this.restart.emit();
  }

  get canPlay(): boolean {
    return (
      this.isInitialized() &&
      this.composition() !== null &&
      this.playbackState() !== 'playing'
    );
  }

  get isPlaying(): boolean {
    return this.playbackState() === 'playing';
  }
}
