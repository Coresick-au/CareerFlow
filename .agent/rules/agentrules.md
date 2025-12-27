---
trigger: always_on
---

STRICT UI RULE: DARK MODE & THEME SEMANTICS

No Hardcoded Colors: Never use bg-white, text-black, or specific hex codes.

Use CSS Variables Only: All components MUST use Tailwind's semantic classes: bg-background, text-foreground, border-border, bg-card, and text-muted-foreground.

Dark Mode Testing: Every new component must be verified in both light and dark states. If a component looks "broken" in dark mode, it is because it's missing a semantic class or has a hardcoded white background.

Radix/Shadcn Standard: Follow the established pattern in src/index.css where colors are defined as HSL variables.

