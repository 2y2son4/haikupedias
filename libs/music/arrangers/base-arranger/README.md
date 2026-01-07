# base-arranger

Base interface for composition arrangers.

Defines the contract that all musical arrangement strategies must implement.

## Interface

```typescript
interface CompositionArranger {
  arrange(composition: Composition, noteDuration: number): ScheduledNote[];
  getName(): string;
}
```

## Usage

Implement this interface to create new musical interpretation strategies.
