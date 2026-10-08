import { createFileRoute } from '@tanstack/react-router';
import { SkillsSection } from '@/components/portfolio';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/skills')({
  head: () => pageHead('Skills & Toolkit — Mirislom', 'Explore Mirislom’s foundations in pentesting, Linux, Python, web development, AI, and strategy.'),
  component: SkillsSection,
});
