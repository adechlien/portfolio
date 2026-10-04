type Position = { x: number; y: number };
type Size = { width: number; height: number };

export function constrainWindowPosition(position: Position, size: Size, viewport: Size, padding: number): Position {
  const insetX = Math.min(padding, Math.max(0, (viewport.width - size.width) / 2));
  const insetY = Math.min(padding, Math.max(0, (viewport.height - size.height) / 2));
  return {
    x: Math.max(insetX, Math.min(position.x, viewport.width - size.width - insetX)),
    y: Math.max(insetY, Math.min(position.y, viewport.height - size.height - insetY)),
  };
}

export function initializeWindowDrag(shell: HTMLElement, handle: HTMLElement) {
  let position: Position | null = null;
  let drag: { pointerId: number; mouse: Position; window: Position } | null = null;

  function place(next: Position) {
    const rect = shell.getBoundingClientRect();
    const padding = parseFloat(getComputedStyle(shell).getPropertyValue('--window-padding')) || 0;
    position = constrainWindowPosition(next, rect, { width: window.innerWidth, height: window.innerHeight }, padding);
    shell.style.left = `${position.x}px`;
    shell.style.bottom = `${window.innerHeight - position.y - rect.height}px`;
  }

  function endDrag() {
    if (!drag) return;
    const pointerId = drag.pointerId;
    drag = null;
    delete shell.dataset.dragging;
    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
  }

  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || shell.hidden || shell.inert) return;
    if ((event.target as Element).closest('button, a, input, textarea, select, [data-window-controls]')) return;
    const rect = shell.getBoundingClientRect();
    drag = { pointerId: event.pointerId, mouse: { x: event.clientX, y: event.clientY }, window: { x: rect.left, y: rect.top } };
    shell.dataset.dragging = 'true';
    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  handle.addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    place({ x: drag.window.x + event.clientX - drag.mouse.x, y: drag.window.y + event.clientY - drag.mouse.y });
  });
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);
  handle.addEventListener('lostpointercapture', endDrag);
  window.addEventListener('blur', endDrag);
  window.addEventListener('resize', () => {
    if (position && !shell.hidden && shell.dataset.minimized !== 'true') place(position);
  });
}
