# PocketPilot — Brand Direction
**For Carlos (frontend implementation)**
**Authored by Rocio, Marketing**
**Date: March 25, 2026**

---

## What I saw in the current UI

Before defining where we go, here is what the current state tells me:

- **Typography**: Geist Sans + Geist Mono. Both are clean, utilitarian fonts built for developer tools. They read "productivity SaaS" but not "personal finance companion." There is nothing warm or characterful about them.
- **Colors**: Pure black/white with zero chroma — every color value in `globals.css` has chroma `0` (neutral gray scale). The only exceptions are the chart colors, which are a single-family blue monochrome, and the hard-coded `#10b981` green / `#f43f5e` red / `#6366f1` indigo in the balance history chart. These are not coordinated. They were picked ad hoc.
- **Cards**: Default shadcn cards with a `1px` border and no depth. They sit flat. Nothing separates them from the page except a thin line.
- **Radius**: `--radius: 0.625rem` (10px). Competent but not memorable.
- **Sidebar**: Plain white/near-white background, active item is `primary/10` tint (10% black). Looks like a default template.
- **Copy**: "Dashboard — Your financial overview at a glance." That is a placeholder line. "No data yet" and "No expenses yet" are dismissive. "Not set" for income is passive. The page header title is literally "Dashboard."

This is a solid functional foundation. The rebrand is about layering identity on top of it — the product already works, it just does not feel like anything yet.

---

## 1. Brand Personality

**Five adjectives:**
- Grounded
- Precise
- Quietly confident
- Warm
- Global

**One-line brand statement:**

> PocketPilot gives you a clear, calm view of your money — wherever in the world it lives.

**What this means in practice:**
PocketPilot is not anxious fintech. It does not scream urgency or gamify guilt. It is the financial equivalent of a well-designed notebook: structured, intentional, satisfying to use. It respects that money across currencies is complex, and it makes that complexity feel handled — not hidden, not overwhelming.

The tone is like a knowledgeable friend who happens to be great with money. Direct, never condescending. Human, never casual to the point of losing credibility.

---

## 2. Font Pairing

### Heading font: "DM Serif Display"
Google Fonts URL: `https://fonts.google.com/specimen/DM+Serif+Display`

**Why:** DM Serif Display has editorial weight — it looks like the kind of number you would see in a well-produced financial report or a premium banking app. The contrast between its thick and thin strokes gives the large currency figures on the dashboard genuine presence. It is modern (designed 2018) but not trendy. When someone sees `$4,200.00` rendered in DM Serif Display at 32px bold, it feels like that number matters. That is the feeling we want.

Use DM Serif Display for:
- Large monetary values (the hero numbers in summary cards)
- Section headings in the page header (`h1`)
- The PocketPilot wordmark in the sidebar

### Body font: "Inter"
Google Fonts URL: `https://fonts.google.com/specimen/Inter`

**Why:** Inter is the gold standard for UI readability at small sizes. It is optimized for screens at every density. It handles tabular numbers well (use `font-variant-numeric: tabular-nums` on all money figures in tables and lists). It has excellent character set coverage for international currencies. It replaces Geist Sans, which is functionally similar but lacks the warmth and the broader community of proven use in finance products.

Use Inter for:
- All body copy, labels, muted text
- Navigation items
- Form inputs
- Chart tooltips and legends
- Card subtitles

**Variable font setup for Carlos:**
```
next/font/google imports:
- DM_Serif_Display: weight 400, subsets latin
- Inter: weight [400, 500, 600, 700], subsets latin, display swap
```

---

## 3. Color Palette

The current palette has no hue. Everything is achromatic. The result is a UI that looks like it has not loaded its brand assets yet. The new palette uses a deep teal-green as its anchor — it reads as trustworthy, mature, and international without being cold like blue or aggressive like green-green.

### Light Mode

