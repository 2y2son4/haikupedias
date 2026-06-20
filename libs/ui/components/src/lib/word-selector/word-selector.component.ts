import { Component, output, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Word, WordType } from '@haikupedias/core/types';
import { WORD_SET_A, WORD_SET_B } from '@haikupedias/poetry/lexicon';

type WordGroup = {
  type: WordType;
  label: string;
  words: Word[];
};

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
  maxWords = input<number>(8);

  // Output event when a word is selected
  wordSelected = output<Word>();

  // Available words from lexicon - sorted alphabetically
  readonly wordsSetA = [...WORD_SET_A].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  readonly wordsSetB = [...WORD_SET_B].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  readonly wordTypeOrder: WordType[] = ['noun', 'adjective', 'verb', 'adverb'];
  readonly wordTypeLabels: Record<WordType, string> = {
    noun: 'Nouns',
    adjective: 'Adjectives',
    verb: 'Verbs',
    adverb: 'Adverbs',
  };
  readonly groupedWordsSetA = this.buildWordGroups(this.wordsSetA);
  readonly groupedWordsSetB = this.buildWordGroups(this.wordsSetB);

  // Track last selected word for toast
  lastSelectedWord = signal<Word | null>(null);

  // Toast message for selection feedback
  showToast = signal<boolean>(false);

  selectWord(word: Word) {
    // Don't allow selection if already at max words
    if (this.selectedWords().length >= this.maxWords()) return;

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
    return this.selectedWords().some((w) => w.id === word.id);
  }

  private buildWordGroups(words: Word[]): WordGroup[] {
    return this.wordTypeOrder.map((type) => ({
      type,
      label: this.wordTypeLabels[type],
      words: words.filter((word) => word.type === type),
    }));
  }
}
