import { Component, computed, output, signal, input } from '@angular/core';
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
  randomizeVersion = input<number>(0);

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

  private readonly visibleGroupsVersion = signal(0);

  readonly groupedWordsSetA = computed(() => {
    this.randomizeVersion();
    this.visibleGroupsVersion();
    return this.buildVisibleWordGroups(this.wordsSetA);
  });

  readonly groupedWordsSetB = computed(() => {
    this.randomizeVersion();
    this.visibleGroupsVersion();
    return this.buildVisibleWordGroups(this.wordsSetB);
  });

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

  private buildVisibleWordGroups(words: Word[]): WordGroup[] {
    const groupedWords = this.buildWordGroups(words);

    return groupedWords.map((group) => ({
      ...group,
      words: this.selectBalancedHalf(group.words),
    }));
  }

  private selectBalancedHalf(words: Word[]): Word[] {
    const majorWords = words.filter((word) => word.tonalityGroup === 'major');
    const minorWords = words.filter((word) => word.tonalityGroup === 'minor');

    const visibleMajorWords = this.pickRandomSubset(
      majorWords,
      this.getHalfCount(majorWords.length),
    );
    const visibleMinorWords = this.pickRandomSubset(
      minorWords,
      this.getHalfCount(minorWords.length),
    );

    return [...visibleMajorWords, ...visibleMinorWords].sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }

  private getHalfCount(size: number): number {
    return Math.floor(size / 2);
  }

  private pickRandomSubset<T>(items: T[], size: number): T[] {
    const shuffled = this.shuffle([...items]);
    return shuffled.slice(0, Math.min(size, shuffled.length));
  }

  private shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [items[i], items[randomIndex]] = [items[randomIndex], items[i]];
    }

    return items;
  }
}
