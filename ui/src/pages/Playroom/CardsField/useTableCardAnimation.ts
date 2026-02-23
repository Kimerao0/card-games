import { useEffect, useRef, useState } from 'react';
import type { ICard } from '@/dtos/Card';

interface TableCardAnimationState {
  readonly localTableCards: ICard[];
  readonly leavingIds: Set<number>;
  readonly enteringIds: Set<number>;
}

export const useTableCardAnimation = (tableCards: ICard[]): TableCardAnimationState => {
  const [localTableCards, setLocalTableCards] = useState<ICard[]>(tableCards);
  const [leavingIds, setLeavingIds] = useState<Set<number>>(new Set());
  const [enteringIds, setEnteringIds] = useState<Set<number>>(new Set());
  const prevTableIdsRef = useRef<number[]>(tableCards.map((c) => c.id));

  useEffect(() => {
    const prevIds = prevTableIdsRef.current;
    const nextIds = tableCards.map((c) => c.id);

    const prevSet = new Set(prevIds);
    const nextSet = new Set(nextIds);

    const removed = prevIds.filter((id) => !nextSet.has(id));
    const added = nextIds.filter((id) => !prevSet.has(id));

    if (removed.length > 0) {
      setLeavingIds((prev) => {
        const s = new Set(prev);
        for (const id of removed) s.add(id);
        return s;
      });

      setLocalTableCards((prevLocal) => {
        const localMap = new Map(prevLocal.map((c) => [c.id, c]));
        const incomingMap = new Map(tableCards.map((c) => [c.id, c]));

        const merged: ICard[] = [];
        for (const c of prevLocal) merged.push(c);

        for (const id of nextIds) {
          if (!localMap.has(id) && incomingMap.has(id)) merged.push(incomingMap.get(id)!);
        }
        return merged;
      });

      window.setTimeout(() => {
        setLeavingIds((prev) => {
          const s = new Set(prev);
          for (const id of removed) s.delete(id);
          return s;
        });

        setLocalTableCards((prevLocal) => prevLocal.filter((c) => !removed.includes(c.id)));
      }, 280);
    }

    if (added.length > 0) {
      setLocalTableCards((prevLocal) => {
        const localSet = new Set(prevLocal.map((c) => c.id));
        const nextMap = new Map(tableCards.map((c) => [c.id, c]));

        const merged = [...prevLocal];
        for (const id of added) {
          if (!localSet.has(id) && nextMap.has(id)) merged.push(nextMap.get(id)!);
        }
        return merged;
      });

      setEnteringIds((prev) => {
        const s = new Set(prev);
        for (const id of added) s.add(id);
        return s;
      });

      window.setTimeout(() => {
        setEnteringIds((prev) => {
          const s = new Set(prev);
          for (const id of added) s.delete(id);
          return s;
        });
      }, 280);
    }

    if (removed.length === 0) {
      setLocalTableCards(tableCards);
    }

    prevTableIdsRef.current = nextIds;
  }, [tableCards]);

  return { localTableCards, leavingIds, enteringIds };
};
