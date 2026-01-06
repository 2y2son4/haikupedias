import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WORD_SET_A, WORD_SET_B, Word } from '@haikupedias/poetry/lexicon';
import { HaikuBuilder, validateHaiku } from '@haikupedias/poetry/haiku-engine';
import {
  CompositionGenerator,
  CompositionFormatter,
} from '@haikupedias/music/composition-engine';

@Component({
  selector: 'app-lexicon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lexicon.component.html',
  styleUrl: './lexicon.component.scss',
})
export class LexiconComponent implements OnInit {
  // Word datasets
  wordSetA = WORD_SET_A;
  wordSetB = WORD_SET_B;

  // Current active set
  activeSet: 'A' | 'B' = 'A';

  ngOnInit() {
    // Test the haiku-engine library
    this.testHaikuEngine();
    // Test the composition-engine library
    this.testCompositionPipeline();
  }

  testHaikuEngine() {
    console.log('🧪 Testing Haiku Engine Library...');

    // Select 8 sample words from Set A
    const testWords = this.wordSetA.slice(0, 8);
    console.log('Test words:', testWords.map((w) => w.label).join(', '));

    // Test 1: Build haiku from array (auto-distribution 2-4-2)
    const result1 = HaikuBuilder.buildFromArray(testWords);
    if (result1.success) {
      console.log('✅ Build from array successful!');
      console.log(
        'Line 1:',
        result1.haiku?.lines[0].words.map((w) => w.label).join(' '),
      );
      console.log(
        'Line 2:',
        result1.haiku?.lines[1].words.map((w) => w.label).join(' '),
      );
      console.log(
        'Line 3:',
        result1.haiku?.lines[2].words.map((w) => w.label).join(' '),
      );
    } else {
      console.log('❌ Build from array failed:', result1.errors);
    }

    // Test 2: Build haiku with explicit line distribution
    const line1 = testWords.slice(0, 2);
    const line2 = testWords.slice(2, 6);
    const line3 = testWords.slice(6, 8);

    const result2 = HaikuBuilder.build(line1, line2, line3);
    if (result2.success) {
      console.log('✅ Build with explicit lines successful!');
    }

    // Test 3: Invalid haiku (wrong word count)
    const result3 = HaikuBuilder.buildFromArray(testWords.slice(0, 5));
    if (!result3.success) {
      console.log(
        '✅ Validation correctly rejected invalid word count:',
        result3.errors,
      );
    }

    // Test 4: Invalid haiku (duplicate words)
    const duplicateWords = [
      testWords[0],
      testWords[0], // Duplicate
      testWords[1],
      testWords[2],
      testWords[3],
      testWords[4],
      testWords[5],
      testWords[6],
    ];
    const validation = validateHaiku(
      duplicateWords.slice(0, 2),
      duplicateWords.slice(2, 6),
      duplicateWords.slice(6, 8),
    );
    if (!validation.valid) {
      console.log(
        '✅ Validation correctly detected duplicates:',
        validation.errors,
      );
    }

    console.log('🎉 Haiku Engine tests complete!');
  }

  testCompositionPipeline() {
    console.log(
      '\n🎵 Testing Complete Pipeline: Words → Haiku → Composition...',
    );

    // Step 1: Select 8 words from Set A
    const selectedWords = this.wordSetA.slice(0, 8);
    console.log(
      'Selected words:',
      selectedWords.map((w) => `${w.label} (${w.tonalityGroup})`).join(', '),
    );

    // Step 2: Build haiku from words
    const haikuResult = HaikuBuilder.buildFromArray(selectedWords);
    if (!haikuResult.success || !haikuResult.haiku) {
      console.log('❌ Failed to build haiku:', haikuResult.errors);
      return;
    }
    console.log('✅ Haiku built successfully:');
    console.log(
      '  Line 1:',
      haikuResult.haiku.lines[0].words.map((w) => w.label).join(' '),
    );
    console.log(
      '  Line 2:',
      haikuResult.haiku.lines[1].words.map((w) => w.label).join(' '),
    );
    console.log(
      '  Line 3:',
      haikuResult.haiku.lines[2].words.map((w) => w.label).join(' '),
    );

    // Step 3: Generate composition from haiku
    const composition = CompositionGenerator.generate(haikuResult.haiku);
    console.log('✅ Composition generated successfully!');
    console.log('  Bar 1 tonic:', composition.bars[0].tonic);
    console.log('  Bar 2 tonic:', composition.bars[1].tonic);

    // Step 4: Format composition for display
    const formatted = CompositionFormatter.format(composition);
    console.log('\n📜 Formatted Composition:');
    console.log(formatted);

    // Step 5: Get note sequence
    const noteSequence = CompositionFormatter.getNoteSequence(composition);
    console.log('\n🎼 Note Sequence:', noteSequence);

    const noteNames = CompositionFormatter.formatNoteSequence(composition);
    console.log('🎹 Note Names:', noteNames);

    console.log('\n🎉 Complete Pipeline Test Successful!');
    console.log('✨ Words → Haiku → Composition → Ready for Audio Engine');
  }

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
