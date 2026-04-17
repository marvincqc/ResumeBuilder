You are integrating an existing React feature card component into a live codebase.

Before you edit
1. Inspect the repo and identify the framework, JS or TS usage, styling approach, shared UI primitives, and alias support.
2. Reuse the project's structure. Do not force `/components/ui`, shadcn, or `@/` imports if the repo does not already use them.
3. If the project does not use Tailwind, translate the styles into the existing styling system.
4. If `framer-motion` is unavailable, either install it for exact parity or replace the animated wrappers with static elements.
5. If `lucide-react` is unavailable, swap in the repo's existing icon system.
6. Replace placeholder marketing copy with product-specific copy when the surrounding app already provides context.

Suggested deliverables
- The integrated card component
- Any minimal dependency changes that were actually required
- A short example showing how to render it with real props

Dependencies for exact parity
- `framer-motion`
- `lucide-react`

Component source
```tsx
import { motion } from "framer-motion";
import { Check } from "lucide-react";

type Accent = "violet" | "pink" | "emerald" | "blue" | "fuchsia";

export interface FeatureCardProps {
  title: string;
  description: string;
  items: string[];
  buttonText: string;
  buttonHref?: string;
  accent?: Accent;
}

const accentClasses: Record<
  Accent,
  { glow: string; button: string; badge: string; border: string }
> = {
  violet: {
    glow: "bg-violet-500/25",
    button: "from-violet-500 to-fuchsia-400",
    badge: "bg-violet-500/20 text-violet-100",
    border: "border-violet-400/25",
  },
  pink: {
    glow: "bg-pink-500/25",
    button: "from-pink-500 to-rose-400",
    badge: "bg-pink-500/20 text-pink-100",
    border: "border-pink-400/25",
  },
  emerald: {
    glow: "bg-emerald-500/25",
    button: "from-emerald-500 to-lime-400",
    badge: "bg-emerald-500/20 text-emerald-100",
    border: "border-emerald-400/25",
  },
  blue: {
    glow: "bg-sky-500/25",
    button: "from-sky-500 to-cyan-400",
    badge: "bg-sky-500/20 text-sky-100",
    border: "border-sky-400/25",
  },
  fuchsia: {
    glow: "bg-fuchsia-500/25",
    button: "from-fuchsia-500 to-pink-400",
    badge: "bg-fuchsia-500/20 text-fuchsia-100",
    border: "border-fuchsia-400/25",
  },
};

export function FeatureCard({
  title,
  description,
  items,
  buttonText,
  buttonHref = "#",
  accent = "violet",
}: FeatureCardProps) {
  const theme = accentClasses[accent];

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="relative w-full max-w-sm"
    >
      <div className={`absolute -inset-5 rounded-[30px] blur-3xl ${theme.glow}`} />
      <div
        className={`relative overflow-hidden rounded-[28px] border bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.55)] ${theme.border}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_20%)]" />
        <div className="relative z-10">
          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${theme.badge}`}>
            Featured plan
          </div>

          <h3 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>

          <ul className="mt-7 space-y-3">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-100">
                <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${theme.badge}`}>
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <motion.a
            whileTap={{ scale: 0.98 }}
            href={buttonHref}
            className={`mt-8 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 ${theme.button}`}
          >
            {buttonText}
          </motion.a>
        </div>
      </div>
    </motion.article>
  );
}
```

Optional demo
```tsx
import { useState } from "react";
import { FeatureCard } from "./feature-card";

const accents = ["violet", "pink", "emerald", "blue", "fuchsia"] as const;
const accentPreviewColor = {
  violet: "#8b5cf6",
  pink: "#ec4899",
  emerald: "#10b981",
  blue: "#0ea5e9",
  fuchsia: "#d946ef",
} satisfies Record<(typeof accents)[number], string>;

export default function FeatureCardDemo() {
  const [accent, setAccent] = useState<(typeof accents)[number]>("violet");

  return (
    <div className="flex flex-col items-center gap-8 bg-slate-950 p-8">
      <div className="flex flex-wrap justify-center gap-3">
        {accents.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAccent(value)}
            className={`h-8 w-8 rounded-full border-2 border-white/20 ${
              accent === value ? "scale-110 border-white" : ""
            }`}
            style={{ backgroundColor: accentPreviewColor[value] }}
            aria-label={`Use ${value} accent`}
          />
        ))}
      </div>

      <FeatureCard
        title="Accelerate your launch"
        description="A focused feature card for pricing, bundles, or campaign highlights."
        items={[
          "10-week campaign runway",
          "Flexible analytics reporting",
          "Team onboarding included",
          "Fast iteration support",
        ]}
        buttonText="Get started"
        accent={accent}
      />
    </div>
  );
}
```