| Role | Token name | Hex | Description |
|---|---|---|---|
| Background | `--background` | `#F7F8F6` | Warm off-white, not pure white. Reduces eye strain and makes cards pop. |
| Surface (card) | `--card` | `#FFFFFF` | Pure white cards sit on the warm background with visible lift. |
| Border | `--border` | `#E4E7E4` | Slightly warm gray-green. Cohesive with the palette. |
| Primary | `--primary` | `#1A6B5C` | Deep teal-green. The main action color, sidebar active state, buttons. |
| Primary foreground | `--primary-foreground` | `#FFFFFF` | White text on primary. |
| Secondary | `--secondary` | `#EEF4F2` | Very light teal tint. Hover states, secondary buttons, pill backgrounds. |
| Secondary foreground | `--secondary-foreground` | `#1A6B5C` | Primary text on secondary. |
| Accent | `--accent` | `#D4A853` | Warm gold. Used sparingly: highlights, income indicators, "positive" signals. |
| Accent foreground | `--accent-foreground` | `#3D2800` | Dark brown on gold. |
| Muted | `--muted` | `#F0F2F0` | Neutral light gray for skeleton loaders, inactive chips. |
| Muted foreground | `--muted-foreground` | `#6B7A74` | Warm gray for secondary labels and descriptions. |
| Foreground | `--foreground` | `#111D1A` | Near-black with a green undertone. Softer than pure black. |
| Destructive | `--destructive` | `#C0392B` | Classic confident red. For over-budget, errors, deletes. |
| Ring | `--ring` | `#1A6B5C` | Focus rings match primary. |

### Dark Mode

| Role | Token name | Hex | Description |
|---|---|---|---|
| Background | `--background` | `#0E1512` | Very deep teal-black. Not pure black — has warmth from the green undertone. |
| Surface (card) | `--card` | `#172019` | Slightly lighter than background. Cards have subtle lift. |
| Border | `--border` | `#243028` | Barely-visible dark teal border. |
| Primary | `--primary` | `#3EC9A7` | Bright mint-teal. Vibrant against the dark background, passes contrast. |
| Primary foreground | `--primary-foreground` | `#0E1512` | Dark background color as text on primary. |
| Secondary | `--secondary` | `#1E2D28` | Dark teal surface for secondary actions. |
| Secondary foreground | `--secondary-foreground` | `#C8E8E0` | Light mint for text on secondary. |
| Accent | `--accent` | `#E8B84B` | Gold stays warm in dark mode, slightly brighter. |
| Accent foreground | `--accent-foreground` | `#1A0F00` | Very dark brown on gold. |
| Muted | `--muted` | `#1C2822` | Dark muted surface for skeleton loaders. |
| Muted foreground | `--muted-foreground` | `#7A9E95` | Muted teal-gray for secondary labels. |
| Foreground | `--foreground` | `#E8F0EE` | Off-white with a mint cast. Never harsh. |
| Destructive | `--destructive` | `#E05C4B` | Brighter red for dark mode visibility. |
| Ring | `--ring` | `#3EC9A7` | Focus rings match primary. |

### Chart Colors (replace the all-blue monochrome)

These are coordinated with the brand palette and work in both light and dark mode:

| Chart slot | Hex | Use |
|---|---|---|
| `--chart-1` | `#1A6B5C` | Primary teal (largest category bar) |
| `--chart-2` | `#D4A853` | Gold (second category) |
| `--chart-3` | `#E87040` | Warm orange (third category) |
| `--chart-4` | `#7B5EA7` | Muted purple (fourth category) |
| `--chart-5` | `#3C8DAD` | Steel blue (fifth category) |

Income bar: `#3EC9A7` (mint, reads "positive")
Expenses bar: `#E05C4B` (warm red, reads "cost")
Balance line: `#D4A853` (gold, reads "value")

These five chart colors are distinct, non-clashing, and together suggest a global palette — not the default Material blue family.

### Sidebar
```
--sidebar: #0F1A17  (dark mode) / #F2F5F4  (light mode)
--sidebar-primary: #3EC9A7  (dark) / #1A6B5C  (light)
--sidebar-accent: #1E2D28  (dark) / #E8F0EE  (light)
```

