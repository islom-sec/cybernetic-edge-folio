import type { Language } from './portfolio-content';

export type Level = 0 | 1 | 2; // Learning / Comfortable / Strong
export type Platform = 'thm' | 'htb' | 'scripts' | 'web';
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Skill levels per item, matching skillItems order in portfolio-content. Edit to reflect reality. */
export const skillLevels: Level[][] = [[0, 1, 1, 1, 0], [2, 1, 0], [2, 2, 1]];

/** Placeholder write-up slots; replace with real write-ups when ready. */
export const writeups: { platform: Platform; difficulty: Difficulty; tags: string[]; href?: string }[] = [
  { platform: 'thm', difficulty: 'easy', tags: ['Enumeration', 'Linux'] },
  { platform: 'htb', difficulty: 'medium', tags: ['Web', 'OWASP'] },
  { platform: 'scripts', difficulty: 'easy', tags: ['Python', 'Bash'] },
  { platform: 'web', difficulty: 'medium', tags: ['React', 'AI'] },
];

const en = {
  skip: 'Skip to content',
  learningTitle: 'Currently learning',
  learning: ['OWASP Top 10 in practice', 'Linux privilege escalation basics', 'Python for automation'],
  levels: ['Learning', 'Comfortable', 'Strong'],
  viewGrid: 'Grid', viewTree: 'Tree', viewLabel: 'Skills view',
  filterLabel: 'Filter write-ups',
  filters: { all: 'All', thm: 'TryHackMe', htb: 'Hack The Box', scripts: 'Scripts', web: 'Web Apps' },
  difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
  writeupsTitle: 'CTF write-ups',
  writeupTitles: ['TryHackMe room write-up', 'Hack The Box machine write-up', 'Security automation script', 'AI-assisted web app'],
  writeupDesc: 'Slot reserved — the full write-up will appear here once it is finished and reviewed.',
  readWriteup: 'Read write-up', comingSoon: 'Coming soon',
  eggTitle: 'ACCESS GRANTED', eggBody: 'You found the hidden door. Curiosity is the first skill of every hacker.', eggClose: 'Exit',
  footerHint: 'psst… old-school gamers know the code. ↑↑↓↓',
  notFoundCmd: 'command not found', notFoundBody: 'This path does not exist on this system.', notFoundHome: 'cd ~',
};
type Extras = typeof en;
const ru: Extras = {
  skip: 'Перейти к содержимому',
  learningTitle: 'Сейчас изучаю',
  learning: ['OWASP Top 10 на практике', 'Основы повышения привилегий в Linux', 'Python для автоматизации'],
  levels: ['Изучаю', 'Уверенно', 'Сильно'],
  viewGrid: 'Сетка', viewTree: 'Дерево', viewLabel: 'Вид навыков',
  filterLabel: 'Фильтр разборов',
  filters: { all: 'Все', thm: 'TryHackMe', htb: 'Hack The Box', scripts: 'Скрипты', web: 'Веб-приложения' },
  difficulty: { easy: 'Легко', medium: 'Средне', hard: 'Сложно' },
  writeupsTitle: 'Разборы CTF',
  writeupTitles: ['Разбор комнаты TryHackMe', 'Разбор машины Hack The Box', 'Скрипт автоматизации безопасности', 'Веб-приложение с ИИ'],
  writeupDesc: 'Место зарезервировано — полный разбор появится здесь после завершения и проверки.',
  readWriteup: 'Читать разбор', comingSoon: 'Скоро',
  eggTitle: 'ДОСТУП РАЗРЕШЁН', eggBody: 'Вы нашли скрытую дверь. Любопытство — первый навык любого хакера.', eggClose: 'Выйти',
  footerHint: 'тсс… олдскульные геймеры знают код. ↑↑↓↓',
  notFoundCmd: 'команда не найдена', notFoundBody: 'Такого пути в этой системе нет.', notFoundHome: 'cd ~',
};
const uz: Extras = {
  skip: 'Asosiy qismga o‘tish',
  learningTitle: 'Hozir o‘rganyapman',
  learning: ['OWASP Top 10 amaliyotda', 'Linuxda imtiyozlarni oshirish asoslari', 'Avtomatlashtirish uchun Python'],
  levels: ['O‘rganyapman', 'Ishonchli', 'Kuchli'],
  viewGrid: 'To‘r', viewTree: 'Daraxt', viewLabel: 'Ko‘nikmalar ko‘rinishi',
  filterLabel: 'Tahlillarni saralash',
  filters: { all: 'Hammasi', thm: 'TryHackMe', htb: 'Hack The Box', scripts: 'Skriptlar', web: 'Veb-ilovalar' },
  difficulty: { easy: 'Oson', medium: 'O‘rta', hard: 'Qiyin' },
  writeupsTitle: 'CTF tahlillari',
  writeupTitles: ['TryHackMe xonasi tahlili', 'Hack The Box mashinasi tahlili', 'Xavfsizlikni avtomatlashtirish skripti', 'AI yordamidagi veb-ilova'],
  writeupDesc: 'Joy band qilingan — to‘liq tahlil tugatilib, tekshirilgach shu yerda paydo bo‘ladi.',
  readWriteup: 'Tahlilni o‘qish', comingSoon: 'Tez orada',
  eggTitle: 'KIRISH RUXSAT ETILDI', eggBody: 'Siz yashirin eshikni topdingiz. Qiziquvchanlik — har bir hakerning birinchi ko‘nikmasi.', eggClose: 'Chiqish',
  footerHint: 'pss… eski geymerlar kodni biladi. ↑↑↓↓',
  notFoundCmd: 'buyruq topilmadi', notFoundBody: 'Bu tizimda bunday yo‘l mavjud emas.', notFoundHome: 'cd ~',
};
export const extras: Record<Language, Extras> = { EN: en, RU: ru, UZ: uz };
