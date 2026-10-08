import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from '@/components/portfolio';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute("/")({
  head: () => pageHead('Mirislom — Junior Pentester & Tech Explorer', 'Meet Mirislom, a 15-year-old cybersecurity enthusiast exploring ethical hacking, web security, and AI-assisted development.'),
  component: HomePage,
});
