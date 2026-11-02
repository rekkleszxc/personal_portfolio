export const profile = {
  name: "George Harold Alcantara",
  role: "Student / Vibe Coder",
  email: "alcantara.georgeharold.ayson@gmail.com",
  github: "https://github.com/rekkleszxc",
  linkedin: "https://www.linkedin.com/in/alexmorgan",
  status: "Online!",
  headline: "I turn product ideas into fast, reliable web apps.",
  tagline:
    "Full-stack engineer working with startups and small teams. I own a feature from the first sketch to the production dashboard.",
  bio: [
    "I've spent six years building web products, mostly with TypeScript, React and Postgres. I'm happiest in the stretch between a rough idea and a first release, where decisions are still cheap to change.",
    "Lately I've been adding language models to existing products, which mostly means careful evaluation and boring plumbing rather than demos. I write about it when I have something worth saying.",
  ],
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const categories = ["All", "Full-Stack", "AI & ML", "Frontend"] as const;
export type Category = Exclude<(typeof categories)[number], "All">;

export type Project = {
  title: string;
  description: string;
  category: Category;
  tags: string[];
  live: string;
  github: string;
  metrics: { value: string; label: string }[];
  tone: string;
  image?: string; // optional path in /public; a generated preview is used otherwise
};

export const projects: Project[] = [
  {
    title: "Ledgerly",
    category: "Full-Stack",
    tone: "#0e7490",
    live: "https://example.com",
    github: "https://github.com/alexmorgan/ledgerly",
    description:
      "Invoicing and payment tracking for freelancers, with Stripe webhooks and a monthly cash-flow view.",
    tags: ["Next.js", "Postgres", "Stripe"],
    metrics: [
      { value: "1.2k", label: "active users" },
      { value: "-38%", label: "late payments" },
    ],
  },
  {
    title: "Fieldnotes",
    category: "AI & ML",
    tone: "#4f46e5",
    live: "https://example.com",
    github: "https://github.com/alexmorgan/fieldnotes",
    description:
      "Search over interview transcripts. Retrieval plus a small reranker keeps answers tied to the source quote.",
    tags: ["Python", "pgvector", "FastAPI"],
    metrics: [
      { value: "91%", label: "answer accuracy" },
      { value: "<2s", label: "median latency" },
    ],
  },
  {
    title: "Orbit UI",
    category: "Frontend",
    tone: "#7c3aed",
    live: "https://example.com",
    github: "https://github.com/alexmorgan/orbit-ui",
    description:
      "An accessible React component library with keyboard-first menus and tokens that work in light and dark.",
    tags: ["React", "TypeScript", "Storybook"],
    metrics: [
      { value: "40", label: "components" },
      { value: "100", label: "a11y audit score" },
    ],
  },
  {
    title: "Shiplog",
    category: "Full-Stack",
    tone: "#0f766e",
    live: "https://example.com",
    github: "https://github.com/alexmorgan/shiplog",
    description:
      "Changelog and release-notes tool that builds a public page from merged pull requests.",
    tags: ["Next.js", "tRPC", "Prisma"],
    metrics: [
      { value: "300+", label: "teams" },
      { value: "4 min", label: "setup time" },
    ],
  },
  {
    title: "Triage",
    category: "AI & ML",
    tone: "#be185d",
    live: "https://example.com",
    github: "https://github.com/alexmorgan/triage",
    description:
      "Classifies support tickets by urgency and routes them, with a review queue for low-confidence cases.",
    tags: ["Python", "scikit-learn", "Redis"],
    metrics: [
      { value: "-52%", label: "first response time" },
      { value: "94%", label: "routing accuracy" },
    ],
  },
  {
    title: "Atlas Dashboard",
    category: "Frontend",
    tone: "#b45309",
    live: "https://example.com",
    github: "https://github.com/alexmorgan/atlas",
    description:
      "A fast analytics dashboard that renders 100k rows with virtualized tables and streaming charts.",
    tags: ["React", "D3", "Vite"],
    metrics: [
      { value: "60fps", label: "scrolling" },
      { value: "-70%", label: "bundle size" },
    ],
  },
];

export const experience = [
  {
    company: "Northwind Labs",
    role: "Senior full-stack engineer",
    dates: "2023 to now",
    achievements: [
      "Led a rebuild of the checkout flow, which lifted conversion by 14%.",
      "Cut p95 API latency from 900ms to 210ms by reworking the query layer.",
      "Mentored three engineers through their first production launches.",
    ],
  },
  {
    company: "Brightside",
    role: "Frontend engineer",
    dates: "2021 to 2023",
    achievements: [
      "Built the design system used by five product teams.",
      "Moved the marketing site to Next.js and halved the time to first byte.",
      "Introduced Playwright tests that caught regressions before release.",
    ],
  },
  {
    company: "Paperplane Studio",
    role: "Web developer",
    dates: "2019 to 2021",
    achievements: [
      "Shipped 20+ client sites on a shared component kit.",
      "Wrote the internal deploy tooling that removed manual releases.",
    ],
  },
];

export type Level = 1 | 2 | 3;
export const skills: {
  domain: string;
  items: { name: string; level: Level }[];
}[] = [
  {
    domain: "Frontend",
    items: [
      { name: "React / Next.js", level: 3 },
      { name: "TypeScript", level: 3 },
      { name: "Tailwind CSS", level: 3 },
      { name: "Framer Motion", level: 2 },
    ],
  },
  {
    domain: "Backend",
    items: [
      { name: "Node.js", level: 3 },
      { name: "PostgreSQL", level: 3 },
      { name: "REST and tRPC", level: 3 },
      { name: "Python / FastAPI", level: 2 },
    ],
  },
  {
    domain: "AI and data",
    items: [
      { name: "Retrieval pipelines", level: 2 },
      { name: "Evaluation harnesses", level: 2 },
      { name: "scikit-learn", level: 1 },
    ],
  },
  {
    domain: "Tooling",
    items: [
      { name: "Git and CI", level: 3 },
      { name: "Playwright", level: 2 },
      { name: "Docker", level: 2 },
    ],
  },
];
