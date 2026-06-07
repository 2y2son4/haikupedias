import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  WordSelectorComponent,
  HaikuDisplayComponent,
  AudioControlsComponent,
  PlaybackHighlightEvent,
} from '@haikupedias/ui/components';
import { Word, NoteValue } from '@haikupedias/core/types';
import { HaikuBuilder } from '@haikupedias/poetry/haiku-engine';
import { WORD_SET_A, WORD_SET_B } from '@haikupedias/poetry/lexicon';
import { CompositionGenerator } from '@haikupedias/music/composition-engine';
import { DodecaphonicArranger } from '@haikupedias/music/arrangers/dodecaphonic-arranger';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    WordSelectorComponent,
    HaikuDisplayComponent,
    AudioControlsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  selectedWords = signal<Word[]>([]);
  selectedGenre = signal<'gymnopedie' | 'dodecaphonic' | null>(null);
  isHaikuCompleted = signal(false);
  isHaikuCreated = signal(false);
  activeWordIndices = signal<number[]>([]);
  activeNoteIndices = signal<number[]>([]);
  activeHighlightKind = signal<'single' | 'chord' | 'generated' | 'none'>(
    'none',
  );

  private dodecaArranger = new DodecaphonicArranger();

  private readonly noteLabels = [
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
  ];

  constructor() {
    effect(() => {
      const words = this.selectedWords();
      if (words.length === 8) {
        setTimeout(() => {
          const haikuSection = document.getElementById('haiku-section');
          if (haikuSection) {
            haikuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    });
  }

  haiku = computed(() => {
    const words = this.selectedWords();
    if (words.length !== 8) return null;

    const result = HaikuBuilder.buildFromArray(words);

    return result.success ? result.haiku : null;
  });

  composition = computed(() => {
    if (!this.isHaikuCreated()) return null;

    const currentHaiku = this.haiku();
    if (!currentHaiku) return null;
    return CompositionGenerator.generate(currentHaiku);
  });

  onWordSelected(word: Word) {
    const current = this.selectedWords();

    if (current.length < 8 && !current.find((w) => w.id === word.id)) {
      this.selectedWords.set([...current, word]);
    }
  }

  selectLuckyWords() {
    const allWords = [...WORD_SET_A, ...WORD_SET_B];

    if (allWords.length < 8) return;

    const shuffled = [...allWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    this.selectedWords.set(shuffled.slice(0, 8));
    this.selectedGenre.set(null);
    this.isHaikuCompleted.set(false);
    this.isHaikuCreated.set(false);
    this.clearPlaybackHighlight();
  }

  resetSelection() {
    this.selectedWords.set([]);
    this.selectedGenre.set(null);
    this.isHaikuCompleted.set(false);
    this.isHaikuCreated.set(false);
    this.clearPlaybackHighlight();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onHaikuCompletionChanged(isCompleted: boolean) {
    this.isHaikuCompleted.set(isCompleted);
    if (!isCompleted) {
      this.selectedGenre.set(null);
      this.isHaikuCreated.set(false);
    }
  }

  onHaikuCreated() {
    if (this.isHaikuCompleted()) {
      this.isHaikuCreated.set(true);
    }
  }

  onHaikuChanged() {
    this.isHaikuCreated.set(false);
    this.selectedGenre.set(null);
    this.clearPlaybackHighlight();
  }

  onGenreSelected(genre: 'gymnopedie' | 'dodecaphonic') {
    this.selectedGenre.set(genre);
  }

  onPlaybackHighlightChanged(event: PlaybackHighlightEvent) {
    this.activeWordIndices.set(event.activeWordIndices);
    this.activeNoteIndices.set(event.activeNoteIndices);
    this.activeHighlightKind.set(event.kind);
  }

  isToneRowNoteActive(noteIndex: number): boolean {
    return this.activeNoteIndices().includes(noteIndex);
  }

  isGymnopedieNoteActive(barIndex: number, noteOffset: number): boolean {
    const noteIndex = barIndex * 4 + noteOffset;
    return this.activeNoteIndices().includes(noteIndex);
  }

  getWordSetClass(word: Word): string {
    return word.tonalityGroup === 'major' ? 'major' : 'minor';
  }

  getNoteLabel(note: NoteValue): string {
    return this.noteLabels[note];
  }

  getDodecaphonicToneRow(): NoteValue[] {
    const comp = this.composition();
    if (!comp) return [];

    const notes = this.dodecaArranger.arrange(comp, 1.0);
    return notes.map((n) => n.note);
  }

  getGymnopedieStructure(): Array<{ tonic: NoteValue; chord: NoteValue[] }> {
    const comp = this.composition();
    if (!comp) return [];

    return comp.bars.map((bar) => ({
      tonic: bar.steps[0].root,
      chord: [bar.steps[1].root, bar.steps[2].root, bar.steps[3].root],
    }));
  }

  private clearPlaybackHighlight() {
    this.activeWordIndices.set([]);
    this.activeNoteIndices.set([]);
    this.activeHighlightKind.set('none');
  }
}