---

## 4. Copy Improvements

### Page Header

| Location | Before | After |
|---|---|---|
| Dashboard `h1` | `Dashboard` | `Your Money, This Month` |
| Dashboard description | `Your financial overview at a glance.` | `A clear picture of where your money went — and what is left.` |
| Page `<title>` in layout | `PocketPilot` | `PocketPilot — Your Multi-Currency Finance Tracker` |
| Page meta description | `Track your expenses, manage recurring costs, and stay on top of your finances.` | `Track spending across currencies, set your monthly income, and always know where you stand.` |

### Summary Card Labels

| Card | Before | After | Rationale |
|---|---|---|---|
| Spending card label | `Total Spent` | `Spent This Month` | More conversational and specific — removes ambiguity about the time period. |
| Income card label | `Monthly Income` | `Income This Month` | Parallel phrasing with the spending card — they now read as a pair. |
| Balance card label | `Balance` | `Left to Spend` | This is more concrete. "Balance" sounds like a bank balance; "Left to Spend" tells you its purpose immediately. |
| Count card label | `Expenses` | `Transactions` | More accurate (includes any logged entry) and less loaded than "expenses." |
| Count card subline | `this month` | `logged this month` | Small specificity win — "logged" makes it feel active. |

### Income Card States

| State | Before | After | Rationale |
|---|---|---|---|
| No income set, display | `Not set` | `No income added yet` | Passive "Not set" feels like a missing config. "No income added yet" is an invitation. |
| No income set, CTA link | `+ Add income` | `Add your monthly income` | Written out, it is clearer what happens when you click. |
| Balance positive subline | `saved this month` | `ahead of spending` | More precise — you have not necessarily "saved" it yet, but you are ahead. |
| Balance negative subline | `over budget` | `over your income` | More accurate: this compares against income, not a budget target. |

### Exchange Rate Card

| Element | Before | After | Rationale |
|---|---|---|---|
| Card title | `USD → UYU Exchange Rate` | `Live Exchange Rate` | The specific currencies are already shown in the card body. The title should be conceptual, not a repetition of data. |
| Buy rate label | `Buy (Compra)` | `Buy rate` | English-only for clarity; the Spanish is redundant in a UI that is otherwise fully in English. |
| Sell rate label | `Sell (Venta)` | `Sell rate` | Same reasoning. |
| Conversion equivalent label | `Conversion` | `Quick reference` | "Conversion" is too formal for a single-line rate display. |
| Fallback rate notice | `Using default rate — live API unavailable.` | `Showing an estimated rate. Live data is temporarily unavailable.` | "Default rate" is internal language. Users do not know what a default rate is. |

### Chart Card

| Element | Before | After |
|---|---|---|
| Chart card title | `Spending by Category` | `Where Your Money Went` |
| Chart type label: `Horizontal Bar` | `Horizontal Bar` | `By Amount` |
| Chart type label: `Pie` | `Pie` | `Share of Spending` |
| Chart type label: `Line` | `Line` | `By Category Trend` |

The chart type labels are shown in the carousel navigation between chevrons. Renaming them from chart-geometry terms ("Horizontal Bar") to what-they-show terms ("By Amount") makes the choice feel meaningful to a non-technical user.

### Recent Expenses Card

| Element | Before | After |
|---|---|---|
| Card title | `Recent Expenses` | `Latest Transactions` |

"Expenses" is a loaded word that implies cost and obligation. "Transactions" is neutral and accurate.

### Balance History Card

| Element | Before | After |
|---|---|---|
| Card title | `Balance History` | `Income vs. Spending Over Time` |

"Balance History" is technically correct but abstract. The new name tells you exactly what the chart compares.

### Recurring Expenses Card

| Element | Before | After |
|---|---|---|
| Card title | `Recurring Expenses` | `Fixed Monthly Costs` |

"Recurring Expenses" is feature-name language from the data model. "Fixed Monthly Costs" is how a person thinks about it.

### Empty States

