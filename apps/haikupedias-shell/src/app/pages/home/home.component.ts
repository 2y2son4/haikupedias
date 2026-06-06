import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  WordSelectorComponent,
  HaikuDisplayComponent,
  AudioControlsComponent,
} from '@haikupedias/ui/components';
import { Word, NoteValue } from '@haikupedias/core/types';
import { HaikuBuilder } from '@haikupedias/poetry/haiku-engine';
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
    if (!this.isHaikuCompleted()) return null;

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

  resetSelection() {
    this.selectedWords.set([]);
    this.selectedGenre.set(null);
    this.isHaikuCompleted.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onHaikuCompletionChanged(isCompleted: boolean) {
    this.isHaikuCompleted.set(isCompleted);
    if (!isCompleted) {
      this.selectedGenre.set(null);
    }
  }

  onGenreSelected(genre: 'gymnopedie' | 'dodecaphonic') {
    this.selectedGenre.set(genre);
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
}
