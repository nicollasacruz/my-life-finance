# Design Engineer System

## Direction

- **Feel:** Sophistication & trust for a finance tool; professional, calm, data-forward.
- **Tone:** Cool neutrals with a single accent (blue) for actions/state. Numbers are first-class.

## Depth Strategy

- **Primary surfaces:** Borders-only (`0.5px` to `1px` subtle neutral) on cards, tables, panels.
- **Overlays/modals:** Single subtle shadow (`0 8px 32px rgba(0,0,0,0.12)`, `0 2px 8px rgba(0,0,0,0.06)`) plus a 1px border. No layered shadows elsewhere.
- **Do not mix** additional shadows on inline components.

## Spacing & Radius

- **Base grid:** 4px. Use multiples only.
- **Common padding:** 12px/16px/24px depending on density (12px inside dense cards, 16px in forms).
- **Radius:** 8px for cards/modals; 6px for controls (inputs, buttons). Avoid ad-hoc radii.

## Typography

- **Family:** Geometric/humanist sans (e.g., Inter/SF). Data: monospace or `tabular-nums` where numbers align.
- **Hierarchy:** Title 600, body 400-500, labels 500. Letter-spacing tight on headlines (-0.02em).

## Color

- **Foundation:** Light neutral background (`#f7f8fb` to `#f9fafb`); surfaces `#ffffff`.
- **Border color:** `rgba(0,0,0,0.08)` primary; `rgba(0,0,0,0.04)` subtle.
- **Accent:** Blue (`#2563EB` family). Success `#16A34A`, Warn `#F59E0B`, Danger `#DC2626`.
- **Use color for meaning only** (state/action), not decoration.

## Controls

- Custom select/date for styled UIs. Inline-flex triggers with chevron; 12–16px padding.
- Inputs/buttons: height 40px (dense) or 44px (comfortable); padding 10–12px vertical, 12–16px horizontal; radius 6px; 1px border.
- Checkboxes/radios custom, aligned to 16px touch target.

## Lists/Tables/Cards

- **Cards:** Border-only; padding 16–24px; radius 8px; shadow only on overlays.
- **Tables/list rows:** 48px row height; use `tabular-nums` for numeric columns; hover uses subtle tint/border.
- **Section headers:** 14–16px, 600 weight, margin 16–24px bottom depending on density.

## Motion

- 150–200ms ease (`cubic-bezier(0.25, 1, 0.5, 1)`); no spring/bounce. Focus/hover states are crisp, not animated heavily.

## Patterns to Reuse (seed)

- **Primary button:** Height 44px, padding 0 16px, radius 6px, weight 600, bg `#2563EB`, hover darken by 8–10%, focus ring 2px `rgba(37,99,235,0.25)`.
- **Secondary button:** Height 44px, padding 0 16px, radius 6px, 1px border `rgba(0,0,0,0.08)`, bg `#fff`, text `#111827`, hover bg `#f3f4f6`.
- **Input:** Height 44px, padding 10px 12px, radius 6px, border `rgba(0,0,0,0.08)`, focus border `#2563EB` + ring `rgba(37,99,235,0.15)`.
- **Card:** Radius 8px, border 1px `rgba(0,0,0,0.08)`, padding 16–24px, no shadow (except overlays).

## Validation Checklist

- Spacing on 4px grid; radii 6/8 only.
- Depth matches strategy: borders-only except overlays.
- Accent limited to meaningful actions/state.
- Numbers use `tabular-nums`/mono where alignment matters.

## Next Steps

- When adding reusable patterns (e.g., filters bar, data cards), append measurements here.
