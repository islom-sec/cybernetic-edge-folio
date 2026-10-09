import { createFileRoute } from '@tanstack/react-router';
import { StrategyPage } from '@/components/portfolio';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/strategy')({
  head: () => pageHead('Chess & Tactical Gaming — Islom', 'Chess, CS2, and RDR2: the strategy and analytical thinking behind Islom’s security mindset.'),
  component: StrategyPage,
});
