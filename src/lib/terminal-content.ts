import type { Language } from '@/lib/portfolio-content';

export const terminalCommands = ['help', 'whoami', 'skills', 'projects', 'chess', 'contact', 'clear'] as const;
export type TerminalCommand = (typeof terminalCommands)[number];

type TerminalText = {
  hint: string;
  notFound: (cmd: string) => string;
  quick: string;
  output: Record<Exclude<TerminalCommand, 'clear'>, string[]>;
};

export const terminalText: Record<Language, TerminalText> = {
  EN: {
    hint: 'Type `help` to see commands',
    notFound: (c) => `command not found: ${c}. Try \`help\`.`,
    quick: 'Quick commands',
    output: {
      help: ['Available commands:', 'whoami · skills · projects · chess · contact · clear', '↑ history · Tab autocomplete'],
      whoami: ['Mirislom — 15 y/o junior pentester & tech explorer.', 'Ethical hacking · web security · AI-assisted development.'],
      skills: ['[security] pentesting basics, network security, OWASP Top 10', '[systems]  Linux, Bash, Python', '[web]      HTML/CSS/JS, AI-assisted development', '[mind]     chess strategy, problem-solving'],
      projects: ['CTF write-ups — TryHackMe & Hack The Box', 'Security scripts lab — Bash & Python', 'AI web experiments', '→ open /projects for details'],
      chess: ['Chess teaches me to think several moves ahead.', 'Strategy → patience → precision. → /strategy'],
      contact: ['GitHub · TryHackMe · Telegram · Email', 'Links coming soon → /contact'],
    },
  },
  RU: {
    hint: 'Введите `help`, чтобы увидеть команды',
    notFound: (c) => `команда не найдена: ${c}. Попробуйте \`help\`.`,
    quick: 'Быстрые команды',
    output: {
      help: ['Доступные команды:', 'whoami · skills · projects · chess · contact · clear', '↑ история · Tab автодополнение'],
      whoami: ['Мирислом — 15 лет, начинающий пентестер и исследователь технологий.', 'Этичный хакинг · веб-безопасность · разработка с ИИ.'],
      skills: ['[безопасность] основы пентеста, сетевая безопасность, OWASP Top 10', '[системы]      Linux, Bash, Python', '[веб]          HTML/CSS/JS, разработка с ИИ', '[мышление]     шахматная стратегия, решение задач'],
      projects: ['CTF-разборы — TryHackMe и Hack The Box', 'Лаборатория скриптов безопасности — Bash и Python', 'Веб-эксперименты с ИИ', '→ подробнее на /projects'],
      chess: ['Шахматы учат думать на несколько ходов вперёд.', 'Стратегия → терпение → точность. → /strategy'],
      contact: ['GitHub · TryHackMe · Telegram · Email', 'Ссылки скоро появятся → /contact'],
    },
  },
  UZ: {
    hint: 'Buyruqlarni ko‘rish uchun `help` yozing',
    notFound: (c) => `buyruq topilmadi: ${c}. \`help\` ni sinab ko‘ring.`,
    quick: 'Tezkor buyruqlar',
    output: {
      help: ['Mavjud buyruqlar:', 'whoami · skills · projects · chess · contact · clear', '↑ tarix · Tab avtoto‘ldirish'],
      whoami: ['Mirislom — 15 yosh, boshlovchi pentester va texnologiya tadqiqotchisi.', 'Etik xakerlik · veb-xavfsizlik · AI yordamida dasturlash.'],
      skills: ['[xavfsizlik] pentest asoslari, tarmoq xavfsizligi, OWASP Top 10', '[tizimlar]   Linux, Bash, Python', '[veb]        HTML/CSS/JS, AI yordamida dasturlash', '[tafakkur]   shaxmat strategiyasi, muammolarni hal qilish'],
      projects: ['CTF tahlillari — TryHackMe va Hack The Box', 'Xavfsizlik skriptlari laboratoriyasi — Bash va Python', 'AI bilan veb-tajribalar', '→ batafsil: /projects'],
      chess: ['Shaxmat bir necha yurish oldinga o‘ylashni o‘rgatadi.', 'Strategiya → sabr → aniqlik. → /strategy'],
      contact: ['GitHub · TryHackMe · Telegram · Email', 'Havolalar tez orada → /contact'],
    },
  },
};

export function completeCommand(input: string): string {
  const v = input.trim().toLowerCase();
  if (!v) return input;
  const matches = terminalCommands.filter((c) => c.startsWith(v));
  return matches.length === 1 ? matches[0]! : input;
}

export function isCommand(v: string): v is TerminalCommand {
  return (terminalCommands as readonly string[]).includes(v);
}
