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
    console.log('HaikuBuilder result:', result);

    return result.success ? result.haiku : null;
  });

  // Generated composition based on haiku
  composition = computed(() => {
    const currentHaiku = this.haiku();
    if (!currentHaiku) return null;
    return CompositionGenerator.generate(currentHaiku);
  });

  onWordSelected(word: Word) {
    console.log('Word selected:', word);
    const current = this.selectedWords();

    // Add word if not already selected and less than 8 words
    if (current.length < 8 && !current.find((w) => w.id === word.id)) {
      this.selectedWords.set([...current, word]);
      console.log('Selected words:', this.selectedWords());
    }
  }

  resetSelection() {
    this.selectedWords.set([]);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getWordSetClass(word: Word): string {
    return word.tonalityGroup === 'major' ? 'major' : 'minor';
  }

  getNoteLabel(note: NoteValue): string {
    return this.noteLabels[note];
  }
}
