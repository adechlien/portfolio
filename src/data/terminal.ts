export const commands = [
  { name: 'help', description: 'Show available commands' },
  { name: 'whois', description: 'About me' },
  { name: 'skills', description: 'Explore my skills' },
  { name: 'projects', description: 'Browse my projects' },
  // { name: 'palettes', description: 'Show available color palettes' },
  // { name: 'palettes -e NAME', description: 'Apply a color palette' },
  { name: 'visit NAME', description: 'Open a project by name' },
  { name: 'contact', description: 'How to send me a message' },
  { name: 'email -n NAME -e EMAIL -m MESSAGE', description: 'Send a message' },
  { name: 'enable interface', description: 'Switch to the interface' },
  { name: 'clear', description: 'Clear the terminal' },
];

export const palettes = [{ id: 'superior', name: 'Adech Superior' }];

export function parsePaletteCommand(command: string) {
  const match = /^palettes\s+-e\s+([a-z]+)$/i.exec(command.trim());
  return match ? palettes.find(palette => palette.id === match[1].toLowerCase()) ?? null : null;
}

export const unsupportedCommand = "It seems I cannot support that command :(. Use 'help' to see the available ones.";

/** Accept quoted or unquoted flag values, in any order, without evaluating input. */
export function parseEmailCommand(command: string): { name: string; email: string; message: string } | null {
  const tokens = command.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\s"']+/g);
  if (!tokens || tokens[0].toLowerCase() !== 'email') return null;
  // Reject unmatched quotes rather than silently changing the message.
  if (tokens.join('').replace(/\s/g, '') !== command.replace(/\s/g, '')) return null;
  const values: Record<string, string> = {};
  let flag = '';
  for (const token of tokens.slice(1)) {
    if (/^-[nem]$/.test(token)) {
      if (token in values) return null;
      flag = token;
      values[flag] = '';
    } else {
      if (!flag || /^-[a-z]$/i.test(token)) return null;
      const value = /^["']/.test(token) ? token.slice(1, -1).replace(/\\([\\"'])/g, '$1') : token;
      values[flag] += (values[flag] ? ' ' : '') + value;
    }
  }
  if (!values['-n']?.trim() || !values['-m']?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values['-e'] || '')) return null;
  return { name: values['-n'].trim(), email: values['-e'], message: values['-m'].trim() };
}

export function formatSkillsTree(groups: { title: string; items: { label: string }[] }[]): string {
  const lines = ['skills'];
  groups.forEach((group, i) => {
    const last = i === groups.length - 1;
    lines.push(`${last ? '└── ' : '├── '}${group.title}`);
    group.items.forEach((item, j) => {
      lines.push(`${last ? '    ' : '│   '}${j === group.items.length - 1 ? '└── ' : '├── '}${item.label}`);
    });
  });
  return lines.join('\n');
}

/** Return only a missing suffix, preserving the user's typed text and casing. */
export function getCommandSuggestion(value: string, projectNames: string[]): string {
  if (!value || !value.trim()) return '';
  const choices = [
    ...commands.filter(command => !command.name.includes('NAME')).map(command => command.name),
    ...projectNames.map(name => `visit ${name}`),
    ...palettes.map(palette => `palettes -e ${palette.id}`),
    'email -n "" -e "" -m ""',
  ];
  const match = choices.find(choice => choice.toLowerCase().startsWith(value.toLowerCase()));
  return match ? match.slice(value.length) : '';
}
