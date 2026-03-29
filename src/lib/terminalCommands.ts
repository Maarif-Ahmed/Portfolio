type ChamberModeTarget = 'primary' | 'alternate';

export type MiniTerminalAction = "print" | "clear" | "destruct" | "route" | "section" | "mailto" | "chamber";

export interface MiniTerminalCommandDefinition {
  command: string;
  description: string;
  action: MiniTerminalAction;
  output?: string[];
  target?: string | ChamberModeTarget;
  hidden?: boolean;
}

const skillsOutput = [
  "{",
  '  "frontend": ["Next.js", "React 19", "TypeScript", "Tailwind"],',
  '  "motion": ["GSAP", "Framer Motion"],',
  '  "graphics": ["Three.js", "React Three Fiber"],',
  '  "backend": ["Node.js", "APIs", "SQL"],',
  '  "vibe": "terminal-grade polish"',
  "}",
];

export const MINI_TERMINAL_COMMANDS: MiniTerminalCommandDefinition[] = [
  {
    command: "whoami",
    description: "Print a short bio.",
    action: "print",
    output: [
      "Maarif is a fullstack developer focused on shipping interfaces that feel sharp, tactile, and alive.",
      "He likes motion systems, realtime-feeling UI, and products that look like they were built after midnight on purpose.",
    ],
  },
  {
    command: "skills",
    description: "Print the current stack as JSON.",
    action: "print",
    output: skillsOutput,
  },
  {
    command: "work",
    description: "Jump to the casefile archive.",
    action: "section",
    target: "work",
    output: [
      "Mounting casefile archive...",
      "Viewport rerouted to ~/root/work/projects",
    ],
  },
  {
    command: "about",
    description: "Open the full manual page.",
    action: "route",
    target: "/about",
    output: [
      "Routing to ~/root/docs/man.1/about",
    ],
  },
  {
    command: "contact",
    description: "Open the contact scene.",
    action: "route",
    target: "/contact",
    output: [
      "Routing to ~/root/contact.sh",
    ],
  },
  {
    command: "contact details",
    description: "Print the direct contact readout.",
    action: "print",
    output: [
      "email      : marifahmed9@gmail.com",
      "github     : https://github.com/Maarif-Ahmed",
      "linkedin   : https://www.linkedin.com/in/marif-ahmed/",
      "channel    : direct / async",
      "availability: product builds / frontend systems / AI integrations",
      "note       : the `contact` command opens the contact scene",
    ],
  },
  {
    command: "help",
    description: "List available terminal commands.",
    action: "print",
    output: [
      "Available commands:",
      "  whoami",
      "  skills",
      "  work",
      "  about",
      "  contact",
      "  contact details",
      "  help",
      "  clear",
      "  sudo rm -rf /",
    ],
  },
  {
    command: "invoke chamber.alt",
    description: "Shift the hero chamber into its hidden branch.",
    action: "chamber",
    target: "alternate",
    hidden: true,
  },
  {
    command: "restore chamber",
    description: "Return the hero chamber to its primary state.",
    action: "chamber",
    target: "primary",
    hidden: true,
  },
  {
    command: "clear",
    description: "Clear the console.",
    action: "clear",
  },
  {
    command: "sudo rm -rf /",
    description: "Do not do this.",
    action: "destruct",
    output: [
      "[sudo] password for root: ********",
      "Permission granted.",
      "Filesystem destruction initialized...",
    ],
  },
];

export function getMiniTerminalCommand(input: string) {
  return MINI_TERMINAL_COMMANDS.find(
    (definition) => definition.command.toLowerCase() === input.toLowerCase()
  );
}
