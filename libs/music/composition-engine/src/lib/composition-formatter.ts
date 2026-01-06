import { Composition, NoteValue } from '@haikupedias/core/types';
import { noteToName } from '@haikupedias/core/utils';

/**
 * Formats a composition for human-readable display
 */
export class CompositionFormatter {
  /**
   * Converts a composition to a formatted string representation
   */
  static format(composition: Composition): string {
    let output = '🎵 Composition\n\n';

    composition.bars.forEach((bar, index) => {
      output += `Bar ${index + 1} (Tonic: ${noteToName(bar.tonic)})\n`;

      bar.steps.forEach((step, stepIndex) => {
        const rootName = noteToName(step.root);
        const resultName = noteToName(step.result);
        const intervalName = step.interval === 4 ? 'Major 3rd' : 'Minor 3rd';

        output += `  Step ${stepIndex + 1}: ${rootName} + ${intervalName} → ${resultName}\n`;
      });

      output += '\n';
    });

    return output;
  }

  /**
   * Extracts just the note sequence from a composition
   */
  static getNoteSequence(composition: Composition): NoteValue[] {
    const notes: NoteValue[] = [];

    for (const bar of composition.bars) {
      // Start with tonic
      notes.push(bar.tonic);

      // Add result of each step
      for (const step of bar.steps) {
        notes.push(step.result);
      }
    }

    return notes;
  }

  /**
   * Formats the note sequence as note names
   */
  static formatNoteSequence(composition: Composition): string {
    const notes = this.getNoteSequence(composition);
    return notes.map((note) => noteToName(note as NoteValue)).join(' → ');
  }
}
