import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from '@/components/portfolio';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute("/")({
  head: () => pageHead('Islom — Junior Pentester & Tech Explorer', 'Meet Islom, a cybersecurity enthusiast exploring ethical hacking, web security, and AI-assisted development.'),
  component: HomePage,
});
