You are integrating an existing React hero component into a live codebase.

Before you edit
1. Inspect the repo and identify the framework, routing model, JS or TS usage, styling approach, and whether path aliases like `@/` already exist.
2. Reuse the project's conventions. Do not introduce shadcn, Tailwind, TypeScript, or custom aliases unless the repo already uses them or the user explicitly asks for them.
3. If the project does not use Tailwind, translate the classes into the local styling system instead of forcing a new setup.
4. If `framer-motion` is unavailable and the user wants zero new dependencies, replace `motion.*` elements with regular HTML elements and keep the layout intact.
5. Keep the integration SSR-safe. Avoid browser-only APIs during render and avoid unstable output such as `Math.random()` inside JSX.
6. Replace placeholder copy and links with project-specific content when context exists.

Suggested deliverables
- The integrated component in the repo's normal components directory
- Any dependency changes that were actually required
- A short note explaining where the component was placed and how it was adapted

Dependencies for exact parity
- `framer-motion`

Component source
```tsx
import { motion } from "framer-motion";

type HeroNavItem = {
  label: string;
  href: string;
};

type HeroAction = {
  label: string;
  href: string;
};

export interface ShaderHeroProps {
  brand?: string;
  eyebrow?: string;
  navItems?: HeroNavItem[];
  titleLead?: string;
  titleAccent?: string;
  titleTail?: string;
  description?: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
}

const floatingBadges = [
  { label: "Realtime gradients", className: "left-[10%] top-28", delay: 0.2 },
  { label: "Motion tuned", className: "right-[18%] top-40", delay: 0.35 },
  { label: "Launch ready", className: "right-[10%] bottom-24", delay: 0.5 },
];

export function ShaderHero({
  brand = "Lattice",
  eyebrow = "New visual system for ambitious product teams",
  navItems = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "#docs" },
  ],
  titleLead = "Design",
  titleAccent = "interfaces",
  titleTail = "that feel alive.",
  description = "Build a launch-ready hero with depth, motion, and a clear conversion path without sacrificing performance or accessibility.",
  primaryAction = { label: "Get started", href: "#get-started" },
  secondaryAction = { label: "View pricing", href: "#pricing" },
}: ShaderHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.26),_transparent_34%),radial-gradient(circle_at_85%_18%,_rgba(56,189,248,0.25),_transparent_28%),radial-gradient(circle_at_80%_82%,_rgba(249,115,22,0.22),_transparent_22%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(2,6,23,0.96))]" />
      <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      {floatingBadges.map((badge) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: badge.delay }}
          className={`absolute hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/75 backdrop-blur md:block ${badge.className}`}
        >
          {badge.label}
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sm font-semibold tracking-[0.28em]">
              LX
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                {brand}
              </p>
              <p className="text-xs text-white/50">Motion-first product design</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm text-white/75">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <div className="grid flex-1 items-end gap-14 py-16 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 inline-flex rounded-full border border-white/[0.12] bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur"
            >
              {eyebrow}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              <span className="block text-white/84">{titleLead}</span>
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-orange-300 bg-clip-text text-transparent">
                {titleAccent}
              </span>
              <span className="block text-white">{titleTail}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-white/70"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <a
                href={primaryAction.href}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-100"
              >
                {primaryAction.label}
              </a>
              <a
                href={secondaryAction.href}
                className="rounded-full border border-white/[0.18] bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                {secondaryAction.label}
              </a>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.34 }}
            className="rounded-[30px] border border-white/[0.12] bg-white/[0.08] p-6 backdrop-blur-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Live preview
            </p>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-900/[0.85] p-5">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Campaign heartbeat</span>
                <span>+28%</span>
              </div>
              <div className="mt-6 space-y-4">
                {[72, 58, 91, 65].map((value, index) => (
                  <div key={value} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>Signal {index + 1}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.08]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, delay: 0.48 + index * 0.08 }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-orange-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
```

Optional demo
```tsx
import { ShaderHero } from "./shader-hero";

export default function ShaderHeroDemo() {
  return (
    <div className="bg-slate-950 p-6">
      <ShaderHero />
    </div>
  );
}
```
