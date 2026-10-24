# Bugfix Requirements Document

## Introduction

The algmed platform has broken layout and bad spacing when viewed on phone/mobile viewports (width < 768px). The issues affect three main pages: the landing page (Home), the user dashboard (DashboardPage), and the admin dashboard (Dashboard). The root causes include excessive padding values not reduced for small screens, duplicate conflicting CSS rules in Home.css, module carousel cards overflowing the viewport width causing horizontal scroll, a floating user menu bar that is too wide for narrow phone screens, mixed CSS systems (Tailwind utility classes and custom CSS variables) causing inconsistent rendering of the dashboard right panel, and insufficient responsive breakpoints for very small phone screens (< 480px). The fix must ensure all three pages render with appropriate spacing, no horizontal overflow, and readable content at phone viewport widths without altering the desktop/tablet layout.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the viewport width is less than 768px (phone view) THEN the landing page sections display excessive vertical padding and spacing (e.g., section headings retain 88px top padding, hero retains 64px top padding, sections retain 80px-96px bottom padding) creating large empty gaps and poor content density

1.2 WHEN the viewport width is less than 768px THEN the landing page Home.css applies two conflicting sets of CSS rules for the same selectors (original rules and "LANDING REBUILD" rules), causing the original responsive border overrides (e.g., border-right: none, border-bottom on .landing-strip-item at 860px) to conflict with the rebuilt full-border card styling, producing inconsistent visual appearance

1.3 WHEN the viewport width is less than 600px THEN the user dashboard module carousel cards use `flex: 0 0 clamp(160px, calc((100% - 32px) / 3), 220px)` which sets a 160px minimum card width, causing the total width of 3 cards plus gaps to exceed the container width and trigger horizontal scrolling

1.4 WHEN the viewport width is less than 480px THEN the user dashboard right panel renders with inconsistent styling because it mixes Tailwind utility classes (e.g., bg-surface, text-ink, border-line, bg-brand/70, bg-accent) with custom CSS variables from teal-theme.css, and the Tailwind @theme color tokens are defined for dark mode defaults that may not match the active theme, resulting in cards with mismatched or missing background colors and text colors

1.5 WHEN the viewport width is less than 768px THEN the user dashboard floating menu bar (UserMenu) contains up to 11 icon buttons totaling approximately 500px in width, but the max-width constraint limits it to approximately 287px on a 375px screen, forcing horizontal scrolling within the menu bar and making it difficult to access all navigation items

1.6 WHEN the viewport width is less than 768px THEN the admin dashboard (Dashboard.jsx) only has a single responsive breakpoint at 768px with no adjustments for screens smaller than 480px, leaving stat card font sizes at 1.5rem and chart min-widths at 300px which are too large for very small phone screens, causing cramped layouts and potential overflow

1.7 WHEN the viewport width is less than 768px THEN the landing page footer uses a flexbox row layout (`flex-direction: row` with `flex-wrap: wrap`) at the 860px breakpoint but the footer brand block, links, and copyright are not properly stacked for very narrow screens, causing cramped horizontal spacing

1.8 WHEN the viewport width is less than 480px THEN the landing page has no responsive breakpoint adjustments for very small phone screens (320px-375px), leaving font sizes, paddings, and grid gaps at values designed for 480px+ screens, resulting in oversized text and cramped element spacing

### Expected Behavior (Correct)

2.1 WHEN the viewport width is less than 768px THEN the system SHALL display landing page sections with reduced vertical padding (section headings no more than 40px top padding, hero no more than 32px top padding, section bottom padding no more than 48px) appropriate for phone screens without creating large empty gaps

2.2 WHEN the viewport width is less than 768px THEN the system SHALL resolve conflicting CSS rules in Home.css by ensuring the "LANDING REBUILD" responsive rules take precedence over the original rules for the same selectors, producing consistent visual appearance for landing strip items, grids, and other shared selectors

2.3 WHEN the viewport width is less than 600px THEN the system SHALL constrain module carousel cards to a width that fits within the container without horizontal scrolling, by reducing the minimum card width or switching to a single-column or two-column layout appropriate for the viewport

2.4 WHEN the viewport width is less than 480px THEN the system SHALL render the user dashboard right panel with consistent styling by ensuring Tailwind utility class color tokens (bg-surface, text-ink, border-line, bg-brand/70, bg-accent) resolve to values that match the active theme, or by replacing the Tailwind utility classes with custom CSS classes using the existing CSS variable system

2.5 WHEN the viewport width is less than 768px THEN the system SHALL ensure the user dashboard floating menu bar either wraps its icon buttons to multiple rows or reduces the number of visible items so that all navigation buttons are accessible without horizontal scrolling within the menu bar

2.6 WHEN the viewport width is less than 480px THEN the system SHALL apply additional responsive adjustments to the admin dashboard including reduced stat card font sizes (no more than 1.2rem for values, no more than 0.9rem for labels) and reduced chart min-widths so that content fits within the viewport without overflow

2.7 WHEN the viewport width is less than 768px THEN the system SHALL stack the landing page footer elements vertically (brand block, links, copyright) with appropriate spacing for phone screens

2.8 WHEN the viewport width is less than 480px THEN the system SHALL apply a responsive breakpoint for very small phone screens that reduces font sizes, paddings, and grid gaps to values appropriate for 320px-375px width screens

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the viewport width is 768px or greater THEN the system SHALL CONTINUE TO display all pages with their existing desktop/tablet layout, padding values, and spacing

3.2 WHEN the viewport width is 768px or greater THEN the system SHALL CONTINUE TO render the landing page with the two-column hero grid, three-column feature strip, and two-column FAQ layout

3.3 WHEN the viewport width is 768px or greater THEN the system SHALL CONTINUE TO render the user dashboard with the two-column workspace (content stream + right panel at 300px width)

3.4 WHEN the viewport width is 768px or greater THEN the system SHALL CONTINUE TO render the admin dashboard with the sidebar layout and stat card grid using auto-fit minmax(200px, 1fr)

3.5 WHEN the viewport width is between 768px and 1200px THEN the system SHALL CONTINUE TO render the user dashboard workspace as a single column with the right panel below the content stream

3.6 WHEN the viewport width is between 600px and 768px THEN the system SHALL CONTINUE TO render the user dashboard hero section as a column layout with centered text and the module carousel with the existing aspect ratio of 8/5

3.7 WHEN the user navigates the landing page mobile menu (hamburger toggle) on phone view THEN the system SHALL CONTINUE TO open the slide-out navigation drawer from the right side with the existing backdrop and scroll-lock behavior

3.8 WHEN the admin sidebar is toggled open or closed on phone view THEN the system SHALL CONTINUE TO apply the `margin-left: 0 !important` override so that the page content is not pushed by the sidebar width