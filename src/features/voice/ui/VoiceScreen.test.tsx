import { describe, expect, it } from 'vitest';
import { run as axe } from 'axe-core';
import { VoiceScreen } from './VoiceScreen';
import { renderWithServices } from '../../../test/testServices';

describe('VoiceScreen accessibility', () => {
  it('does not report automated WCAG violations in its initial state', async () => {
    const { container } = renderWithServices(<VoiceScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
