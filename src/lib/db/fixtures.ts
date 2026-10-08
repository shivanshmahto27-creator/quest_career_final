/**
 * Career Quest — Seed Data & Catalog Fixtures
 * Source: DATABASE_SCHEMA_Career_Quest_v1.1_PERFECT.md §8
 */

export interface SkillFixture {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
}

export const SEED_SKILLS: SkillFixture[] = [
  {
    id: "skill-javascript",
    name: "JavaScript",
    slug: "javascript",
    category: "Languages",
    description: "Core ECMAScript language fundamentals, async patterns, and runtime semantics.",
  },
  {
    id: "skill-typescript",
    name: "TypeScript",
    slug: "typescript",
    category: "Languages",
    description: "Static typing, generics, interfaces, and modern type engineering.",
  },
  {
    id: "skill-react",
    name: "React",
    slug: "react",
    category: "Frontend",
    description: "Component architecture, hooks, state management, and virtual DOM rendering.",
  },
  {
    id: "skill-nextjs",
    name: "Next.js",
    slug: "nextjs",
    category: "Frontend",
    description: "App Router, server components, SSR, and full-stack React routing.",
  },
  {
    id: "skill-nodejs",
    name: "Node.js",
    slug: "nodejs",
    category: "Backend",
    description: "Server-side JavaScript runtime, HTTP servers, events, and file systems.",
  },
  {
    id: "skill-sql",
    name: "SQL & Relational Databases",
    slug: "sql",
    category: "Backend",
    description: "Relational data modeling, ACID transactions, queries, and indexing.",
  },
  {
    id: "skill-git",
    name: "Git & Version Control",
    slug: "git",
    category: "DevOps",
    description: "Branching workflows, commits, pull requests, and conflict resolution.",
  },
  {
    id: "skill-rest-apis",
    name: "REST API Design",
    slug: "rest-apis",
    category: "Backend",
    description: "HTTP verbs, REST constraints, payload modeling, and status codes.",
  },
  {
    id: "skill-system-design",
    name: "System Design Fundamentals",
    slug: "system-design",
    category: "Architecture",
    description: "Scalability, caching, database selection, load balancing, and failure domains.",
  },
];

export const DEMO_USER = {
  id: "user-demo-001",
  email: "demo@careerquest.dev",
  name: "Alex Mercer",
};

export const DEMO_PROFILE = {
  id: "profile-demo-001",
  userId: "user-demo-001",
  targetRole: "Full Stack Developer",
  targetSpecialization: "Modern Web Systems",
  weeklyHours: 15,
  experienceSummary: "Self-taught programmer with basic HTML/CSS knowledge wanting to land a junior full-stack role.",
};
