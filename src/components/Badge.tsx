import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'high' | 'medium' | 'low' | 'done' | 'overdue';

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
