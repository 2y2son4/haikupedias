import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WORD_SET_A, WORD_SET_B, Word } from '@haikupedias/poetry/lexicon';

@Component({
  selector: 'app-lexicon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lexicon.component.html',
  styleUrl: './lexicon.component.scss',
})
export class LexiconComponent {
  wordSetA = WORD_SET_A;
  wordSetB = WORD_SET_B;

  activeSet: 'A' | 'B' = 'A';

  get currentWords(): Word[] {
    return this.activeSet === 'A' ? this.wordSetA : this.wordSetB;
  }

  get wordsByType() {
    const words = this.currentWords;
    return {
      noun: words.filter((w) => w.type === 'noun'),
      verb: words.filter((w) => w.type === 'verb'),
      adjective: words.filter((w) => w.type === 'adjective'),
      adverb: words.filter((w) => w.type === 'adverb'),
    };
  }

  switchSet(set: 'A' | 'B') {
    this.activeSet = set;
  }
}
