import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Haiku } from '@haikupedias/core/types';

type HaikuToken =
  | { kind: 'fixed'; label: string }
  | { kind: 'blank'; key: string };

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

  // Emits true when all editable slots are completed
  completionChanged = output<boolean>();

  // Emits when user confirms CREATE (locks edition)
  created = output<void>();

  // Emits when user clicks Change (unlocks edition)
  changed = output<void>();

  private readonly targetLineLengths = [5, 7, 5] as const;
  private readonly blankValues = signal<Record<string, string>>({});
  readonly isLocked = signal(false);

  readonly lineTemplates = computed(() => {
    const currentHaiku = this.haiku();

    return currentHaiku.lines.map((line, lineIndex) => {
      const fixedWords = line.words.map((word) => word.label);
      const targetLength = this.targetLineLengths[lineIndex];
      const blanksNeeded = Math.max(targetLength - fixedWords.length, 0);

      if (
        (lineIndex === 0 || lineIndex === 2) &&
        fixedWords.length === 2 &&
        blanksNeeded === 3
      ) {
        return [
          { kind: 'blank', key: `${lineIndex}-0` },
          { kind: 'fixed', label: fixedWords[0] },
          { kind: 'blank', key: `${lineIndex}-1` },
          { kind: 'fixed', label: fixedWords[1] },
          { kind: 'blank', key: `${lineIndex}-2` },
        ] as HaikuToken[];
      }

      const tokens: HaikuToken[] = [];

      for (let fixedIndex = 0; fixedIndex < fixedWords.length; fixedIndex++) {
        tokens.push({ kind: 'fixed', label: fixedWords[fixedIndex] });

        const hasMoreFixedWords = fixedIndex < fixedWords.length - 1;
        if (hasMoreFixedWords && fixedIndex < blanksNeeded) {
          tokens.push({
            kind: 'blank',
            key: `${lineIndex}-${fixedIndex}`,
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

  get canCreate(): boolean {
    return this.isComplete() && !this.isLocked();
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

  private isComplete(): boolean {
    const values = this.blankValues();

    for (const line of this.lineTemplates()) {
      for (const token of line) {
        if (token.kind === 'blank') {
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
