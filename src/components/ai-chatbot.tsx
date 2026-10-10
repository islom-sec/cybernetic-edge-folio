import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Bot, X, Send, CornerDownLeft } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { useEffects } from '@/lib/effects-provider';

type Message = { id: number; role: 'bot' | 'user'; text: string };

type ChatReply = { keywords: string[]; reply: string };

const chatData: Record<string, { title: string; subtitle: string; placeholder: string; quick: string[]; replies: ChatReply[]; fallback: string }> = {
  EN: {
    title: 'AI Assistant',
    subtitle: 'Ask me about Islom, skills, projects, or security.',
    placeholder: 'Type your question…',
    quick: ['Who is Islom?', 'What skills?', 'Show projects', 'Contact'],
    fallback: "I can help with info about Islom's skills, projects, chess, gaming, and contact. Try one of the quick questions below!",
    replies: [
      { keywords: ['who', 'islom', 'about', 'person'], reply: "Islom is a 15-year-old cybersecurity enthusiast and junior pentester. He explores how systems work, how they break, and how to make them stronger. He's passionate about ethical hacking, web security, and AI-assisted development." },
      { keywords: ['skill', 'tool', 'tech', 'stack'], reply: "Skills in progress: Pentesting fundamentals, network security, OWASP Top 10, Linux, Bash & Python scripting, AI-assisted web development, HTML/CSS/JS, chess strategy, and analytical thinking." },
      { keywords: ['project', 'work', 'build', 'portfolio'], reply: "Projects include CTF field notes (TryHackMe & Hack The Box), security scripting lab (Bash & Python), AI-powered web experiments, and real shipped projects like CyberTech UZ and a UZGameCore security audit." },
      { keywords: ['contact', 'email', 'reach', 'connect', 'telegram'], reply: "You can connect via Telegram (@Islom_0034), Hack The Box (@Egoist2330), Steam, and GitHub. Email and GitHub links are coming soon. Check the Contact page for details!" },
      { keywords: ['chess', 'game', 'strategy', 'gaming'], reply: "Chess teaches pattern recognition and long-term planning. CS2 builds teamwork and quick decisions. RDR2 rewards patience and exploration. All of these feed into the security mindset." },
      { keywords: ['security', 'hack', 'pentest', 'ethical'], reply: "Islom focuses on ethical hacking — testing only with permission. He studies OWASP Top 10, network security, and Linux privilege escalation. Security first, always." },
      { keywords: ['ctf', 'tryhackme', 'hack the box', 'htb'], reply: "CTF challenges from TryHackMe and Hack The Box are part of the learning path. Focus is on enumeration, web vulnerability concepts, and clear documentation. Write-ups coming soon!" },
    ],
  },
  RU: {
    title: 'ИИ-Ассистент',
    subtitle: 'Спросите про Ислома, навыки, проекты или безопасность.',
    placeholder: 'Введите вопрос…',
    quick: ['Кто такой Ислом?', 'Какие навыки?', 'Показать проекты', 'Контакты'],
    fallback: 'Я могу рассказать о навыках, проектах, шахматах, играх и контактах Ислома. Попробуйте один из быстрых вопросов ниже!',
    replies: [
      { keywords: ['кто', 'ислом', 'о себе', 'человек'], reply: 'Ислом — 15-летний энтузиаст кибербезопасности и начинающий пентестер. Он изучает, как работают системы, как они взламываются и как сделать их надёжнее.' },
      { keywords: ['навык', 'инструмент', 'технолог'], reply: 'Навыки: основы пентестинга, сетевая безопасность, OWASP Top 10, Linux, Bash и Python, веб-разработка с ИИ, HTML/CSS/JS, шахматная стратегия.' },
      { keywords: ['проект', 'работа', 'портфолио'], reply: 'Проекты: заметки CTF (TryHackMe и Hack The Box), лаборатория скриптов, веб-эксперименты с ИИ, CyberTech UZ и аудит безопасности UZGameCore.' },
      { keywords: ['контакт', 'почта', 'связь', 'телеграм'], reply: 'Связь: Telegram (@Islom_0034), Hack The Box (@Egoist2330), Steam, GitHub. Ссылки на GitHub и email скоро появятся.' },
      { keywords: ['шахмат', 'игр', 'стратег'], reply: 'Шахматы учат распознавать паттерны и планировать. CS2 развивает командную работу. RDR2 вознаграждает терпение и исследование.' },
      { keywords: ['безопасн', 'хак', 'пентест', 'этик'], reply: 'Ислом фокусируется на этичном хакинге — тестирование только с разрешения. Изучает OWASP Top 10, сетевую безопасность и Linux.' },
      { keywords: ['ctf', 'tryhackme', 'hack the box'], reply: 'CTF-задачи от TryHackMe и Hack The Box — часть обучения. Фокус: сбор информации, веб-уязвимости, документация. Разборы скоро!' },
    ],
  },
  UZ: {
    title: 'AI Yordamchi',
    subtitle: "Islom, ko'nikmalar, loyihalar yoki xavfsizlik haqida so'rang.",
    placeholder: "Savolingizni yozing…",
    quick: ['Islom kim?', 'Qanday ko\'nikmalar?', 'Loyihalar', 'Aloqa'],
    fallback: "Men Islomning ko'nikmalari, loyihalari, shaxmati va aloqasi haqida ma'lumot bera olaman. Tezkor savollardan birini sinab ko'ring!",
    replies: [
      { keywords: ['kim', 'islom', 'haqida', 'inson'], reply: "Islom — 15 yoshli kiberxavfsizlik ishqibozi va boshlovchi pentester. Tizimlarning ishlashini, zaif tomonlarini va mustahkamlash yo'llarini o'rganadi." },
      { keywords: ['ko\'nikma', 'vosita', 'texnolog'], reply: "Ko'nikmalar: pentest asoslari, tarmoq xavfsizligi, OWASP Top 10, Linux, Bash va Python, AI yordamida veb-dasturlash, HTML/CSS/JS, shaxmat strategiyasi." },
      { keywords: ['loyiha', 'ish', 'portfolio'], reply: "Loyihalar: CTF qaydlari (TryHackMe va Hack The Box), xavfsizlik skriptlari laboratoriyasi, AI veb-tajribalar, CyberTech UZ va UZGameCore xavfsizlik auditi." },
      { keywords: ['aloqa', 'pochta', 'bog\'lan', 'telegram'], reply: "Aloqa: Telegram (@Islom_0034), Hack The Box (@Egoist2330), Steam, GitHub. GitHub va email havolalari tez orada." },
      { keywords: ['shaxmat', 'o\'yin', 'strateg'], reply: "Shaxmat qonuniyatlarni tanish va rejalashni o'rgatadi. CS2 jamoaviy ishni rivojlantiradi. RDR2 sabr va izlanishni mukofotlaydi." },
      { keywords: ['xavfsiz', 'xaker', 'pentest', 'etik'], reply: "Islom etik xakerlikka e'tibor qaratadi — faqat ruxsat bilan sinaydi. OWASP Top 10, tarmoq xavfsizligi va Linux ni o'rganadi." },
      { keywords: ['ctf', 'tryhackme', 'hack the box'], reply: "TryHackMe va Hack The Box CTF vazifalari o'rganish yo'lining bir qismi. Tahlillar tez orada!" },
    ],
  },
};