| Location | Before title | After title | Before description | After description |
|---|---|---|---|---|
| Chart — no data | `No data yet` | `Nothing to chart yet` | `Add expenses to see your spending breakdown.` | `Once you log a few transactions, your spending breakdown will appear here.` |
| Recent expenses — empty | `No expenses yet` | `No transactions logged` | `Start tracking your spending.` | `Add your first transaction and it will show up here instantly.` |
| Balance history — empty | `No history yet` | `Your history starts here` | `Set your monthly income and add expenses to see the balance history.` | `Add your income for this month and start logging transactions — your trends will build automatically.` |
| Recurring — empty | `No recurring expenses` | `No fixed costs set up` | `Set up recurring expenses to track fixed monthly costs.` | `Add a recurring cost — like rent, subscriptions, or a gym membership — and it will always be visible here.` |

### Sidebar Navigation Labels

The navigation labels are fine, with one exception:

| Before | After | Rationale |
|---|---|---|
| `Dashboard` (sidebar) | `Overview` | In the sidebar, "Dashboard" is redundant meta-language — you are already on the app. "Overview" is what the page actually gives you. The mobile nav label of "Home" can remain. |

---

## 5. Component Mood Board

### Cards

**Shape:** Increase the base radius to `--radius: 0.875rem` (14px). Cards should feel rounded without being bubbly. At this radius they look intentionally designed, not default.

**Depth — light mode:** Remove the flat border-only approach. Use a layered shadow system:
- Standard card: `box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` — a whisper of shadow that lifts the card off the warm background.
- Hover state on interactive cards: `box-shadow: 0 4px 12px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.06)` — a clear but not dramatic lift.
- Keep the `1px` border in addition to shadow. The border reads as structure; the shadow reads as elevation.

**Depth — dark mode:** In dark mode, depth comes from background color differences, not shadows (shadows disappear against dark backgrounds). The card (`#172019`) sitting on the background (`#0E1512`) creates enough contrast. Add an extremely subtle inner highlight: `border: 1px solid rgba(255,255,255,0.06)` — this gives a slight frosted-glass quality without the full glassmorphism treatment.

**Glassmorphism — use only for the mobile nav bar.** The mobile nav already has `backdrop-blur-sm` which is the right call. Do not use glassmorphism on content cards — it creates legibility problems and slows render performance.

**Summary cards (the 4-up grid):** These are the most-read elements on the page. Treat them differently from content cards:
- Add a thin `3px` top border in the primary color (`#1A6B5C` light / `#3EC9A7` dark) — this is a common pattern in financial dashboards that signals "this is a key metric."
- The balance card when positive should tint the top border with accent gold (`#D4A853`). When negative, use the destructive red. This gives immediate visual feedback without being alarming.

### Numbers — Large Financial Figures

The hero numbers in the summary cards (Total Spent, Income, Balance) need to be the visual anchors of the page. Carlos should apply:

- Font: DM Serif Display, 28px on desktop, 22px on mobile
- Letter-spacing: `-0.02em` (slightly tight — financial figures feel more authoritative condensed)
- `font-variant-numeric: tabular-nums` — so digits align cleanly when scanning
- Color: `--foreground` for neutral figures, `--primary` for active/positive balance, `--destructive` for negative balance

The count card (Transactions) is different — it is an integer, not a money value. It should use Inter 700, 28px. It does not need DM Serif Display.

### Charts

**Bar chart:** Bars should be rounder — `radius={[4, 4, 0, 0]}` on top corners is correct (already in the code for the balance history chart). Apply the same to the horizontal category bar: `radius={[0, 6, 6, 0]}`.

**Grid lines:** Use `strokeDasharray="4 2"` (short dashes) and reduce opacity to `0.3`. The current grid lines are too prominent — they compete with the data.

**Tooltip:** Increase border-radius to `12px`. Add a subtle box-shadow. Use a slightly larger font size (`13px`). The tooltip is where users get precise numbers — it should feel polished, not like a browser default.

