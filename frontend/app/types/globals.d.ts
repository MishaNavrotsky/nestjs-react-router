import type { FunctionComponent as FC } from 'react';

declare global {
  type FunctionComponent<P = {}> = FC<P>;
}