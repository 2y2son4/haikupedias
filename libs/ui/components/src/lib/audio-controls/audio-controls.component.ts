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
  InstrumentNotePlayer,
  SORTED_INSTRUMENTS,
  INSTRUMENT_NAMES,
  InstrumentType,
} from '@haikupedias/music/audio';
import {
  CompositionArranger,
  ScheduledNote,
} from '@haikupedias/music/arrangers/base-arranger';
import { GymnopedieArranger } from '@haikupedias/music/arrangers/gymnopedie-arranger';
import { DodecaphonicArranger } from '@haikupedias/music/arrangers/dodecaphonic-arranger';

type PlaybackState = 'idle' | 'playing' | 'stopped';
type HighlightKind = 'single' | 'chord' | 'generated' | 'none';

export interface PlaybackHighlightEvent {
  activeWordIndices: number[];
  activeNoteIndices: number[];
  kind: HighlightKind;
}

type HighlightCue = {
  startMs: number;
  endMs: number;
  wordIndices: number[];
  noteIndices: number[];
  kind: Exclude<HighlightKind, 'none'>;
};

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
  playbackHighlightChanged = output<PlaybackHighlightEvent>();

  private audioManager: AudioContextManager | null = null;
  private player: CompositionPlayer | null = null;
  private syntheticPlayer: INotePlayer | null = null;
  private pianoSynthPlayer: INotePlayer | null = null;
  private pianoSamplesPlayer: INotePlayer | null = null;
  private instrumentPlayer: InstrumentNotePlayer | null = null;
  private highlightTimeoutIds: number[] = [];

  // Arrangers for different musical interpretations (public for template access)
  gymnoArranger = new GymnopedieArranger();
  dodecaArranger = new DodecaphonicArranger();
  currentArranger = signal<CompositionArranger>(this.gymnoArranger); // Default to Gymnopédie

  // Sound type selection
  soundType = signal<
    'synthetic' | 'piano-synth' | 'piano-samples' | 'instruments'
  >('synthetic'); // Default to synthetic
  soundTypeSelected = signal(false);

  // Instrument selection (only used when soundType is 'instruments')
  selectedInstrument = signal<InstrumentType>(SORTED_INSTRUMENTS[0]);
  showInstrumentMenu = signal(false);
  instrumentNames = INSTRUMENT_NAMES;

  playbackState = signal<PlaybackState>('idle');
  isInitialized = signal(false);
  errorMessage = signal<string | null>(null);
  hasPlayed = signal(false);
  genreSelected = signal(false);

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      this.audioManager = new AudioContextManager();
      await this.audioManager.initialize();

      const context = this.audioManager.getContext();

      // Create all note players
      this.syntheticPlayer = new SyntheticNotePlayer(context);
      this.pianoSynthPlayer = new PianoSynthNotePlayer(context);
      this.pianoSamplesPlayer = new PianoNotePlayer(context);
      this.instrumentPlayer = new InstrumentNotePlayer(context, 'piano');

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
      this.clearHighlightSchedule();
      this.playbackState.set('playing');
      this.errorMessage.set(null);
      this.hasPlayed.set(true);

      // Arrange composition using current arranger
      const arranger = this.currentArranger();
      const noteDuration = 1.2;
      const notes = arranger.arrange(comp, noteDuration);
      const genre =
        arranger === this.gymnoArranger ? 'gymnopedie' : 'dodecaphonic';

      // Play arranged notes
      this.player.play(notes);
      this.scheduleHighlights(notes, genre);

      // Calculate duration and schedule state change
      const duration = this.calculateDuration(notes);
      const stopTimer = window.setTimeout(() => {
        this.playbackState.set('stopped');
        this.emitHighlight([], [], 'none');
      }, duration);
      this.highlightTimeoutIds.push(stopTimer);
    } catch (error) {
      this.clearHighlightSchedule();
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
    this.clearHighlightSchedule();
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

  selectSoundType(
    type: 'synthetic' | 'piano-synth' | 'piano-samples' | 'instruments',
  ) {
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
      } else if (type === 'piano-samples') {
        notePlayer = this.pianoSamplesPlayer;
      } else if (type === 'instruments') {
        notePlayer = this.instrumentPlayer;
      }

      if (notePlayer) {
        // Intentionally create a new CompositionPlayer when the sound type changes.
        // This ensures the player is fully reset for the new INotePlayer while
        // reusing the existing AudioContext from audioManager.
        this.player = new CompositionPlayer(context, notePlayer);
      }
    }
  }

  selectInstrument(instrument: InstrumentType) {
    this.selectedInstrument.set(instrument);
    if (this.instrumentPlayer) {
      this.instrumentPlayer.changeInstrument(instrument);
      this.showInstrumentMenu.set(false);
    }
  }

  toggleInstrumentMenu() {
    this.showInstrumentMenu.update((value) => !value);
  }

  getAvailableInstruments(): InstrumentType[] {
    return SORTED_INSTRUMENTS;
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
    let newType: 'synthetic' | 'piano-synth' | 'piano-samples' | 'instruments';

    // Cycle through: synthetic -> piano-synth -> piano-samples -> instruments -> synthetic
    if (current === 'synthetic') {
      newType = 'piano-synth';
    } else if (current === 'piano-synth') {
      newType = 'piano-samples';
    } else if (current === 'piano-samples') {
      newType = 'instruments';
    } else {
      newType = 'synthetic';
    }

    this.selectSoundType(newType);
  }

  changeInstrumentSelection() {
    // Reset to instrument selection state without restarting everything
    this.hasPlayed.set(false);
    this.genreSelected.set(false);
    this.showInstrumentMenu.set(false);
    // Keep soundType as 'instruments' and soundTypeSelected as true
    // This will show the instrument dropdown again
  }

  onRestart() {
    this.clearHighlightSchedule();
    this.restart.emit();
  }

  private scheduleHighlights(
    notes: ScheduledNote[],
    genre: 'gymnopedie' | 'dodecaphonic',
  ) {
    const cues = this.buildHighlightCues(notes, genre);

    this.emitHighlight([], [], 'none');

    for (const cue of cues) {
      const startTimer = window.setTimeout(() => {
        this.emitHighlight(cue.wordIndices, cue.noteIndices, cue.kind);
      }, cue.startMs);

      const endTimer = window.setTimeout(() => {
        this.emitHighlight([], [], 'none');
      }, cue.endMs);

      this.highlightTimeoutIds.push(startTimer, endTimer);
    }
  }

  private buildHighlightCues(
    notes: ScheduledNote[],
    genre: 'gymnopedie' | 'dodecaphonic',
  ): HighlightCue[] {
    const groupedByStart = new Map<number, ScheduledNote[]>();

    for (const note of notes) {
      const key = Number(note.startTime.toFixed(6));
      const existing = groupedByStart.get(key) ?? [];
      existing.push(note);
      groupedByStart.set(key, existing);
    }

    const orderedGroups = Array.from(groupedByStart.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, group]) => group);

    return orderedGroups.map((group, groupIndex) => {
      const startMs = Math.round(group[0].startTime * 1000);
      const endMs = Math.round(
        (group[0].startTime + Math.max(...group.map((item) => item.duration))) *
          1000,
      );

      if (genre === 'gymnopedie') {
        const slot = groupIndex % 4;

        if (slot === 0) {
          return {
            startMs,
            endMs,
            wordIndices: [0],
            noteIndices: [0],
            kind: 'single',
          };
        }

        if (slot === 1) {
          return {
            startMs,
            endMs,
            wordIndices: [1, 2, 3],
            noteIndices: [1, 2, 3],
            kind: 'chord',
          };
        }

        if (slot === 2) {
          return {
            startMs,
            endMs,
            wordIndices: [4],
            noteIndices: [4],
            kind: 'single',
          };
        }

        return {
          startMs,
          endMs,
          wordIndices: [5, 6, 7],
          noteIndices: [5, 6, 7],
          kind: 'chord',
        };
      }

      if (groupIndex < 8) {
        return {
          startMs,
          endMs,
          wordIndices: [groupIndex],
          noteIndices: [groupIndex],
          kind: 'single',
        };
      }

      return {
        startMs,
        endMs,
        wordIndices: [],
        noteIndices: [groupIndex],
        kind: 'generated',
      };
    });
  }

  private emitHighlight(
    activeWordIndices: number[],
    activeNoteIndices: number[],
    kind: HighlightKind,
  ) {
    this.playbackHighlightChanged.emit({
      activeWordIndices,
      activeNoteIndices,
      kind,
    });
  }

  private clearHighlightSchedule() {
    for (const timeoutId of this.highlightTimeoutIds) {
      window.clearTimeout(timeoutId);
    }
    this.highlightTimeoutIds = [];
    this.emitHighlight([], [], 'none');
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
    if (type === 'piano-samples') return 'Piano Samples';
    return `Instruments: ${INSTRUMENT_NAMES[this.selectedInstrument()]}`;
  }

  get canDownload(): boolean {
    return this.soundType() === 'synthetic';
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

      // Create offline note player - only synthetic sound supports download
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
