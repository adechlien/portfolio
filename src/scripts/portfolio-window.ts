import { contact, projects } from '../data/portfolio.js';
import { parseEmailCommand, parsePaletteCommand, unsupportedCommand } from '../data/terminal';

import { initializeAutocomplete } from './terminal-autocomplete';
import { initializeWindowDrag } from './window-drag';
import { readTerminalHistory, saveTerminalHistory, type TerminalEntry, type TerminalResult } from './terminal-history';

export function initializePortfolioWindow() {
  const shell = document.querySelector<HTMLElement>('[data-portfolio-window]');
  const content = document.querySelector<HTMLElement>('[data-window-content]');
  const terminal = document.querySelector<HTMLElement>('[data-terminal-view]');
  const gui = document.querySelector<HTMLElement>('[data-interface-view]');
  const output = document.querySelector<HTMLElement>('[data-terminal-output]');
  const form = document.querySelector<HTMLFormElement>('[data-terminal-form]');
  const input = form?.querySelector<HTMLInputElement>('input[name="command"]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-quit-dialog]');
  const launcher = document.querySelector<HTMLButtonElement>('[data-window-restore]');
  const modeToggle = document.querySelector<HTMLButtonElement>('[data-toggle-interface]');
  if (!shell || !content || !terminal || !gui || !output || !form || !input || !dialog || !launcher) return;

  const updatePrediction = initializeAutocomplete(input, projects.map(project => project.name));
  const dragHandle = shell.querySelector<HTMLElement>('[data-window-drag]');
  if (dragHandle) initializeWindowDrag(shell, dragHandle);

  let changingMode = false;
  let sending = false;
  const transcript = readTerminalHistory();
  const history = transcript.map(entry => entry.command);
  let historyIndex = history.length;
  let draft = '';
  const scrollToEnd = () => { output.scrollTop = output.scrollHeight; };
  const focusInput = () => { if (!terminal.hidden && !shell.hidden && !dialog.open) input.focus({ preventScroll: true }); };

  async function switchMode(interfaceMode: boolean) {
    if (changingMode || gui.hidden !== interfaceMode) return;
    changingMode = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) await content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }).finished;
    terminal.hidden = interfaceMode;
    gui.hidden = !interfaceMode;
    if (modeToggle) {
      const label = interfaceMode ? 'Return to terminal' : 'Open interface';
      modeToggle.setAttribute('aria-label', label);
      modeToggle.title = label;
      const interfaceIcon = modeToggle.querySelector('[data-interface-icon]');
      const terminalIcon = modeToggle.querySelector('[data-terminal-icon]');
      interfaceIcon?.toggleAttribute('hidden', interfaceMode);
      terminalIcon?.toggleAttribute('hidden', !interfaceMode);
    }
    // Recalculate the tab indicator now that its view has dimensions.
    window.dispatchEvent(new Event('resize'));
    if (!reducedMotion) {
      await content.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, fill: 'forwards' }).finished;
      content.getAnimations().forEach(animation => animation.cancel());
    }
    changingMode = false;
    if (interfaceMode) gui.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    else focusInput();
  }

  function appendText(parent: HTMLElement, entry: TerminalEntry, message: string, error = false, pending = false) {
    const result: TerminalResult = { type: 'text', message, error, pending };
    entry.results.push(result);
    saveTerminalHistory(transcript);
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    if (error) paragraph.className = 'text-adech-sunny-3';
    parent.append(paragraph);
    scrollToEnd();
    return { paragraph, result };
  }

  function renderEntry(entry: TerminalEntry) {
    const block = document.createElement('section');
    block.className = 'mb-5 border-t border-adech-void-3 px-3 pt-3 md:px-4 first:border-t-0 first:pt-0 last:mb-0 [:where(&_p)]:my-2';
    const echo = document.createElement('div');
    echo.className = 'mb-2.5 whitespace-pre-wrap text-adech-venomous-1';
    echo.textContent = `❯ ${entry.command}`;
    block.append(echo);
    output.append(block);
    for (const result of entry.results) {
      if (result.type === 'template') appendTemplate(block, result.name);
      else if (result.type === 'project') appendProjectLink(block, result.name);
      else {
        const paragraph = document.createElement('p');
        paragraph.textContent = result.message;
        if (result.error) paragraph.className = 'text-adech-sunny-3';
        block.append(paragraph);
      }
    }
    return block;
  }

  function appendTemplate(block: HTMLElement, name: string) {
    const template = document.querySelector<HTMLTemplateElement>(`[data-terminal-template="${name}"]`);
    if (template) block.append(template.content.cloneNode(true));
  }

  function appendProjectLink(block: HTMLElement, name: string) {
    const project = projects.find(project => project.name.toLowerCase() === name.toLowerCase());
    if (!project) return;
    const link = document.createElement('a');
    link.href = project.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'cursor-pointer text-left text-adech-venomous-1 underline underline-offset-4 hover:text-adech-venomous-2';
    link.textContent = `Open ${project.name} ↗`;
    block.append(link);
  }

  // Restore output without re-running commands that send email or open windows.
  transcript.forEach(renderEntry);
  scrollToEnd();

  async function runCommand(raw: string) {
    const command = raw.trim();
    if (!command || sending) return;
    const normalized = command.toLowerCase().replace(/\s+/g, ' ');
    input.value = '';
    updatePrediction();
    draft = '';
    if (normalized === 'clear') {
      output.replaceChildren();
      transcript.length = 0;
      history.length = 0;
      historyIndex = 0;
      saveTerminalHistory(transcript);
      return;
    }
    history.push(command);
    historyIndex = history.length;
    const entry: TerminalEntry = { command, results: [] };
    transcript.push(entry);
    saveTerminalHistory(transcript);
    const block = renderEntry(entry);
    if (['help', 'whois', 'skills', 'projects', 'contact', 'palettes'].includes(normalized)) {
      entry.results.push({ type: 'template', name: normalized });
      appendTemplate(block, normalized);
      saveTerminalHistory(transcript);
    } else if (/^palettes(?:\s|$)/i.test(command)) {
      const palette = parsePaletteCommand(command);
      if (palette) {
        // Superior is supplied directly by the Adech Tailwind preset.
        document.documentElement.dataset.palette = palette.id;
        appendText(block, entry, `${palette.name} is now active.`);
      } else appendText(block, entry, unsupportedCommand, true);
    } else if (normalized === 'enable interface') {
      appendText(block, entry, 'Opening interface…');
      await switchMode(true);
    } else if (/^visit\s+/i.test(command)) {
      const name = command.slice(command.indexOf(' ') + 1).trim().replace(/^(["'])(.*)\1$/, '$2');
      const project = projects.find(project => project.name.toLowerCase() === name.toLowerCase());
      if (project) {
        window.open(project.href, '_blank', 'noopener,noreferrer');
        entry.results.push({ type: 'project', name: project.name });
        appendProjectLink(block, project.name);
        saveTerminalHistory(transcript);
      } else appendText(block, entry, unsupportedCommand, true);
    } else if (/^email(?:\s|$)/i.test(command)) {
      const fields = parseEmailCommand(command);
      if (!fields) appendText(block, entry, 'Use: email -n "Your name" -e "you@email.com" -m "Your message". All three fields and a valid email are required.', true);
      else {
        sending = true;
        const { paragraph: status, result } = appendText(block, entry, contact.sendingLabel, false, true);
        const body = new FormData();
        Object.entries(fields).forEach(([key, value]) => body.append(key, value));
        body.append('_subject', contact.subject);
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 20000);
        try {
          const response = await fetch(contact.action, { method: 'POST', body, headers: { Accept: 'application/json' }, signal: controller.signal });
          status.textContent = response.ok ? contact.successMessage : contact.errorMessage;
          status.classList.toggle('text-adech-sunny-3', !response.ok);
        } catch {
          status.textContent = contact.connectionErrorMessage;
          status.classList.add('text-adech-sunny-3');
        } finally {
          result.message = status.textContent || '';
          result.error = status.classList.contains('text-adech-sunny-3');
          result.pending = false;
          saveTerminalHistory(transcript);
          window.clearTimeout(timeout); sending = false; scrollToEnd();
        }
      }
    } else appendText(block, entry, unsupportedCommand, true);
    scrollToEnd();
  }

  form.addEventListener('submit', event => { event.preventDefault(); void runCommand(input.value); });
  output.addEventListener('click', event => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-run-command]');
    if (!target) return;
    const command = target.dataset.runCommand || '';
    if (command === 'palettes -e NAME') input.value = 'palettes -e ';
    else if (command.startsWith('visit ') || command.startsWith('email ')) input.value = command.startsWith('visit ') ? 'visit ' : 'email -n "" -e "" -m ""';
    else void runCommand(command);
    focusInput();
    updatePrediction();
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === history.length) draft = input.value;
      historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
      input.value = historyIndex === history.length ? draft : history[historyIndex];
      input.setSelectionRange(input.value.length, input.value.length);
      updatePrediction();
    }
  });
  modeToggle?.addEventListener('click', () => { void switchMode(gui.hidden); });
  function positionDialog() {
    const rect = shell.getBoundingClientRect();
    dialog.style.left = `${rect.left + rect.width / 2}px`;
    dialog.style.top = `${rect.top + rect.height / 2}px`;
    dialog.style.width = `${Math.min(340, rect.width - 32)}px`;
    dialog.style.maxHeight = `${rect.height - 24}px`;
  }
  window.addEventListener('resize', () => { if (dialog.open) positionDialog(); });
  document.querySelector('[data-window-close]')?.addEventListener('click', () => { positionDialog(); dialog.showModal(); });
  document.querySelector('[data-cancel-close]')?.addEventListener('click', () => { dialog.close(); });
  dialog.addEventListener('close', focusInput);
  function hideWindow() { shell.hidden = true; launcher.hidden = false; launcher.focus(); }
  document.querySelector('[data-confirm-close]')?.addEventListener('click', () => { dialog.close(); hideWindow(); });
  let movingWindow = false;
  function waitForWindowMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
    return new Promise<void>(resolve => {
      const finish = () => {
        window.clearTimeout(timeout);
        shell.removeEventListener('transitionend', onEnd);
        resolve();
      };
      const onEnd = (event: TransitionEvent) => {
        if (event.target === shell && event.propertyName === 'opacity') finish();
      };
      const timeout = window.setTimeout(finish, 550);
      shell.addEventListener('transitionend', onEnd);
    });
  }
  document.querySelector('[data-window-minimize]')?.addEventListener('click', async () => {
    if (movingWindow) return;
    movingWindow = true;
    shell.inert = true;
    launcher.hidden = false;
    launcher.disabled = true;
    const completed = waitForWindowMotion();
    shell.dataset.minimized = 'true';
    await completed;
    shell.hidden = true;
    launcher.disabled = false;
    launcher.focus();
    movingWindow = false;
  });
  shell.addEventListener('transitionend', event => {
    if (event.target === shell && event.propertyName === 'height') {
      window.dispatchEvent(new Event('resize'));
    }
  });
  launcher.addEventListener('click', async () => {
    if (movingWindow) return;
    movingWindow = true;
    shell.hidden = false;
    launcher.hidden = true;
    if (shell.dataset.minimized === 'true') {
      // Commit the small initial state before transitioning back to full size.
      void shell.offsetWidth;
      const completed = waitForWindowMotion();
      shell.dataset.minimized = 'false';
      await completed;
    }
    shell.inert = false;
    movingWindow = false;
    window.dispatchEvent(new Event('resize'));
    if (terminal.hidden) gui.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    else focusInput();
  });
}
