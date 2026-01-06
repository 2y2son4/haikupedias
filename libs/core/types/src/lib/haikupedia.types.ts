import { Haiku } from "./poetry.types";
import { Composition } from "./music.types";
import { Word } from "./poetry.types";

/**
 * A complete Haikupedia — poem + music
 */
export interface Haikupedia {
  haiku: Haiku;
  selectedWords: Word[];
  composition: Composition;
}
