import { getCommandSuggestion } from '../data/terminal';

export function initializeAutocomplete(input: HTMLInputElement, projectNames: string[]) {
  const field = input.closest<HTMLElement>('[data-command-field]');
  const preview = field?.querySelector<HTMLElement>('[data-command-prediction]');
  const prefix = preview?.querySelector<HTMLElement>('[data-prediction-prefix]');
  const suffix = preview?.querySelector<HTMLElement>('[data-prediction-suffix]');
  const acceptButton = input.form?.querySelector<HTMLButtonElement>('[data-accept-prediction]');
  if (!preview || !prefix || !suffix || !acceptButton) return () => {};
  let suggestion = '';
  let composing = false;

  function update() {
    const atEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
    suggestion = !composing && document.activeElement === input && atEnd
      ? getCommandSuggestion(input.value, projectNames) : '';
    prefix.textContent = input.value;
    suffix.textContent = suggestion;
    preview.hidden = !suggestion;
    preview.style.transform = `translateX(${-input.scrollLeft}px)`;
    acceptButton.hidden = !suggestion;
  }

  function accept() {
    if (!suggestion) return;
    input.value += suggestion;
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  input.addEventListener('input', update);
  input.addEventListener('focus', update);
  input.addEventListener('blur', event => {
    // Keep the suggestion available when a touch/keyboard user focuses its button.
    if (event.relatedTarget !== acceptButton) update();
  });
  input.addEventListener('click', update);
  input.addEventListener('keyup', update);
  input.addEventListener('scroll', update);
  input.addEventListener('compositionstart', () => { composing = true; update(); });
  input.addEventListener('compositionend', () => { composing = false; update(); });
  input.addEventListener('keydown', event => {
    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    update();
    if (suggestion && (event.key === 'Tab' || event.key === 'ArrowRight')) {
      event.preventDefault();
      accept();
    }
  });
  acceptButton.addEventListener('pointerdown', event => { event.preventDefault(); });
  acceptButton.addEventListener('click', accept);
  acceptButton.addEventListener('blur', update);
  document.addEventListener('selectionchange', () => { if (document.activeElement === input) update(); });
  return update;
}
