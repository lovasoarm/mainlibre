import { describe, expect, it } from 'vitest';
import { run as axe } from 'axe-core';
import { ArMenuScreen } from './ArMenuScreen';
import { renderWithServices } from '../../../test/testServices';

describe('ArMenuScreen accessibility', () => {
  it('does not report automated WCAG violations in its initial state', async () => {
    const { container } = renderWithServices(<ArMenuScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
