You are integrating an existing React testimonials component into a live codebase.

Before you edit
1. Inspect the repo and identify the framework, JS or TS usage, styling approach, and the existing section/component patterns.
2. Reuse the repo's conventions. Do not force shadcn, Radix, or `@/` aliases if they are not already present.
3. If the project does not use Tailwind, translate the classes into the local styling system instead of adding Tailwind just for this section.
4. Prefer local project data or CMS-driven content when testimonials already live somewhere else in the app.
5. Replace stock testimonial text and avatars with project-appropriate content whenever that context is available.

Suggested deliverables
- The integrated testimonials section
- A minimal example using real or placeholder data shaped like the app expects
- Any small dependency changes that were actually required

Dependencies
- None required for the base version below

Component source
```tsx
export interface TestimonialItem {
  name: string;
  role: string;
  company?: string;
  avatarSrc?: string;
  content: string;
}

export interface TestimonialsSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  testimonials: TestimonialItem[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TestimonialsSection({
  eyebrow = "Client feedback",
  title = "What people say after launch",
  description = "Use this section for customer proof, internal stakeholder quotes, or partner feedback.",
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={`${testimonial.name}-${testimonial.role}`}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <p className="text-base leading-7 text-slate-700">
                "{testimonial.content}"
              </p>

              <div className="mt-6 flex items-center gap-4">
                {testimonial.avatarSrc ? (
                  <img
                    src={testimonial.avatarSrc}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {getInitials(testimonial.name)}
                  </div>
                )}

                <div>
                  <p className="font-medium text-slate-950">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">
                    {testimonial.role}
                    {testimonial.company ? `, ${testimonial.company}` : ""}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Optional demo
```tsx
import { TestimonialsSection } from "./testimonials-section";

const sampleTestimonials = [
  {
    name: "Meschac Irung",
    role: "Creator",
    company: "Tailark",
    avatarSrc: "https://avatars.githubusercontent.com/u/47919550?v=4",
    content:
      "Using Tailark has been like unlocking a secret design superpower. It gives us structure without flattening our ideas.",
  },
  {
    name: "Theo Balick",
    role: "Frontend Engineer",
    company: "Tailark",
    avatarSrc: "https://avatars.githubusercontent.com/u/68236786?v=4",
    content:
      "The component set is flexible enough for product work and polished enough to ship without a long cleanup pass.",
  },
  {
    name: "Glodie Lukose",
    role: "Frontend Engineer",
    company: "Tailark",
    avatarSrc: "https://avatars.githubusercontent.com/u/99137927?v=4",
    content:
      "We moved faster because the design language stayed consistent even as the product surface kept growing.",
  },
];

export default function TestimonialsDemo() {
  return <TestimonialsSection testimonials={sampleTestimonials} />;
}
```
