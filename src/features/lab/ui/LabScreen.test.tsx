import { describe, expect, it } from 'vitest';
import { run as axe } from 'axe-core';
import { LabScreen } from './LabScreen';
import { renderWithServices } from '../../../test/testServices';

describe('LabScreen accessibility', () => {
  it('does not report automated WCAG violations in its initial state', async () => {
    const { container } = renderWithServices(<LabScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
