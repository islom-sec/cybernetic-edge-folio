import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ArrowRight, ArrowDown, Terminal, ShieldCheck, Code2, Crosshair, Github, Mail, Send, Menu, X, ChevronRight, Globe, Flag, Network, Cpu, Check, Crown, Gamepad2, ExternalLink, FileText, Globe2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/lib/language';
import { PortfolioNavigation } from '@/components/portfolio-navigation';
import { HeroTerminal, HeroTyper } from '@/components/hero-terminal';
import { ChessStats, CHESS_USERNAME } from '@/components/chess-stats';
import { Reveal } from '@/components/reveal';
import shieldImage from '@/assets/cyber-shield.jpg';
import { EasterEgg } from '@/components/easter-egg';
import { AiChatbot } from '@/components/ai-chatbot';
import { extras, skillLevels, writeups, type Platform } from '@/lib/extras-content';
import { toast } from 'sonner';
import { useEffects } from '@/lib/effects-provider';

function useCopyToClipboard() {
  const { playClick } = useEffects();
  return (text: string, label: string) => {
    playClick();
    navigator.clipboard?.writeText(text).then(() => {
      toast.success(`Copied: ${label}`, { duration: 2000 });
    }).catch(() => {
      toast.error('Could not copy to clipboard', { duration: 2000 });
    });
  };
}

