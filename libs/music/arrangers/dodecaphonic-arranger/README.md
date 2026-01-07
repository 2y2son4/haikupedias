# dodecaphonic-arranger

Dodecaphonic (twelve-tone) inspired arrangement strategy.

## Style

- All notes play sequentially
- One note after another
- Creates linear, melodic texture

## Usage

```typescript
import { DodecaphonicArranger } from '@haikupedias/music/arrangers/dodecaphonic-arranger';

const arranger = new DodecaphonicArranger();
const scheduledNotes = arranger.arrange(composition, 1.2);
```
