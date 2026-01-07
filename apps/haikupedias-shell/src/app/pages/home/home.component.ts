import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  WordSelectorComponent,
  HaikuDisplayComponent,
  AudioControlsComponent,
} from '@haikupedias/ui/components';
import { Word, Haiku, Composition, NoteValue } from '@haikupedias/core/types';
import { HaikuBuilder } from '@haikupedias/poetry/haiku-engine';
import { CompositionGenerator } from '@haikupedias/music/composition-engine';
import { WORD_SET_A, WORD_SET_B } from '@haikupedias/poetry/lexicon';
import { GymnopedieArranger } from '@haikupedias/music/arrangers/gymnopedie-arranger';
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
  // Selected words (need 8 for haiku)
  selectedWords = signal<Word[]>([]);

  // Selected musical genre
  selectedGenre = signal<'gymnopedie' | 'dodecaphonic' | null>(null);

  // Arranger instances for getting composition details
  private gymnoArranger = new GymnopedieArranger();
  private dodecaArranger = new DodecaphonicArranger();

  // Note labels for display
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
    // Auto-scroll to haiku when 8 words are selected
    effect(() => {
      const words = this.selectedWords();
      if (words.length === 8) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          const haikuSection = document.getElementById('haiku-section');
          if (haikuSection) {
            haikuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    });
  }

  // Generated haiku based on selected words
  haiku = computed(() => {
    const words = this.selectedWords();
    if (words.length !== 8) return null;

    const result = HaikuBuilder.buildFromArray(words);

    return result.success ? result.haiku : null;
  });

  // Generated composition based on haiku
  composition = computed(() => {
    const currentHaiku = this.haiku();
    if (!currentHaiku) return null;
    return CompositionGenerator.generate(currentHaiku);
  });

  onWordSelected(word: Word) {
    const current = this.selectedWords();

    // Add word if not already selected and less than 8 words
    if (current.length < 8 && !current.find((w) => w.id === word.id)) {
      this.selectedWords.set([...current, word]);
    }
  }

  resetSelection() {
    this.selectedWords.set([]);
    this.selectedGenre.set(null);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Get 12-tone row for dodecaphonic display
  getDodecaphonicToneRow(): NoteValue[] {
    const comp = this.composition();
    if (!comp) return [];

    const notes = this.dodecaArranger.arrange(comp, 1.0);
    return notes.map((n) => n.note);
  }

  // Get gymnopédie structure (bars with tonic + chord)
  getGymnopedieStructure(): Array<{ tonic: NoteValue; chord: NoteValue[] }> {
    const comp = this.composition();
    if (!comp) return [];

    return comp.bars.map((bar) => ({
      tonic: bar.steps[0].root,
      chord: [bar.steps[1].root, bar.steps[2].root, bar.steps[3].root],
    }));
  }
}
