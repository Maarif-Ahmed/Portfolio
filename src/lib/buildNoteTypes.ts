export interface BuildNote {
  id: string;
  shortHash: string;
  date: string;
  headline: string;
  note: string;
  tone: 'feat' | 'fix' | 'refactor' | 'perf' | 'origin' | 'system';
  source: 'git' | 'fallback';
}
