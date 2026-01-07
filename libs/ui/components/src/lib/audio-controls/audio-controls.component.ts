import { Component, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Composition } from '@haikupedias/core/types';
import {
  AudioContextManager,
  CompositionPlayer,
  INotePlayer,
  SyntheticNotePlayer,
  PianoSynthNotePlayer,
  PianoNotePlayer,
} from '@haikupedias/music/audio';
import {
  CompositionArranger,
  ScheduledNote,
} from '@haikupedias/music/arrangers/base-arranger';
import { GymnopedieArranger } from '@haikupedias/music/arrangers/gymnopedie-arranger';
import { DodecaphonicArranger } from '@haikupedias/music/arrangers/dodecaphonic-arranger';

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

  // Output event when genre is selected
  genreSelectedEvent = output<'gymnopedie' | 'dodecaphonic'>();

  private audioManager: AudioContextManager | null = null;
  private player: CompositionPlayer | null = null;
  private syntheticPlayer: INotePlayer | null = null;
  private pianoSynthPlayer: INotePlayer | null = null;
  private pianoSamplesPlayer: INotePlayer | null = null;

  // Arrangers for different musical interpretations (public for template access)
  gymnoArranger = new GymnopedieArranger();
  dodecaArranger = new DodecaphonicArranger();
  currentArranger = signal<CompositionArranger>(this.gymnoArranger); // Default to Gymnopédie

  // Sound type selection
  soundType = signal<'synthetic' | 'piano-synth' | 'piano-samples'>(
    'synthetic',
  ); // Default to synthetic
  soundTypeSelected = signal(false);

  playbackState = signal<PlaybackState>('idle');
  isInitialized = signal(false);
  errorMessage = signal<string | null>(null);
  hasPlayed = signal(false);
  genreSelected = signal(false);

  constructor() {
    // Auto-initialize audio when component is created
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      this.audioManager = new AudioContextManager();
      await this.audioManager.initialize();

      const context = this.audioManager.getContext();

      // Create all three note players
      this.syntheticPlayer = new SyntheticNotePlayer(context);
      this.pianoSynthPlayer = new PianoSynthNotePlayer(context);
      this.pianoSamplesPlayer = new PianoNotePlayer(context);

      // Initialize player with default (synthetic)
      this.player = new CompositionPlayer(context, this.syntheticPlayer);

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

      // Arrange composition using current arranger
      const arranger = this.currentArranger();
      const notes = arranger.arrange(comp, 1.2);

      // Play arranged notes
      this.player.play(notes);

      // Calculate duration and schedule state change
      const duration = this.calculateDuration(notes);
      setTimeout(() => {
        this.playbackState.set('stopped');
      }, duration);
    } catch (error) {
      this.errorMessage.set('Playback failed. Please try again.');
      this.playbackState.set('stopped');
      console.error('Playback error:', error);
    }
  }

  private calculateDuration(notes: ScheduledNote[]): number {
    const lastNote = notes[notes.length - 1];
    return (lastNote.startTime + lastNote.duration) * 1000;
  }

  replay() {
    this.play();
  }

  selectGenre(arranger: CompositionArranger) {
    this.currentArranger.set(arranger);
    this.genreSelected.set(true);
    // Emit which genre was selected
    const genreType =
      arranger === this.gymnoArranger ? 'gymnopedie' : 'dodecaphonic';
    this.genreSelectedEvent.emit(genreType);
  }

  selectSoundType(type: 'synthetic' | 'piano-synth' | 'piano-samples') {
    this.soundType.set(type);
    this.soundTypeSelected.set(true);

    // Update player with new sound type
    if (this.audioManager) {
      const context = this.audioManager.getContext();
      let notePlayer: INotePlayer | null = null;

      if (type === 'synthetic') {
        notePlayer = this.syntheticPlayer;
      } else if (type === 'piano-synth') {
        notePlayer = this.pianoSynthPlayer;
      } else {
        notePlayer = this.pianoSamplesPlayer;
      }

      if (notePlayer) {
        this.player = new CompositionPlayer(context, notePlayer);
      }
    }
  }

  togglePlaybackStyle() {
    const current = this.currentArranger();
    const newArranger =
      current === this.gymnoArranger ? this.dodecaArranger : this.gymnoArranger;
    this.currentArranger.set(newArranger);

    // Emit the genre change event
    const genreType =
      newArranger === this.gymnoArranger ? 'gymnopedie' : 'dodecaphonic';
    this.genreSelectedEvent.emit(genreType);
  }

  toggleSoundType() {
    const current = this.soundType();
    let newType: 'synthetic' | 'piano-synth' | 'piano-samples';

    // Cycle through: synthetic -> piano-synth -> piano-samples -> synthetic
    if (current === 'synthetic') {
      newType = 'piano-synth';
    } else if (current === 'piano-synth') {
      newType = 'piano-samples';
    } else {
      newType = 'synthetic';
    }

    this.selectSoundType(newType);
  }

  onRestart() {
    this.restart.emit();
  }

  get canPlay(): boolean {
    return (
      this.isInitialized() &&
      this.composition() !== null &&
      this.genreSelected() &&
      this.soundTypeSelected() &&
      this.playbackState() !== 'playing'
    );
  }

  get canSelectGenre(): boolean {
    return (
      this.isInitialized() &&
      this.composition() !== null &&
      this.soundTypeSelected()
    );
  }

  get canSelectSoundType(): boolean {
    return this.isInitialized() && this.composition() !== null;
  }

  get isPlaying(): boolean {
    return this.playbackState() === 'playing';
  }

  get styleLabel(): string {
    return this.currentArranger().getName();
  }

  get soundLabel(): string {
    const type = this.soundType();
    if (type === 'synthetic') return 'Synthetic';
    if (type === 'piano-synth') return 'Piano Synth';
    return 'Piano Samples';
  }

  get currentGenre(): 'gymnopedie' | 'dodecaphonic' | null {
    if (!this.genreSelected()) return null;
    return this.currentArranger() === this.gymnoArranger
      ? 'gymnopedie'
      : 'dodecaphonic';
  }

  async downloadComposition() {
    const comp = this.composition();
    if (!comp) return;

    try {
      // Arrange composition using current arranger
      const arranger = this.currentArranger();
      const notes = arranger.arrange(comp, 1.2);

      // Calculate duration
      const lastNote = notes[notes.length - 1];
      const duration = lastNote.startTime + lastNote.duration;

      // Create offline context for rendering
      const sampleRate = 44100;
      const offlineContext = new OfflineAudioContext(
        1, // mono
        Math.ceil(sampleRate * duration),
        sampleRate,
      );

      // Create offline note player (using synthetic for consistent rendering)
      const offlineNotePlayer = new SyntheticNotePlayer(
        offlineContext as unknown as AudioContext,
      );

      // Create player with offline context and play arranged notes
      const offlinePlayer = new CompositionPlayer(
        offlineContext as unknown as AudioContext,
        offlineNotePlayer,
      );
      offlinePlayer.play(notes);

      // Render to buffer
      const renderedBuffer = await offlineContext.startRendering();

      // Convert to WAV
      const wavBlob = this.audioBufferToWav(renderedBuffer);

      // Download
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      const arrangerName = arranger
        .getName()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      a.download = `haikupedia-${arrangerName}-${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      this.errorMessage.set('Download failed. Please try again.');
      console.error('Download error:', error);
    }
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // RIFF identifier
    setUint32(0x46464952);
    // file length minus RIFF identifier length and file description length
    setUint32(36 + length);
    // RIFF type & Format
    setUint32(0x45564157);
    setUint32(0x20746d66);
    // format chunk length
    setUint32(16);
    // sample format (raw)
    setUint16(1);
    // channel count
    setUint16(buffer.numberOfChannels);
    // sample rate
    setUint32(buffer.sampleRate);
    // byte rate (sample rate * block align)
    setUint32(buffer.sampleRate * buffer.numberOfChannels * 2);
    // block align (channel count * bytes per sample)
    setUint16(buffer.numberOfChannels * 2);
    // bits per sample
    setUint16(16);
    // data chunk identifier
    setUint32(0x61746164);
    // data chunk length
    setUint32(length);

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < arrayBuffer.byteLength) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }
}
