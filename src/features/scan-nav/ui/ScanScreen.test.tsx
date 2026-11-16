import { describe, expect, it } from 'vitest';
import { run as axe } from 'axe-core';
import { ScanScreen } from './ScanScreen';
import { renderWithServices } from '../../../test/testServices';

describe('ScanScreen accessibility', () => {
  it('does not report automated WCAG violations in its initial state', async () => {
    const { container } = renderWithServices(<ScanScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