**Pie chart:** Increase the inner radius proportion (`innerRadius={40}` vs the current `innerRadius={30}`) to strengthen the donut shape. Add a center label showing the total — this makes the donut feel more informative and less decorative.

**Line stroke:** Increase `strokeWidth` from `2` to `2.5`. Use the primary color (`#1A6B5C` / `#3EC9A7`) for balance lines — currently a hard-coded `#6366f1` indigo that is off-brand.

**Background fill under the line chart:** Add a subtle gradient fill under the balance line in the history chart (using Recharts `Area` instead of or in addition to `Line`). This visually communicates "this is the trend that matters."

### Navigation — Sidebar (Desktop)

**Logo area:** Replace the generic Wallet icon with something more distinctive. Suggestion: a compass rose or airplane instrument icon would tie into the "Pilot" metaphor. If staying with Wallet, give the icon container a gradient background — `linear-gradient(135deg, #1A6B5C, #2A9D8F)` — rather than a flat `bg-primary`.

**Active nav item:** The current `bg-primary/10 text-primary` is too subtle on light backgrounds. Use:
- Light mode: `bg-primary text-primary-foreground` with `rounded-lg` — a solid filled pill. This is clear and confident.
- Dark mode: `bg-sidebar-accent text-primary` with a `2px` left border in the primary color. This is the standard "focused row" treatment for dark sidebars.

**Nav label for "Overview":** Apply the copy change defined in Section 4.

**Sidebar background:** Give the sidebar a very slight texture distinction from the main content area. In light mode: `#F2F5F4` (a fraction warmer and darker than the main `#F7F8F6`). In dark mode: `#0F1A17` (same depth as content background — the border separates them).

### Navigation — Mobile Bottom Bar

Keep the `backdrop-blur-sm` and the glass effect. Add one improvement: the active icon should have a small pill-shaped background chip behind it (not the whole tab — just behind the icon, like a floating badge). This is the modern iOS/Android pattern and immediately communicates which tab is selected without relying on color alone.

### Loading Skeletons

The current skeleton uses `bg-muted` which in the new palette is `#F0F2F0` (light) / `#1C2822` (dark). That is fine. Increase the pulse animation to be slightly slower — the default Tailwind `animate-pulse` at 2s is acceptable, but 2.5s feels calmer and less anxious, which suits the brand personality.

### Recurring Expense Tiles

The recurring expense cards (the mini tiles at the bottom of the dashboard) are currently `border border-border` boxes — completely flat. Apply the same card treatment as the summary cards: `rounded-xl`, `shadow-sm`, and the `3px` top border in the category color. This makes the recurring costs section feel like a distinct, curated block, not a list of bordered divs.

---

## Summary for Carlos

**The three highest-impact changes, in order:**

1. **Font swap** — DM Serif Display for the large numbers and page titles. This single change does the most work. The numbers will immediately feel authoritative.

2. **Color palette** — Apply the new CSS variables to `globals.css`. The teal-green primary eliminates the achromatic nothingness of the current palette in 30 lines of CSS.

3. **Summary card top borders** — The `3px` top-border treatment on the 4-up summary cards creates instant visual hierarchy and makes the dashboard feel like a financial product.

Everything else in this document is correct and should be implemented, but those three will transform the first impression.

---

## Files Carlos will need to touch

- `src/app/globals.css` — all color tokens, radius, font variables
- `src/app/layout.tsx` — font imports (add DM Serif Display, replace Geist with Inter)
- `src/components/dashboard/dashboard-content.tsx` — all copy changes, chart color updates, DM Serif classnames on money figures
- `src/components/layout/page-header.tsx` — heading font class, size update
- `src/components/layout/sidebar.tsx` — active state styles, logo treatment, "Overview" label
- `src/components/layout/mobile-nav.tsx` — active icon chip treatment
- `src/components/shared/empty-state.tsx` — copy is passed as props, so the source-of-truth changes are in `dashboard-content.tsx`
- `src/components/shared/loading-skeleton.tsx` — pulse duration tweak
