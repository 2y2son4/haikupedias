# gymnopedie-arranger

Gymnopédie-inspired arrangement strategy.

## Style

- First note of each bar plays alone
- Next 3 notes play simultaneously as a chord
- Creates sparse, contemplative texture

## Usage

```typescript
import { GymnopedieArranger } from '@haikupedias/music/arrangers/gymnopedie-arranger';

const arranger = new GymnopedieArranger();
const scheduledNotes = arranger.arrange(composition, 1.2);
```
