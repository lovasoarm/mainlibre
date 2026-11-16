import { afterEach, describe, expect, it, vi } from 'vitest';
import { KeyboardSwitchAdapter } from './KeyboardSwitchAdapter';

afterEach(() => document.body.replaceChildren());

describe('KeyboardSwitchAdapter : contacteur dans le contenu', () => {
  it('transmet Espace depuis une cible de contenu sans déclencher son clic natif', () => {
    const adapter = new KeyboardSwitchAdapter();
    const onPress = vi.fn();
    const onClick = vi.fn();
    const button = document.createElement('button');
    button.dataset['scanTarget'] = 'true';
    button.addEventListener('click', onClick);
    document.body.append(button);
    adapter.start(onPress);

    const event = new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true, cancelable: true });
    button.dispatchEvent(event);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    adapter.stop();
  });

});

describe('KeyboardSwitchAdapter : contrôles réservés', () => {
  it("laisse les contrôles d’interface et les champs de formulaire utilisables", () => {
    const adapter = new KeyboardSwitchAdapter();
    const onPress = vi.fn();
    const control = document.createElement('button');
    control.dataset['switchControl'] = 'true';
    const input = document.createElement('input');
    document.body.append(control, input);
    adapter.start(onPress);

    control.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true, cancelable: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true, cancelable: true }));

    expect(onPress).not.toHaveBeenCalled();
    adapter.stop();
  });
});
