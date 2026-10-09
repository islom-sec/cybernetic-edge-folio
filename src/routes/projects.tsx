import { createFileRoute } from '@tanstack/react-router';
import { ProjectsSection } from '@/components/portfolio';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/projects')({
  head: () => pageHead('Projects & CTF Learning — Islom', 'Explore CTF learning paths, security scripting ideas, and AI-assisted web experiments.'),
  component: ProjectsSection,
});
