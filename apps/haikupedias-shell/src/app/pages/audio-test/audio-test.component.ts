import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AudioContextManager,
  CompositionPlayer,
} from '@haikupedias/music/audio';
import { Composition, NoteValue } from '@haikupedias/core/types';

@Component({
  selector: 'app-audio-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audio-test">
      <h2>Audio Engine Test</h2>

      <div class="status">
        <p>Status: {{ status() }}</p>
      </div>

      <div class="controls">
        <button (click)="initializeAudio()" [disabled]="isInitialized()">
          Initialize Audio
        </button>

        <button (click)="playTestNote()" [disabled]="!isInitialized()">
          Play Test Note (C4)
        </button>

        <button (click)="playTestComposition()" [disabled]="!isInitialized()">
          Play Test Composition
        </button>
      </div>

      <div class="info">
        <h3>What This Tests:</h3>
        <ul>
          <li>
            Audio context initialization (browser autoplay policy handling)
          </li>
          <li>Single note playback with oscillator</li>
          <li>Multi-note composition scheduling</li>
          <li>Note-to-frequency conversion</li>
        </ul>

        <p class="note">
          <strong>Note:</strong> You must click "Initialize Audio" first due to
          browser autoplay policies.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .audio-test {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }

      h2 {
        color: #333;
        margin-bottom: 1.5rem;
      }

      .status {
        background: #f0f0f0;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
      }

      .controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      button {
        padding: 0.75rem 1.5rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.2s;
      }

      button:hover:not(:disabled) {
        background: #0056b3;
      }

      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .info {
        background: #e7f3ff;
        padding: 1.5rem;
        border-radius: 4px;
        border-left: 4px solid #007bff;
      }

      .info h3 {
        margin-top: 0;
        color: #0056b3;
      }

      .info ul {
        margin: 1rem 0;
      }

      .info li {
        margin-bottom: 0.5rem;
      }

      .note {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #b3d9ff;
        color: #004085;
      }
    `,
  ],
})
export class AudioTestComponent {
  private audioManager: AudioContextManager | null = null;
  private player: CompositionPlayer | null = null;

  status = signal('Not initialized');
  isInitialized = signal(false);

  async initializeAudio() {
    try {
      this.status.set('Initializing...');
      this.audioManager = new AudioContextManager();
      await this.audioManager.initialize();

      const context = this.audioManager.getContext();
      this.player = new CompositionPlayer(context);

      this.isInitialized.set(true);
      this.status.set('Ready! Audio context initialized.');
    } catch (error) {
      this.status.set(`Error: ${error}`);
      console.error('Failed to initialize audio:', error);
    }
  }

  playTestNote() {
    if (!this.player) return;

    this.status.set('Playing C4 note (middle C)...');

    // Create a simple test composition with just C4
    const testComposition: Composition = {
      bars: [
        {
          tonic: 0 as NoteValue, // C
          steps: [],
        },
      ],
    };

    this.player.play(testComposition, 1.0); // Play for 1 second

    setTimeout(() => {
      this.status.set('Ready!');
    }, 1200);
  }

  playTestComposition() {
    if (!this.player) return;

    this.status.set('Playing test composition (C major arpeggio)...');

    // Create a simple C major arpeggio composition
    const testComposition: Composition = {
      bars: [
        {
          tonic: 0 as NoteValue, // C
          steps: [
            { root: 0 as NoteValue, interval: 4, result: 4 as NoteValue }, // C -> E
            { root: 4 as NoteValue, interval: 3, result: 7 as NoteValue }, // E -> G
            { root: 7 as NoteValue, interval: 5, result: 0 as NoteValue }, // G -> C
            { root: 0 as NoteValue, interval: 0, result: 0 as NoteValue }, // C (hold)
          ],
        },
      ],
    };

    this.player.play(testComposition, 0.8); // Each note 0.8 seconds

    setTimeout(() => {
      this.status.set('Ready!');
    }, 5000);
  }
}
