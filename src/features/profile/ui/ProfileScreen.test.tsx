import { describe, expect, it } from 'vitest';
import { run as axe } from 'axe-core';
import { ProfileScreen } from './ProfileScreen';
import { renderWithServices } from '../../../test/testServices';

describe('ProfileScreen accessibility', () => {
  it('does not report automated WCAG violations in its initial state', async () => {
    const { container } = renderWithServices(<ProfileScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
