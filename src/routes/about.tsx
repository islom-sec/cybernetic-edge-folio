import { createFileRoute } from '@tanstack/react-router';
import { AboutSection } from '@/components/portfolio';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/about')({
  head: () => pageHead('About Mirislom — Cybersecurity & Strategy', 'Meet the curious mind behind Mirislom’s ethical hacking and technology journey.'),
  component: AboutSection,
});
