import { describe, expect, it } from 'vitest';
import { run as axe } from 'axe-core';
import { KeyboardScreen } from './KeyboardScreen';
import { renderWithServices } from '../../../test/testServices';

describe('KeyboardScreen accessibility', () => {
  it('does not report automated WCAG violations in its initial state', async () => {
    const { container } = renderWithServices(<KeyboardScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
