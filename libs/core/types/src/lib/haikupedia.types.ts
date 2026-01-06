import { Composition } from "./music.types";
import { Haiku, Word } from "./poetry.types";

/**
 * A complete Haikupedia — poem + music
 */
export interface Haikupedia {
  haiku: Haiku;
  selectedWords: Word[];
  composition: Composition;
}
