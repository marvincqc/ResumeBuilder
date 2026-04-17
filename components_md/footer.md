You are integrating an existing React footer component into a live codebase.

Before you edit
1. Inspect the repo and identify the framework, routing layer, JS or TS usage, styling approach, and existing shared components.
2. Reuse the repo's conventions. Do not introduce `next/link`, shadcn, or `@/` imports unless the project already uses them.
3. If the app uses framework-specific links, adapt the anchor tags to the local router after confirming how links are handled elsewhere in the codebase.
4. If the project does not use Tailwind, translate the classes into the local styling system instead of forcing a setup change.
5. Replace placeholder brand copy, social URLs, and creator credits with project-appropriate values when context exists.

Suggested deliverables
- The integrated footer component
- Any small dependency changes that were actually needed
- A short usage example wired to the app's real navigation

Dependencies for exact parity
- `lucide-react`

Component source
```tsx
import {
  Github,
  Linkedin,
  Mail,
  NotepadTextDashed,
  Twitter,
} from "lucide-react";
import type { ReactNode } from "react";

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink extends FooterLink {
  icon: ReactNode;
}

export interface ModemFooterProps {
  brandName?: string;
  brandDescription?: string;
  navLinks?: FooterLink[];
  socialLinks?: SocialLink[];
  creatorName?: string;
  creatorHref?: string;
  brandIcon?: ReactNode;
}

export function ModemFooter({
  brandName = "ResumeGPT",
  brandDescription = "AI-assisted resume creation for teams that need polished candidate packets fast.",
  navLinks = [],
  socialLinks = [],
  creatorName,
  creatorHref,
  brandIcon,
}: ModemFooterProps) {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900">
      <div className="absolute inset-x-0 bottom-20 text-center text-[clamp(4rem,16vw,12rem)] font-black uppercase tracking-[-0.08em] text-slate-900/[0.06]">
        {brandName}
      </div>

      <div className="relative mx-auto flex min-h-[32rem] max-w-7xl flex-col justify-between gap-16 px-6 py-12 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-slate-900/10 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            {brandIcon || <NotepadTextDashed className="h-10 w-10" />}
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight">{brandName}</h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
            {brandDescription}
          </p>

          {socialLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-950"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          )}

          {navLinks.length > 0 && (
            <nav className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition hover:text-slate-950"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-900/10 pt-6 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          {creatorName && creatorHref ? (
            <a href={creatorHref} target="_blank" rel="noreferrer" className="transition hover:text-slate-950">
              Crafted by {creatorName}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export const defaultFooterSocialLinks: SocialLink[] = [
  { label: "Twitter", href: "https://twitter.com", icon: <Twitter className="h-5 w-5" /> },
  { label: "LinkedIn", href: "https://linkedin.com", icon: <Linkedin className="h-5 w-5" /> },
  { label: "GitHub", href: "https://github.com", icon: <Github className="h-5 w-5" /> },
  { label: "Email", href: "mailto:contact@example.com", icon: <Mail className="h-5 w-5" /> },
];
```

Optional demo
```tsx
import { NotepadTextDashed } from "lucide-react";
import {
  ModemFooter,
  defaultFooterSocialLinks,
} from "./modem-footer";

export default function FooterDemo() {
  return (
    <ModemFooter
      brandName="ResumeGPT"
      brandDescription="AI-powered resume builder for agencies, candidates, and placement teams."
      navLinks={[
        { label: "Pricing", href: "#pricing" },
        { label: "Templates", href: "#templates" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
      ]}
      socialLinks={defaultFooterSocialLinks}
      creatorName="Your Team"
      creatorHref="https://example.com"
      brandIcon={<NotepadTextDashed className="h-10 w-10" />}
    />
  );
}
```
