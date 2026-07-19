import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  WordSelectorComponent,
  HaikuDisplayComponent,
  AudioControlsComponent,
  PlaybackHighlightEvent,
} from '@haikupedias/ui/components';
import { Word, NoteValue } from '@haikupedias/core/types';
import {
  HaikuBuilder,
  DodecaikuBuilder,
} from '@haikupedias/poetry/haiku-engine';
import { WORD_SET_A, WORD_SET_B } from '@haikupedias/poetry/lexicon';
import {
  CompositionGenerator,
  DodecaikuCompositionGenerator,
} from '@haikupedias/music/composition-engine';
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
  visibleWordSetVersion = signal(0);
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
      const genre = this.selectedGenre();
      const neededWords = genre === 'dodecaphonic' ? 12 : 8;
      if (words.length === neededWords) {
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
    const genre = this.selectedGenre();

    if (genre === 'dodecaphonic') {
      if (words.length !== 12) return null;
      const result = DodecaikuBuilder.buildFromArray(words);
      return result.success ? result.haiku : null;
    } else if (genre === 'gymnopedie') {
      if (words.length !== 8) return null;
      const result = HaikuBuilder.buildFromArray(words);
      return result.success ? result.haiku : null;
    }

    return null;
  });

  composition = computed(() => {
    if (!this.isHaikuCreated()) return null;

    const currentHaiku = this.haiku();
    const genre = this.selectedGenre();
    if (!currentHaiku) return null;

    if (genre === 'dodecaphonic') {
      return DodecaikuCompositionGenerator.generate(currentHaiku);
    } else {
      return CompositionGenerator.generate(currentHaiku);
    }
  });

  onWordSelected(word: Word) {
    const current = this.selectedWords();
    const genre = this.selectedGenre();
    const maxWords = genre === 'dodecaphonic' ? 12 : 8;

    if (current.length < maxWords && !current.find((w) => w.id === word.id)) {
      this.selectedWords.set([...current, word]);
    }
  }

  selectLuckyWords() {
    const allWords = [...WORD_SET_A, ...WORD_SET_B];
    const genre = this.selectedGenre();
    const numWords = genre === 'dodecaphonic' ? 12 : 8;

    if (allWords.length < numWords) return;

    const shuffled = [...allWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    this.selectedWords.set(shuffled.slice(0, numWords));
    this.isHaikuCompleted.set(false);
    this.isHaikuCreated.set(false);
    this.clearPlaybackHighlight();
  }

  randomizeVisibleWordSets() {
    this.visibleWordSetVersion.update((version) => version + 1);
  }

  resetSelection() {
    this.selectedWords.set([]);
    this.selectedGenre.set(null);
    this.visibleWordSetVersion.set(0);
    this.isHaikuCompleted.set(false);
    this.isHaikuCreated.set(false);
    this.clearPlaybackHighlight();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onHaikuCompletionChanged(isCompleted: boolean) {
    this.isHaikuCompleted.set(isCompleted);
  }

  onHaikuCreated() {
    if (this.isHaikuCompleted()) {
      this.isHaikuCreated.set(true);
      setTimeout(() => {
        const compositionSection = document.getElementById(
          'composition-details-section',
        );
        if (compositionSection) {
          compositionSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  }

  onHaikuChanged() {
    this.isHaikuCreated.set(false);
    this.clearPlaybackHighlight();
  }

  onGenreSelected(genre: 'gymnopedie' | 'dodecaphonic') {
    // If genre is different from current, reset the words
    if (this.selectedGenre() !== genre) {
      this.selectedWords.set([]);
      this.visibleWordSetVersion.set(0);
      this.isHaikuCompleted.set(false);
      this.isHaikuCreated.set(false);
      this.clearPlaybackHighlight();
    }
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

  isGymnopedieNoteActive(sequenceIndex: number, noteOffset: number): boolean {
    const noteIndex = sequenceIndex * 4 + noteOffset;
    return this.activeNoteIndices().includes(noteIndex);
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

  getGymnopedieStructure(): Array<{
    originalBarIndex: number;
    tonic: NoteValue;
    chord: NoteValue[];
  }> {
    const comp = this.composition();
    if (!comp) return [];

    const baseBars = comp.bars.map((bar, originalBarIndex) => ({
      originalBarIndex,
      tonic: bar.steps[0].root,
      chord: [bar.steps[1].root, bar.steps[2].root, bar.steps[3].root],
    }));

    // Render the visual sequence exactly as played: bar 1, bar 2, bar 1, bar 2.
    return [...baseBars, ...baseBars];
  }

  getWordTonality(wordIndex: number): 'major' | 'minor' {
    return this.selectedWords()[wordIndex]?.tonalityGroup ?? 'major';
  }

  getWordSetClass(word: Word): string {
    return word.tonalityGroup === 'major' ? 'major' : 'minor';
  }

  private clearPlaybackHighlight() {
    this.activeWordIndices.set([]);
    this.activeNoteIndices.set([]);
    this.activeHighlightKind.set('none');
  }
}
