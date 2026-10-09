import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/components/portfolio';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/contact')({
  head: () => pageHead('Connect with Islom — Junior Pentester', 'Connect with Islom for cybersecurity learning, technology exploration, and collaboration.'),
  component: ContactPage,
});
