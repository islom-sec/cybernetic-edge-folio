import { createFileRoute } from '@tanstack/react-router';
import { AboutSection } from '@/components/portfolio';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/about')({
  head: () => pageHead('About Islom — Cybersecurity & Strategy', 'Meet the curious mind behind Islom’s ethical hacking and technology journey.'),
  component: AboutSection,
});