export function PortfolioShell({ children }: { children: ReactNode }) {
  const { t, language } = useLanguage();
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = content.current?.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
    return () => animation?.cancel();
  }, [language]);
  const x = extras[language];
  return <><a href="#main" className="skip-link">{x.skip}</a><PortfolioNavigation/><div ref={content} className="translated-content"><main id="main" tabIndex={-1}><Reveal>{children}</Reveal></main><footer className="site-footer page-width"><Link to="/" className="brand"><Terminal size={20}/><span>islom-sec<span className="text-primary">.</span></span></Link><p>{t.footer}</p><span className="footer-ethics"><ShieldCheck size={14}/>{t.ethics}</span><span className="footer-copyright">© 2026 {t.copyright}</span><span className="footer-hint" title={x.footerHint}>{x.footerHint}</span></footer></div><EasterEgg/><AiChatbot/></>;
}
function SectionHeading({ label, title, accent, body }: { label: string; title: string; accent: string; body?: string | undefined }) { return <div className="section-heading"><p className="eyebrow">{label}</p><h2>{title} <span className="text-muted-foreground">{accent}</span></h2>{body && <p className="section-intro">{body}</p>}</div>; }
export function HomePage() {
  const { t } = useLanguage();
  return <><section data-section="/" className="hero"><img className="hero-image" src={shieldImage} width={1536} height={1024} alt="" fetchPriority="high"/><div className="hero-shade"/><div className="page-width hero-content hero-layout"><div className="hero-text"><div className="availability"><span className="status-dot pulse-dot"/>{t.available}</div><p className="hero-greeting">{t.hello}</p><h1><span className="glitch" data-text="Islom">Islom</span><span className="text-primary">.</span></h1><h2>{t.role}</h2><HeroTyper words={t.domains}/><p className="hero-description">{t.description}</p><div className="hero-actions"><Button asChild variant="neon" size="lg" className="hero-cta"><Link to="/projects">{t.viewProjects}<ArrowUpRight/></Link></Button><Button asChild variant="outline" size="lg"><Link to="/contact">{t.contactMe}<ArrowRight/></Link></Button></div></div><HeroTerminal/></div><Link to="/about" className="scroll-indicator" aria-label={t.scroll}><span className="scroll-mouse"><i/></span><span>{t.scroll}</span></Link><span className="hero-coordinate">SECURE BY MINDSET // 0x0F</span></section><div className="principle-strip"><div className="page-width">{t.strip.map((item, i) => <span key={item}><span className="text-primary">{['+', '⌘', '◇', '>_'][i]}</span>{item}</span>)}</div></div><AboutSection preview/><SkillsSection preview/><ProjectsSection preview/><section data-section="/contact" className="home-contact page-width"><div><p className="eyebrow">{t.contactLabel}</p><h2>{t.contactTitle}<br/><span className="text-primary">{t.contactAccent}</span></h2></div><Button asChild variant="outline" size="lg"><Link to="/contact">{t.contactMe}<ArrowUpRight/></Link></Button></section></>;
}
export function AboutSection({ preview = false }: { preview?: boolean }) { const { t, language } = useLanguage(); const x = extras[language]; return <section data-section="/about" className={`content-section page-width ${preview ? '' : 'standalone-section'}`}><div className="about-grid"><SectionHeading label={t.aboutLabel} title={t.aboutTitle} accent={t.aboutAccent}/><div className="about-copy"><p>{t.aboutBody}</p>{!preview && <p>{t.aboutBody2}</p>}<div className="learning-list"><p className="learning-title"><span className="status-dot pulse-dot"/>{x.learningTitle}</p><ul>{x.learning.map(item => <li key={item}><span className="text-primary">›</span>{item}</li>)}</ul></div>{preview && <Button asChild variant="link" className="section-text-link"><Link to="/about">{t.moreAbout}<ArrowUpRight/></Link></Button>}</div></div><div className="value-grid">{t.values.map((v, i) => <div className="value-item" key={v}><span className="value-index">0{i+1}</span><div><h3>{v}</h3><p>{t.valueDescriptions[i]}</p></div>{i === 0 ? <Crosshair/> : i === 1 ? <Crown/> : <ShieldCheck/>}</div>)}</div>{!preview && <div className="about-quote"><Terminal/><p>{t.intro}</p><span>— {t.copyright}</span></div>}</section>; }
export function SkillsSection({ preview = false }: { preview?: boolean }) {
  const { t, language } = useLanguage(); const x = extras[language]; const icons = [ShieldCheck, Code2, Crosshair];
  const [tree, setTree] = useState(false);
  const levelChip = (i: number, j: number) => { const l = skillLevels[i]?.[j] ?? 0; return <span className={`level-chip level-${l}`}>{x.levels[l]}</span>; };
  return <section data-section="/skills" className={`content-section page-width ${preview ? '' : 'standalone-section'}`}>
    <div className="section-top"><SectionHeading label={t.skillsLabel} title={t.skillsTitle} accent={t.skillsAccent} body={preview ? undefined : t.skillsIntro}/>{preview ? <Button asChild variant="link"><Link to="/skills">{t.allSkills}<ArrowUpRight/></Link></Button> : <div className="view-toggle" role="group" aria-label={x.viewLabel}><button type="button" aria-pressed={!tree} onClick={() => setTree(false)}>{x.viewGrid}</button><button type="button" aria-pressed={tree} onClick={() => setTree(true)}>{x.viewTree}</button></div>}</div>
    {tree && !preview ? <pre className="skill-tree" aria-label={x.viewTree}>{'~/skills\n'}{t.skillNames.map((name, i) => { const items = t.skillItems[i] ?? []; const lastGroup = i === t.skillNames.length - 1; return <span key={name}>{lastGroup ? '└── ' : '├── '}<span className="text-cyan">{name}/</span>{'\n'}{items.map((item, j) => <span key={item}>{lastGroup ? '    ' : '│   '}{j === items.length - 1 ? '└── ' : '├── '}{item} {levelChip(i, j)}{'\n'}</span>)}</span>; })}</pre>
    : <div className="skill-grid">{t.skillNames.map((name, i) => { const Icon = icons[i]; return <article key={name} className="skill-card">{Icon && <Icon className="skill-icon" size={26}/>}<span className="card-index">0{i+1}</span><h3>{name}</h3><p>{t.skillDescriptions[i]}</p><ul className="skill-levels">{t.skillItems[i]?.map((item, j) => <li key={item}><span className="skill-pill">{item}</span>{levelChip(i, j)}</li>)}</ul></article>; })}</div>}
  </section>;
}
function WriteupsBlock() {
  const { language } = useLanguage(); const x = extras[language];
  const [filter, setFilter] = useState<'all' | Platform>('all');
  const keys = Object.keys(x.filters) as ('all' | Platform)[];
  return <div className="writeups-block"><h3 className="writeups-title">{x.writeupsTitle}</h3>
    <div className="filter-chips" role="group" aria-label={x.filterLabel}>{keys.map(k => <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{x.filters[k]}</button>)}</div>
    <div className="writeup-grid">{writeups.map((w, i) => { const hidden = filter !== 'all' && filter !== w.platform; return <article key={i} className={`writeup-card ${hidden ? 'is-hidden' : ''}`} hidden={hidden}>
      <div className="writeup-badges"><span className="platform-badge">{x.filters[w.platform]}</span><span className={`difficulty-badge difficulty-${w.difficulty}`}>{x.difficulty[w.difficulty]}</span><span className="soon-badge">{x.comingSoon}</span></div>
      <h4>{x.writeupTitles[i]}</h4><p>{x.writeupDesc}</p>
      <div className="real-project-tags">{w.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      {w.href ? <a className="writeup-link" href={w.href} target="_blank" rel="noopener noreferrer">{x.readWriteup} →</a> : <span className="writeup-link is-disabled" aria-disabled="true">{x.readWriteup} → <em>({x.comingSoon})</em></span>}
    </article>; })}</div></div>;
}
export function RealProjectsSection() {
  const { t } = useLanguage();
  const linkIcons = [Globe2, FileText];
  return (
    <div className="real-projects-block">
      <SectionHeading label={t.realProjectsLabel} title={t.realProjectsTitle} accent={t.realProjectsAccent} body={t.realProjectsIntro} />
      <div className="real-project-grid">
        {t.realProjectTitles.map((title, i) => {
          const LinkIcon = linkIcons[i] ?? Globe2;
          const href = t.realProjectLinks[i];
          const isExternal = t.realProjectExternal[i];
          const tags = t.realProjectTags[i] ?? [];
          return (
            <article key={title} className="real-project-card">
              <div className="real-project-header">
                <span className="real-project-number">0{i + 1}</span>
                <LinkIcon className="real-project-type-icon" size={22} />
              </div>
              <div className="real-project-body">
                <p className="eyebrow">{t.realProjectSubtitles[i]}</p>
                <h3>{title}</h3>
                <p className="real-project-desc">{t.realProjectDescriptions[i]}</p>
                <div className="real-project-tags">
                  {tags.map(tag => <span key={tag}>{tag}</span>)}
                </div>
              </div>
              <Button asChild variant="neon" className="real-project-link-btn">
                <a href={href} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {t.realProjectLinkLabels[i]}
                  <ExternalLink size={16} />
                </a>
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
export function ProjectsSection({ preview = false }: { preview?: boolean }) { const { t } = useLanguage(); const [selected, setSelected] = useState<number | null>(null); const icons = [Flag, Network, Code2]; return <section data-section="/projects" className={`content-section page-width ${preview ? '' : 'standalone-section'}`}><div className="section-top"><SectionHeading label={t.projectsLabel} title={t.projectsTitle} accent={t.projectsAccent} body={preview ? undefined : t.projectsIntro}/>{preview && <Button asChild variant="link"><Link to="/projects">{t.allProjects}<ArrowUpRight/></Link></Button>}</div>{!preview && <RealProjectsSection/>}<div className="project-grid">{t.projectTitles.map((title, i) => { const Icon = icons[i]; return <article key={title} className="project-card"><div className={`project-visual project-visual-${i}`}>{Icon && <Icon size={58} strokeWidth={1}/>}<span className="visual-code">{['root@ctf:~$ ./explore', 'def discover():', '< build. learn. repeat. />'][i]}</span><span className="visual-corner">0{i+1} / LAB</span></div><div className="project-card-body"><p className="eyebrow">{t.projectTypes[i]}</p><h3>{title}</h3><p>{t.projectDescriptions[i]}</p><div className="project-bottom"><span><span className="status-dot"/>{t.projectStatus}</span><Button variant="ghost" size="icon" aria-label={`${t.projectDetails}: ${title}`} onClick={() => setSelected(i)}><ArrowUpRight/></Button></div></div></article>; })}</div><Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent showCloseButton={false}><DialogHeader><p className="eyebrow">{t.upcoming}</p><DialogTitle>{selected !== null ? t.projectTitles[selected] : ''}</DialogTitle><DialogDescription>{selected !== null ? t.projectNotes[selected] : ''}</DialogDescription></DialogHeader><Button variant="outline" onClick={() => setSelected(null)}>{t.close}<X/></Button></DialogContent></Dialog></section>; }
export function StrategyPage() { const { t } = useLanguage(); const [expanded, setExpanded] = useState(false); return <section className="content-section page-width standalone-section"><SectionHeading label={t.strategyLabel} title={t.strategyTitle} accent={t.strategyAccent} body={t.strategyIntro}/><div className="strategy-grid"><article className="strategy-card"><div className="chess-board" aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <span key={i} className={(Math.floor(i/8)+i)%2 ? 'square-dark' : 'square-light'}>{i===20 ? '♞' : i===11 ? '♜' : i===27 ? '♔' : ''}</span>)}</div><Crown className="text-primary"/><h3>{t.chessTitle}</h3><p>{t.chessBody}</p><Button asChild variant="outline"><a href={`https://www.chess.com/member/${CHESS_USERNAME}`} target="_blank" rel="noopener noreferrer">{t.chessLink}<ArrowUpRight/></a></Button></article><article className="strategy-card"><div className="tactical-visual" aria-hidden="true"><Crosshair size={110} strokeWidth={0.6}/><span>CS2 <span>/</span> RDR2</span></div><Gamepad2 className="text-primary"/><h3>{t.gamingTitle}</h3><p>{t.gamingBody}</p><Button variant="outline" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{t.gamingLink}<ChevronRight className={expanded ? 'rotate-90' : ''}/></Button>{expanded && <ul className="strategy-highlights">{t.highlights.map(h => <li key={h}><Check size={16}/>{h}</li>)}</ul>}</article></div><ChessStats/></section>; }
export function ContactPage() { const { t } = useLanguage(); const copy = useCopyToClipboard(); const contacts = [
  { name: 'Telegram', handle: '@Islom_0034', desc: t.contactDescriptions[2], href: 'https://t.me/Islom_0034', Icon: Send },
  { name: 'Hack The Box', handle: '@Egoist2330', desc: t.contactDescriptions[1], href: undefined, Icon: ShieldCheck },
  { name: 'Steam', handle: 'Steam', desc: t.steamDesc, href: 'https://steamcommunity.com/profiles/76561198675350684/', Icon: Gamepad2 },
  { name: 'GitHub', handle: undefined, desc: t.contactDescriptions[0], href: undefined, Icon: Github },
  { name: 'Email', handle: undefined, desc: t.contactDescriptions[3], href: undefined, Icon: Mail },
]; return <section className="content-section page-width standalone-section contact-page"><SectionHeading label={t.contactLabel} title={t.contactTitle} accent={t.contactAccent} body={t.contactBody}/><div className="contact-grid">{contacts.map(({ name, handle, desc, href, Icon }) => <article key={name} className="contact-item"><Icon size={27}/><h3>{name}</h3><p>{desc}</p>{href ? <a className="contact-link" href={href} target="_blank" rel="noopener noreferrer">{handle}<ArrowUpRight size={14}/></a> : handle ? <button type="button" className="contact-copy-btn" onClick={() => copy(handle, handle)}><span className="contact-handle">{handle}</span><Copy size={14}/></button> : <span className="contact-pending">{t.notConnected}</span>}</article>)}</div></section>; }
