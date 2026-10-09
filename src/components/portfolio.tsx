import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ArrowRight, ArrowDown, Terminal, ShieldCheck, Code2, Crosshair, Github, Mail, Send, Menu, X, ChevronRight, Globe, Flag, Network, Cpu, Check, Crown, Gamepad2, ExternalLink, FileText, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/lib/language';
import { PortfolioNavigation } from '@/components/portfolio-navigation';
import shieldImage from '@/assets/cyber-shield.jpg';

export function PortfolioShell({ children }: { children: ReactNode }) {
  const { t, language } = useLanguage();
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = content.current?.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
    return () => animation?.cancel();
  }, [language]);
  return <><PortfolioNavigation/><div ref={content} className="translated-content"><main>{children}</main><footer className="site-footer page-width"><Link to="/" className="brand"><Terminal size={20}/><span>mirislom<span className="text-primary">.</span></span></Link><p>{t.footer}</p><span className="footer-ethics"><ShieldCheck size={14}/>{t.ethics}</span><span className="footer-copyright">© 2026 {t.copyright}</span></footer></div></>;
}
function SectionHeading({ label, title, accent, body }: { label: string; title: string; accent: string; body?: string | undefined }) { return <div className="section-heading"><p className="eyebrow">{label}</p><h2>{title} <span className="text-muted-foreground">{accent}</span></h2>{body && <p className="section-intro">{body}</p>}</div>; }
export function HomePage() {
  const { t } = useLanguage();
  return <><section data-section="/" className="hero"><img className="hero-image" src={shieldImage} width={1536} height={1024} alt="" fetchPriority="high"/><div className="hero-shade"/><div className="page-width hero-content"><div className="availability"><span className="status-dot"/>{t.available}</div><p className="hero-greeting">{t.hello}</p><h1>Mirislom<span className="text-primary">.</span><span className="hero-cursor">_</span></h1><h2>{t.role}</h2><p className="hero-description">{t.description}</p><div className="domain-list">{t.domains.map((domain, i) => <span key={domain}>{i === 0 ? <ShieldCheck/> : i === 1 ? <Globe/> : <Cpu/>}{domain}</span>)}</div><div className="hero-actions"><Button asChild variant="neon" size="lg"><Link to="/projects">{t.viewProjects}<ArrowUpRight/></Link></Button><Button asChild variant="outline" size="lg"><Link to="/contact">{t.contactMe}<ArrowRight/></Link></Button></div><div className="mini-terminal"><div className="terminal-top"><span className="terminal-dots"><i/><i/><i/></span><span>{t.terminal}</span></div><div className="terminal-body"><p><span className="text-primary">❯</span> {t.command}</p><p className="text-muted-foreground">{t.terminalRole}</p><p className="terminal-last"><span className="text-primary">➜</span> {t.terminalStatus}<span className="typing-cursor"/></p></div></div><Link to="/about" className="explore-link"><ArrowDown size={15}/>{t.scroll}<span>01 — 05</span></Link></div><span className="hero-coordinate">SECURE BY MINDSET // 0x0F</span></section><div className="principle-strip"><div className="page-width">{t.strip.map((item, i) => <span key={item}><span className="text-primary">{['+', '⌘', '◇', '>_'][i]}</span>{item}</span>)}</div></div><AboutSection preview/><SkillsSection preview/><ProjectsSection preview/><section data-section="/contact" className="home-contact page-width"><div><p className="eyebrow">{t.contactLabel}</p><h2>{t.contactTitle}<br/><span className="text-primary">{t.contactAccent}</span></h2></div><Button asChild variant="outline" size="lg"><Link to="/contact">{t.contactMe}<ArrowUpRight/></Link></Button></section></>;
}
export function AboutSection({ preview = false }: { preview?: boolean }) { const { t } = useLanguage(); return <section data-section="/about" className={`content-section page-width ${preview ? '' : 'standalone-section'}`}><div className="about-grid"><SectionHeading label={t.aboutLabel} title={t.aboutTitle} accent={t.aboutAccent}/><div className="about-copy"><p>{t.aboutBody}</p>{!preview && <p>{t.aboutBody2}</p>}{preview && <Button asChild variant="link" className="section-text-link"><Link to="/about">{t.moreAbout}<ArrowUpRight/></Link></Button>}</div></div><div className="value-grid">{t.values.map((v, i) => <div className="value-item" key={v}><span className="value-index">0{i+1}</span><div><h3>{v}</h3><p>{t.valueDescriptions[i]}</p></div>{i === 0 ? <Crosshair/> : i === 1 ? <Crown/> : <ShieldCheck/>}</div>)}</div>{!preview && <div className="about-quote"><Terminal/><p>{t.intro}</p><span>— {t.copyright}</span></div>}</section>; }
export function SkillsSection({ preview = false }: { preview?: boolean }) { const { t } = useLanguage(); const icons = [ShieldCheck, Code2, Crosshair]; return <section data-section="/skills" className={`content-section page-width ${preview ? '' : 'standalone-section'}`}><div className="section-top"><SectionHeading label={t.skillsLabel} title={t.skillsTitle} accent={t.skillsAccent} body={preview ? undefined : t.skillsIntro}/>{preview && <Button asChild variant="link"><Link to="/skills">{t.allSkills}<ArrowUpRight/></Link></Button>}</div><div className="skill-grid">{t.skillNames.map((name, i) => { const Icon = icons[i]; return <article key={name} className="skill-card">{Icon && <Icon className="skill-icon" size={26}/>}<span className="card-index">0{i+1}</span><h3>{name}</h3><p>{t.skillDescriptions[i]}</p><div className="skill-tags">{t.skillItems[i]?.map(item => <span key={item}>{item}</span>)}</div></article>; })}</div></section>; }
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
export function StrategyPage() { const { t } = useLanguage(); const [expanded, setExpanded] = useState(false); return <section className="content-section page-width standalone-section"><SectionHeading label={t.strategyLabel} title={t.strategyTitle} accent={t.strategyAccent} body={t.strategyIntro}/><div className="strategy-grid"><article className="strategy-card"><div className="chess-board" aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <span key={i} className={(Math.floor(i/8)+i)%2 ? 'square-dark' : 'square-light'}>{i===20 ? '♞' : i===11 ? '♜' : i===27 ? '♔' : ''}</span>)}</div><Crown className="text-primary"/><h3>{t.chessTitle}</h3><p>{t.chessBody}</p><Button asChild variant="outline"><a href="https://www.chess.com" target="_blank" rel="noreferrer">{t.chessLink}<ArrowUpRight/></a></Button></article><article className="strategy-card"><div className="tactical-visual" aria-hidden="true"><Crosshair size={110} strokeWidth={0.6}/><span>CS2 <span>/</span> RDR2</span></div><Gamepad2 className="text-primary"/><h3>{t.gamingTitle}</h3><p>{t.gamingBody}</p><Button variant="outline" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{t.gamingLink}<ChevronRight className={expanded ? 'rotate-90' : ''}/></Button>{expanded && <ul className="strategy-highlights">{t.highlights.map(h => <li key={h}><Check size={16}/>{h}</li>)}</ul>}</article></div><p className="info-note">{t.statsNote}</p></section>; }
export function ContactPage() { const { t } = useLanguage(); const icons = [Github, ShieldCheck, Send, Mail]; return <section className="content-section page-width standalone-section contact-page"><SectionHeading label={t.contactLabel} title={t.contactTitle} accent={t.contactAccent} body={t.contactBody}/><div className="contact-grid">{t.contactNames.map((name, i) => { const Icon = icons[i]; return <article key={name} className="contact-item">{Icon && <Icon size={27}/>}<h3>{name}</h3><p>{t.contactDescriptions[i]}</p><span className="contact-pending">{t.notConnected}</span></article>; })}</div><p className="info-note">{t.contactNote}</p></section>; }
