export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectSection {
  title: string;
  body: string[];
}

export interface ProjectManifest {
  client: string;
  duration: string;
  status: string;
  mode: string;
}

export interface ProjectEvidence {
  label: string;
  title: string;
  detail: string;
}

export interface ProjectAnnotation {
  align?: 'left' | 'right';
  detail: string;
  label: string;
  title: string;
  x: number;
  y: number;
}

export interface ProjectLogEntry {
  command: string;
  response: string;
}

export interface ProjectRecord {
  id: string;
  title: string;
  fileName: string;
  desc: string;
  img: string;
  category: string;
  year: string;
  subtitle: string;
  metrics: ProjectMetric[];
  role: string[];
  tech: string[];
  overview: string[];
  buildNotes: ProjectSection[];
  manifest: ProjectManifest;
  evidence: ProjectEvidence[];
  annotations?: ProjectAnnotation[];
  signalLog: ProjectLogEntry[];
  isSecret?: boolean;
}

export const PROJECTS: ProjectRecord[] = [
  {
    id: '1',
    title: 'Terminal Vibe',
    fileName: 'terminal_vibe.exe',
    desc: 'A CLI-inspired dashboard that turns terminal theater into a sharp product surface.',
    img: '/casefiles/terminal-vibe.svg',
    category: 'Interface System',
    year: '2026',
    subtitle: 'Command-line aesthetics rebuilt as a tactile product shell.',
    metrics: [
      { label: 'Latency', value: '42ms avg' },
      { label: 'Motion Passes', value: '18' },
      { label: 'Views', value: 'Desktop + Mobile' },
    ],
    role: ['Frontend Architecture', 'Motion Design', 'Interaction Direction'],
    tech: ['Next.js', 'TypeScript', 'GSAP', 'Tailwind CSS'],
    overview: [
      'Terminal Vibe started as a simple homage to old command-line tools and evolved into a product shell that feels mechanical, responsive, and strangely cinematic.',
      'The challenge was keeping the interface dense and dramatic without turning it into noise. Every animation needed to communicate state instead of just showing off.',
    ],
    manifest: {
      client: 'Self-initiated portfolio system',
      duration: '6 weeks',
      status: 'Shipped',
      mode: 'Interface Operating Layer',
    },
    evidence: [
      {
        label: '01 / Navigation',
        title: 'Terminal chrome as product shell',
        detail: 'The interface borrows command-line language without sacrificing clarity, so the theatrics still carry real navigation weight.',
      },
      {
        label: '02 / Motion',
        title: 'Mechanical pacing over decorative motion',
        detail: 'Animation timing was treated like system feedback: fast when confirming action, slower when staging an entrance, never floating without purpose.',
      },
      {
        label: '03 / Response',
        title: 'Dense surface, controlled hierarchy',
        detail: 'The final shell stays information-rich because contrast, typography, and edge highlights keep the eye moving in the intended order.',
      },
    ],
    annotations: [
      {
        label: '01',
        title: 'Chrome grid',
        detail: 'The terminal frame is doing real navigation work, not just adding costume.',
        x: 18,
        y: 20,
        align: 'right',
      },
      {
        label: '02',
        title: 'Feedback cadence',
        detail: 'Hover, reveal, and motion timing were tuned to feel mechanical instead of decorative.',
        x: 66,
        y: 34,
        align: 'left',
      },
      {
        label: '03',
        title: 'Proof rail',
        detail: 'Metrics and evidence stay visible so the interface reads like a system, not a poster.',
        x: 54,
        y: 72,
        align: 'left',
      },
    ],
    signalLog: [
      { command: 'mount chrome.shell --theme terminal', response: 'Interactive housing attached with cyan edge highlights.' },
      { command: 'init motion.feedback --latency 42ms', response: 'Transitions tuned to feel mechanical rather than ornamental.' },
      { command: 'deploy viewport.telemetry --persist', response: 'HUD, command input, and cursor systems now share one visual language.' },
    ],
    buildNotes: [
      {
        title: 'CHALLENGE',
        body: [
          'Balance a high-noise visual language with real information hierarchy.',
          'Keep the interface fast even while layering glitch, cursor, and boot-sequence effects.',
        ],
      },
      {
        title: 'APPROACH',
        body: [
          'Built the shell from reusable terminal primitives: chrome bars, diagnostic HUDs, and command-driven interactions.',
          'Used animation timing like product copy, making each reveal feel intentional and stateful.',
        ],
      },
      {
        title: 'OUTCOME',
        body: [
          'The result reads like a developer toy at first glance, but it behaves like a deliberate portfolio operating system.',
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Neon Tracker',
    fileName: 'neon_tracker.app',
    desc: 'A bug-tracking concept that trades beige dashboards for a high-contrast operations room.',
    img: '/casefiles/neon-tracker.svg',
    category: 'Ops Dashboard',
    year: '2026',
    subtitle: 'A dark-mode tracking surface built for triage, speed, and pressure.',
    metrics: [
      { label: 'Queues', value: '12 active' },
      { label: 'Themes', value: '1 vivid mode' },
      { label: 'Signal', value: 'High contrast' },
    ],
    role: ['UI Systems', 'Product Direction', 'Motion Polish'],
    tech: ['React', 'Next.js', 'GSAP', 'Design Tokens'],
    overview: [
      'Neon Tracker imagines what issue triage would feel like if it were designed like an arcade control panel instead of a spreadsheet.',
      'The system emphasizes scanability, urgency, and confidence, with color and motion doing the work of status labels and cluttered badges.',
    ],
    manifest: {
      client: 'Internal ops concept',
      duration: '4 weeks',
      status: 'Concept shipped',
      mode: 'Monitoring Surface',
    },
    evidence: [
      {
        label: '01 / Pressure',
        title: 'Urgency without dashboard beige',
        detail: 'The visual system treats issue triage like an active control room, using framing and edge contrast instead of tables and passive badges.',
      },
      {
        label: '02 / Scanability',
        title: 'Status carried by motion and contrast',
        detail: 'Users can find the hottest state faster because the interface narrows attention with pacing, intensity, and compact status modules.',
      },
      {
        label: '03 / Tone',
        title: 'Operational, not ornamental',
        detail: 'The surface still feels disciplined because every highlight implies a state change or a workflow priority rather than empty gloss.',
      },
    ],
    signalLog: [
      { command: 'triage queue --priority high', response: 'Critical issues raised above neutral dashboard traffic.' },
      { command: 'reroute palette --from beige --to cyan', response: 'Contrast budget reallocated toward urgency and confidence.' },
      { command: 'lock hover.feedback --tight', response: 'Interaction timing now confirms action with near-instant response.' },
    ],
    buildNotes: [
      {
        title: 'CHALLENGE',
        body: [
          'Most dashboards flatten everything into tables. This one needed to feel alive without breaking legibility.',
        ],
      },
      {
        title: 'APPROACH',
        body: [
          'Used bold framing, terminal chrome, and narrow interaction zones to keep attention on the most volatile states first.',
          'Kept hover and transition timing tight so the UI feels responsive instead of ornamental.',
        ],
      },
      {
        title: 'OUTCOME',
        body: [
          'A monitoring interface that feels more like active command and less like passive administration.',
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Syntax Error',
    fileName: 'syntax_error.log',
    desc: 'A project about turning debugging culture into a visual narrative instead of a private developer ritual.',
    img: '/casefiles/syntax-error.svg',
    category: 'Narrative Portfolio',
    year: '2026',
    subtitle: 'Late-night debugging translated into a paced, atmospheric case study.',
    metrics: [
      { label: 'Sessions', value: '7 long nights' },
      { label: 'Refactors', value: '3 structural passes' },
      { label: 'Noise', value: 'Controlled chaos' },
    ],
    role: ['Creative Direction', 'Frontend Build', 'Story Framing'],
    tech: ['Next.js', 'Framer Motion', 'GSAP', 'Three.js'],
    overview: [
      'Syntax Error treats the familiar spiral of debugging as material instead of an accident. The interface leans into tension, misdirection, and payoff.',
      'Instead of hiding the messy middle, the page turns investigation, rollback, and iteration into the story itself.',
    ],
    manifest: {
      client: 'Narrative experiment',
      duration: '5 weeks',
      status: 'Released',
      mode: 'Debugging Transmission',
    },
    evidence: [
      {
        label: '01 / Story',
        title: 'The messy middle became the product',
        detail: 'Rollback, uncertainty, and pattern hunting were promoted from backstage process into the visible narrative engine of the page.',
      },
      {
        label: '02 / Atmosphere',
        title: 'Late-night debugging turned visual language',
        detail: 'Oversized type, low-light imagery, and restrained glow made the whole page feel like a system being held together at 2 AM.',
      },
      {
        label: '03 / Payoff',
        title: 'Resolution landed with relief, not polish theater',
        detail: 'The final sections reward the tension built earlier, so the story closes with control returning rather than more spectacle.',
      },
    ],
    signalLog: [
      { command: 'trace bug.origin --session night-07', response: 'Failure path isolated and promoted into the page narrative.' },
      { command: 'rollback visual.noise --step 03', response: 'Chaos reduced until the hierarchy could breathe again.' },
      { command: 'commit resolution --message "make the tension visible"', response: 'Debugging ritual reframed as authored storytelling.' },
    ],
    buildNotes: [
      {
        title: 'CHALLENGE',
        body: [
          'Translate frustration, iteration, and recovery into a readable visual system.',
        ],
      },
      {
        title: 'APPROACH',
        body: [
          'Used oversized headings, atmospheric imagery, and terminal language to make the page feel like a live debugging log with better typography.',
          'Structured the content so the user moves from tension to resolution instead of reading a flat project summary.',
        ],
      },
      {
        title: 'OUTCOME',
        body: [
          'The final page feels more like a controlled transmission than a static project card.',
        ],
      },
    ],
  },
  {
    id: '4',
    title: 'Git Pushed',
    fileName: 'git_pushed.viz',
    desc: 'A contribution-driven concept that turns commit energy into something spatial and alive.',
    img: '/casefiles/git-pushed.svg',
    category: 'Data Sculpture',
    year: '2026',
    subtitle: 'A coding history visualized as a glowing technical landscape.',
    metrics: [
      { label: 'Commits', value: '365 synthetic' },
      { label: 'Render', value: 'Isometric grid' },
      { label: 'Mood', value: 'Quietly obsessive' },
    ],
    role: ['Data Visualization', '3D Direction', 'Frontend Engineering'],
    tech: ['React Three Fiber', 'Three.js', 'TypeScript', 'GSAP'],
    overview: [
      'Git Pushed explores the quiet spectacle of repeat work. It visualizes output as a landscape instead of a flat heatmap, giving rhythm and scale to routine coding time.',
      'The piece is less about metrics theater and more about making persistence feel physical.',
    ],
    manifest: {
      client: 'Data sculpture study',
      duration: '3 weeks',
      status: 'Gallery-ready',
      mode: 'Technical Sculpture',
    },
    evidence: [
      {
        label: '01 / Form',
        title: 'Contribution data became terrain',
        detail: 'A flat commit history was translated into a spatial field so repetition reads like topography instead of spreadsheet residue.',
      },
      {
        label: '02 / Lighting',
        title: 'Glow used as silhouette control',
        detail: 'The cyan emission is intentionally restrained so the bars feel technical and calm, not like a noisy nightclub render.',
      },
      {
        label: '03 / Rhythm',
        title: 'Persistence carries more weight than novelty',
        detail: 'The scene is quiet on purpose, letting the repetition of work become the emotional point rather than a live-data gimmick.',
      },
    ],
    signalLog: [
      { command: 'ingest commit.field --range 365d', response: 'Synthetic contribution density translated into a spatial grid.' },
      { command: 'render terrain --projection isometric', response: 'Silhouette stabilized for gallery presentation.' },
      { command: 'grade cyan.emission --restrained', response: 'Telemetry mood preserved without overpowering adjacent copy.' },
    ],
    buildNotes: [
      {
        title: 'CHALLENGE',
        body: [
          'Make contribution data feel dimensional without overwhelming the rest of the site.',
        ],
      },
      {
        title: 'APPROACH',
        body: [
          'Chose an isometric projection, restrained palette, and glow-driven lighting so the geometry carries the drama.',
          'Focused on silhouette and pacing rather than live data complexity.',
        ],
      },
      {
        title: 'OUTCOME',
        body: [
          'The graph reads as both sculpture and telemetry, which makes it a strong break between text-heavy sections.',
        ],
      },
    ],
  },
  {
    id: '5',
    title: 'Neon Abyss',
    fileName: 'neon_abyss.tmp',
    desc: 'A secret playground build unlocked through sudo mode, where the interface gets weird on purpose.',
    img: '/casefiles/neon-abyss.svg',
    category: 'Hidden Experiment',
    year: '2026',
    subtitle: 'A volatile sandbox for color, signal noise, and late-night interface experiments.',
    metrics: [
      { label: 'Stability', value: 'Questionable' },
      { label: 'Palette', value: 'Cyan + Magenta' },
      { label: 'Access', value: 'Sudo only' },
    ],
    role: ['Visual Experimentation', 'Shader Mood', 'Interface Mischief'],
    tech: ['React', 'GSAP', 'Canvas', 'Unreasonable decisions'],
    overview: [
      'Neon Abyss is the part of the portfolio that does not pretend to be sensible. It exists for visual curiosity, aggressive color, and ideas that were too unstable for the main surface.',
      'Unlocking it is less about secrecy and more about rewarding the people who poke around like developers instead of passive viewers.',
    ],
    manifest: {
      client: 'Hidden branch',
      duration: 'Ongoing',
      status: 'Volatile',
      mode: 'Unlocked Experiment',
    },
    evidence: [
      {
        label: '01 / Reward',
        title: 'Secret path with actual intent',
        detail: 'The hidden branch is treated like a real artifact, so unlocking it feels like accessing unstable R&D rather than finding a throwaway joke.',
      },
      {
        label: '02 / Color',
        title: 'Magenta enters only when the system slips',
        detail: 'The main palette stays disciplined until sudo mode opens a branch where the guardrails loosen and the color temperature shifts.',
      },
      {
        label: '03 / Tone',
        title: 'Still designed, just less obedient',
        detail: 'Even at its weirdest, the experiment keeps the site language intact enough to feel like a rogue sibling instead of a separate project.',
      },
    ],
    signalLog: [
      { command: 'sudo unlock neon_abyss.tmp', response: 'Hidden branch mounted with unstable visual privileges.' },
      { command: 'raise signal.noise --beyond sane', response: 'Experimental motion and color variance permitted.' },
      { command: 'ship weird.branch --anyway', response: 'Playfulness preserved without abandoning craft.' },
    ],
    buildNotes: [
      {
        title: 'CHALLENGE',
        body: [
          'Create a hidden build that feels intentional instead of tossed in as a joke.',
        ],
      },
      {
        title: 'APPROACH',
        body: [
          'Leaning on magenta accents, unstable motion, and a deliberately looser tone while still staying inside the site language.',
          'Treated the unlock itself as part of the experience, not just the project card that appears after it.',
        ],
      },
      {
        title: 'OUTCOME',
        body: [
          'A secret fifth project that feels earned, playful, and still designed with care.',
        ],
      },
    ],
    isSecret: true,
  },
];

export function getVisibleProjects(sudoMode: boolean) {
  return sudoMode ? PROJECTS : PROJECTS.filter((project) => !project.isSecret);
}

export const PROJECTS_BY_ID = Object.fromEntries(PROJECTS.map((project) => [project.id, project])) as Record<string, ProjectRecord>;
