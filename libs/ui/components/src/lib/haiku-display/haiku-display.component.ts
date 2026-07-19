import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Haiku, TonalityGroup } from '@haikupedias/core/types';

type HaikuToken =
  | {
      kind: 'fixed';
      label: string;
      wordId: string;
      wordIndex: number;
      tonalityGroup: TonalityGroup;
    }
  | { kind: 'blank'; key: string; required: boolean };

@Component({
  selector: 'lib-haiku-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './haiku-display.component.html',
  styleUrl: './haiku-display.component.scss',
})
export class HaikuDisplayComponent {
  // Input haiku to display
  haiku = input.required<Haiku>();
  variant = input<'haikupedia' | 'dodecaiku'>('haikupedia');
  activeWordIndices = input<number[]>([]);
  highlightKind = input<'single' | 'chord' | 'generated' | 'none'>('none');

  // Emits true when all editable slots are completed
  completionChanged = output<boolean>();

  // Emits when user confirms CREATE (locks edition)
  created = output<void>();

  // Emits when user clicks Change (unlocks edition)
  changed = output<void>();

  private readonly haikupediaLineLengths = [5, 7, 5] as const;
  private readonly blankValues = signal<Record<string, string>>({});
  readonly isLocked = signal(false);

  constructor() {
    effect(() => {
      this.lineTemplates();
      this.blankValues();
      this.completionChanged.emit(this.isComplete());
    });
  }

  readonly lineTemplates = computed(() => {
    const currentHaiku = this.haiku();
    let globalWordIndex = 0;

    return currentHaiku.lines.map((line, lineIndex) => {
      const fixedWords = line.words.map((word) => ({
        id: word.id,
        label: word.label,
        tonalityGroup: word.tonalityGroup,
        wordIndex: globalWordIndex++,
      }));

      if (
        this.variant() === 'haikupedia' &&
        (lineIndex === 0 || lineIndex === 2) &&
        fixedWords.length === 2
      ) {
        return [
          { kind: 'blank', key: `${lineIndex}-0`, required: true },
          {
            kind: 'fixed',
            label: fixedWords[0].label,
            wordId: fixedWords[0].id,
            wordIndex: fixedWords[0].wordIndex,
            tonalityGroup: fixedWords[0].tonalityGroup,
          },
          { kind: 'blank', key: `${lineIndex}-1`, required: true },
          {
            kind: 'fixed',
            label: fixedWords[1].label,
            wordId: fixedWords[1].id,
            wordIndex: fixedWords[1].wordIndex,
            tonalityGroup: fixedWords[1].tonalityGroup,
          },
          { kind: 'blank', key: `${lineIndex}-2`, required: true },
        ] as HaikuToken[];
      }

      if (this.variant() === 'dodecaiku') {
        // Dodecaiku: interleave a blank input between each selected word
        const tokens: HaikuToken[] = [];
        for (let i = 0; i < fixedWords.length; i++) {
          const fixed = fixedWords[i];
          tokens.push({
            kind: 'fixed',
            label: fixed.label,
            wordId: fixed.id,
            wordIndex: fixed.wordIndex,
            tonalityGroup: fixed.tonalityGroup,
          });
          if (i < fixedWords.length - 1) {
            tokens.push({
              kind: 'blank',
              key: `${lineIndex}-${i}`,
              required: true,
            });
          }
        }
        return tokens;
      }

      // Haikupedia middle line: interleave blanks between fixed words
      const targetLength = this.haikupediaLineLengths[lineIndex];
      const blanksNeeded = Math.max(targetLength - fixedWords.length, 0);
      const tokens: HaikuToken[] = [];

      for (let fixedIndex = 0; fixedIndex < fixedWords.length; fixedIndex++) {
        const fixed = fixedWords[fixedIndex];
        tokens.push({
          kind: 'fixed',
          label: fixed.label,
          wordId: fixed.id,
          wordIndex: fixed.wordIndex,
          tonalityGroup: fixed.tonalityGroup,
        });

        const hasMoreFixedWords = fixedIndex < fixedWords.length - 1;
        if (hasMoreFixedWords && fixedIndex < blanksNeeded) {
          tokens.push({
            kind: 'blank',
            key: `${lineIndex}-${fixedIndex}`,
            required: true,
          });
        }
      }

      const insertedBetweenWords = Math.min(
        blanksNeeded,
        Math.max(fixedWords.length - 1, 0),
      );
      for (
        let extraBlank = insertedBetweenWords;
        extraBlank < blanksNeeded;
        extraBlank++
      ) {
        tokens.push({
          kind: 'blank',
          key: `${lineIndex}-${extraBlank}`,
          required: true,
        });
      }

      return tokens;
    });
  });

  onBlankInput(blankKey: string, event: Event): void {
    if (this.isLocked()) {
      return;
    }

    const value = (event.target as HTMLInputElement).value;
    this.blankValues.update((current) => ({
      ...current,
      [blankKey]: value,
    }));

    this.completionChanged.emit(this.isComplete());
  }

  getBlankValue(blankKey: string): string {
    return this.blankValues()[blankKey] ?? '';
  }

  getRenderedBlankValue(blankKey: string): string | null {
    const value = this.getBlankValue(blankKey).trim();
    return value ? value : null;
  }

  get canCreate(): boolean {
    return this.isComplete() && !this.isLocked();
  }

  get hasFilledBlanks(): boolean {
    const values = this.blankValues();
    return Object.values(values).some((value) => value.trim().length > 0);
  }

  isWordActive(wordIndex: number): boolean {
    return this.activeWordIndices().includes(wordIndex);
  }

  get hasGeneratedToneHighlight(): boolean {
    return this.highlightKind() === 'generated';
  }

  get isChordHighlight(): boolean {
    return this.highlightKind() === 'chord';
  }

  onCreate(): void {
    if (!this.canCreate) {
      return;
    }

    this.isLocked.set(true);
    this.created.emit();
  }

  onChange(): void {
    this.isLocked.set(false);
    this.changed.emit();
    this.completionChanged.emit(this.isComplete());
  }

  onClearBlanks(): void {
    if (this.isLocked()) {
      return;
    }

    this.blankValues.set({});
    this.completionChanged.emit(this.isComplete());
  }

  private isComplete(): boolean {
    const values = this.blankValues();

    for (const line of this.lineTemplates()) {
      for (const token of line) {
        if (token.kind === 'blank') {
          if (!token.required) {
            continue;
          }

          const raw = values[token.key] ?? '';
          if (!raw.trim()) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