function matchReply(input: string, replies: ChatReply[]): string {
  const lower = input.toLowerCase();
  for (const r of replies) {
    if (r.keywords.some(k => lower.includes(k))) return r.reply;
  }
  return '';
}

export function AiChatbot() {
  const { language } = useLanguage();
  const { playClick } = useEffects();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const nextId = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const data = (chatData[language] ?? chatData['EN'])!;

  useEffect(() => {
    setMessages([{ id: nextId.current++, role: 'bot', text: data.subtitle }]);
  }, [language, data.subtitle]);

  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    playClick();
    const userMsg: Message = { id: nextId.current++, role: 'user', text: trimmed };
    const replyText = matchReply(trimmed, data.replies) || data.fallback;
    const botMsg: Message = { id: nextId.current++, role: 'bot', text: replyText };
    setMessages(m => [...m, userMsg, botMsg]);
    setInput('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); send(input); }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <button
        type="button"
        className="chatbot-fab"
        aria-label={data.title}
        onClick={() => { playClick(); setOpen(true); }}
      >
        <Bot size={24} />
        <span className="chatbot-fab-pulse" aria-hidden="true" />
      </button>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="chatbot-overlay" />
        <DialogPrimitive.Content className="chatbot-sheet" aria-describedby={undefined}>
          <DialogPrimitive.Title className="sr-only">{data.title}</DialogPrimitive.Title>
          <header className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-avatar"><Bot size={20} /></span>
              <div>
                <p className="chatbot-name">{data.title}</p>
                <p className="chatbot-status"><span className="status-dot" />{data.subtitle}</p>
              </div>
            </div>
            <DialogPrimitive.Close asChild>
              <button type="button" className="chatbot-close" aria-label="Close">
                <X size={20} />
              </button>
            </DialogPrimitive.Close>
          </header>
          <div ref={bodyRef} className="chatbot-body">
            {messages.map(m => (
              <div key={m.id} className={`chatbot-msg chatbot-msg-${m.role}`}>
                {m.role === 'bot' && <Bot size={16} className="chatbot-msg-icon" />}
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          <div className="chatbot-chips">
            {data.quick.map(q => (
              <button key={q} type="button" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
          <div className="chatbot-input-area">
            <input
              className="chatbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={data.placeholder}
              aria-label={data.placeholder}
              spellCheck={false}
            />
            <button type="button" className="chatbot-send" aria-label="Send" onClick={() => send(input)}>
              <Send size={18} />
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
