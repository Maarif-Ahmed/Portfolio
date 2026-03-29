import { spawnSync } from 'node:child_process';
import type { BuildNote } from '@/lib/buildNoteTypes';

const FALLBACK_BUILD_NOTES: BuildNote[] = [
  {
    id: 'fallback-origin',
    shortHash: 'origin',
    date: '2026-03-25',
    headline: 'Initial archive frame locked into place',
    note: 'The first public state of the portfolio established the chamber, archive rhythm, and terminal language.',
    tone: 'origin',
    source: 'fallback',
  },
  {
    id: 'fallback-motion',
    shortHash: 'motion',
    date: '2026-03-26',
    headline: 'Desktop motion system hardened around the archive',
    note: 'Scroll pressure, casefile pacing, and the archive reveal were tightened into a steadier reading flow.',
    tone: 'refactor',
    source: 'fallback',
  },
  {
    id: 'fallback-shell',
    shortHash: 'shell',
    date: '2026-03-28',
    headline: 'Terminal, contact, and dossier layers were threaded together',
    note: 'The shell stopped acting like a prop and became a real route into the archive and contact scene.',
    tone: 'feat',
    source: 'fallback',
  },
  {
    id: 'fallback-chamber',
    shortHash: 'chamber',
    date: '2026-03-29',
    headline: 'The hero chamber was pulled into a quieter, more ritual frame',
    note: 'Typography, object staging, and release energy were reduced so the homepage could breathe as one current.',
    tone: 'system',
    source: 'fallback',
  },
];

function classifyTone(subjectLine: string): BuildNote['tone'] {
  const normalizedSubject = subjectLine.toLowerCase();

  if (normalizedSubject.startsWith('feat:')) return 'feat';
  if (normalizedSubject.startsWith('fix:')) return 'fix';
  if (normalizedSubject.startsWith('refactor:')) return 'refactor';
  if (normalizedSubject.startsWith('perf:')) return 'perf';
  if (normalizedSubject.startsWith('initial commit')) return 'origin';

  return 'system';
}

function buildLedgerNote(tone: BuildNote['tone']) {
  switch (tone) {
    case 'feat':
      return 'A new visible surface was added to the portfolio current without breaking the chamber tone.';
    case 'fix':
      return 'A stability pass was recorded so the reading flow stays sharp under pressure.';
    case 'refactor':
      return 'The internal structure shifted while the front-end read stayed calm and deliberate.';
    case 'perf':
      return 'Runtime pressure was trimmed so the chamber can hold shape more comfortably.';
    case 'origin':
      return 'The first recorded state remains in the ledger as the point where the archive took form.';
    default:
      return 'A repository note carried forward into the current build state.';
  }
}

function cleanHeadline(subjectLine: string) {
  return subjectLine.replace(/^(feat|fix|refactor|perf|chore):\s*/i, '').trim();
}

export async function getBuildNotes(limit = 4): Promise<BuildNote[]> {
  const gitLog = spawnSync(
    'git',
    ['log', `-n${limit}`, '--date=short', '--pretty=format:%h%x1f%ad%x1f%s'],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    }
  );

  if (gitLog.status !== 0 || !gitLog.stdout.trim()) {
    return FALLBACK_BUILD_NOTES.slice(0, limit);
  }

  const entries: BuildNote[] = [];

  gitLog.stdout
    .trim()
    .split(/\r?\n/)
    .forEach((rawLine, index) => {
      const [shortHash, date, subjectLine] = rawLine.split('\x1f');
      if (!shortHash || !date || !subjectLine) return;

      const tone = classifyTone(subjectLine);

      entries.push({
        id: `${shortHash}-${index}`,
        shortHash,
        date,
        headline: cleanHeadline(subjectLine),
        note: buildLedgerNote(tone),
        tone,
        source: 'git',
      });
    });

  return entries.length > 0 ? entries : FALLBACK_BUILD_NOTES.slice(0, limit);
}
