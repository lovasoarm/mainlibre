import { describe, expect, it } from 'vitest';
import { run as axe } from 'axe-core';
import { HubScreen } from './HubScreen';
import { renderWithServices } from '../../../test/testServices';

describe('HubScreen accessibility', () => {
  it('does not report automated WCAG violations in its initial state', async () => {
    const { container } = renderWithServices(<HubScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
