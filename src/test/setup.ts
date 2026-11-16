import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { expect, afterEach } from 'vitest';
import matchers from '@chialab/vitest-axe';

expect.extend(matchers);
afterEach(() => cleanup());
