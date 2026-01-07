import { Component, output, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Word } from '@haikupedias/core/types';
import { WORD_SET_A, WORD_SET_B } from '@haikupedias/poetry/lexicon';

@Component({
  selector: 'lib-word-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './word-selector.component.html',
  styleUrl: './word-selector.component.scss',
})
export class WordSelectorComponent {
  // Input: selected words from parent
  selectedWords = input<Word[]>([]);

  // Output event when a word is selected
  wordSelected = output<Word>();

  // Available words from lexicon - sorted alphabetically
  readonly wordsSetA = [...WORD_SET_A].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  readonly wordsSetB = [...WORD_SET_B].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  // Track last selected word for toast
  lastSelectedWord = signal<Word | null>(null);

  // Toast message for selection feedback
  showToast = signal<boolean>(false);

  selectWord(word: Word) {
    // Don't allow selection if already at 8 words
    if (this.selectedWords().length >= 8) return;

    this.lastSelectedWord.set(word);
    this.wordSelected.emit(word);

    // Show toast message
    this.showToast.set(true);

    // Auto-hide toast after 1.5 seconds
    setTimeout(() => {
      this.showToast.set(false);
    }, 1500);
  }

  isSelected(word: Word): boolean {
    // Don't show any highlighting if 8 words are selected
    if (this.selectedWords().length >= 8) return false;

    return this.selectedWords().some((w) => w.id === word.id);
  }
}
