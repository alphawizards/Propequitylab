# UI Design Implementation Plan: "Lime & Wealth" Theme

**Goal**: Redesign the PropEquityLab dashboard to match the provided "WealthPlan Pro" reference image.
**Visual Style**: Modern, high-contrast, "Lime Green" accents, clean white cards on soft gray background. 3-Column Layout.

---

## 🎨 1. Design System & Theme

### Color Palette
Refining `tailwind.config.js` to match the reference:
*   **Primary (Brand)**: `#10B981` (Emerald Green) - *Used for primary buttons, active states, accents.*
*   **Primary Foreground**: `#FFFFFF` (White) - *Text on emerald buttons.*
*   **Background**: `#F6F7F9` (Light Blue-Gray) - *App background.*
*   **Card Surface**: `#FFFFFF` (White) - *Cards and main containers.*
*   **Text Main**: `#111827` (Gray 900) - *Headings.*
*   **Text Muted**: `#6B7280` (Gray 500) - *Secondary text.*
*   **KPI Backgrounds**:
    *   Blue Tint: `#EBF5FF`
    *   Green Tint: `#F0FDF4`
    *   Purple Tint: `#F3E8FF`
    *   Yellow Tint: `#FEFCE8`

### Typography
*   **Font**: Inter or Plus Jakarta Sans.
*   **Headings**: Bold, tight tracking.
*   **Numbers**: Monospace or tabular nums for financial data.

---

## 🏗 2. Layout Architecture (3-Column)

The reference uses a specific layout different from our current 2-column one.

**Structure**:
1.  **Sidebar (Left - 260px)**: Navigation, Confidence Score, CTA.
2.  **Main Content (Center - Fluid)**: KPI Cards, Charts, Snapshots.
3.  **Right Panel (Right - 320px)**: Scenarios, Sliders, Export.

**Implementation Strategy**:
*   Modify `MainLayout.jsx` to support an optional `RightPanel` slot.
*   Use CSS Grid or Flexbox: `flex h-screen bg-[#F6F7F9]`.

---

## 🛠 3. Component Breakdown

### A. Sidebar (`Sidebar.jsx`)
*   **Header**: Logo "PropEquityLab" (replacing WealthPlan Pro).
*   **Navigation**:
    *   Active state: Full lime background (`bg-[#D9F848]`) with black text.
    *   Inactive state: Translucent gray hover.
    *   Sections: Main Menu, Reports.
*   **New Widgets**:
    *   **Confidence Score**: Card at bottom left with circular progress or bar (84% HIGH).
    *   **New Projection Button**: Large, full-width Lime button at bottom.

### B. Header (`Header.jsx`)
*   **Search Bar**: Large, pill-shaped light gray input.
*   **Actions**: Settings Cog, Notification Bell (Circle backgrounds).
*   **Profile**: Avatar with Name and "Premium Plan" badge.

### C. Main Dashboard Area (`DashboardNew.jsx`)
*   **Header Section**: Breadcrumbs, Title "Main Projection Dashboard", Time toggle (40Y/20Y/10Y).
*   **KPI Row**: 4 cards.
    *   *Features*: Icon + Label + Big Number + Subtext.
    *   *Styling*: Subtle pastel backgrounds for distinctiveness.
*   **Chart Section**:
    *   Title: "Net Worth Projection".
    *   Chart: Recharts AreaChart.
    *   Gradient Fill: Lime fade.
    *   Reference Lines: "Liquid Assets" vs "Property Equity".
*   **Bottom Widgets (3 Columns)**:
    *   **Portfolio Snapshot**: Simple list of values.
    *   **Property Cashflows**: "Self-Servicing" badge, red/green text for values.
    *   **Borrowing**: LVR progress bars or text stats.

### D. Right Panel (`DashboardRightPanel.jsx` - New!)
*   **Scenario List**:
    *   Card-like radio buttons ("Baseline", "Early Retire", "Property Growth").
    *   Selection state: Thick lime border.
*   **Quick Settings**:
    *   Sliders for "Annual Inflation" and "Property Growth".
    *   Use `shadcn/ui` Slider component colored Lime.
*   **Export**: Black button "Export PDF Report" at bottom.

---

## 🚀 4. Implementation Steps

### Step 1: Foundation (Config)
1.  Update `tailwind.config.js` with new colors (Lime, Pastels).
2.  Set `index.css` body background to `#F6F7F9`.

### Step 2: Layout Restructuring
1.  Create `DashboardLayout.jsx` (or update `MainLayout`) to accept a "Right Sidebar".
2.  Update `Sidebar.jsx` styling to match reference (Lime active states).

### Step 3: Dashboard Components
1.  Build `KPICard` component (accepts color variant).
2.  Build `DashboardChart` (Recharts with specific styling).
3.  Build `InfoWidget` (for bottom 3 cards).

### Step 4: Right Panel
1.  Create `ScenarioSelector` component.
2.  Create `QuickSettings` component (Sliders).

### Step 5: Integration
1.  Assemble everything in `DashboardNew.jsx`.

---

## 📦 Required Dependencies
*   `lucide-react` (Icons)
*   `recharts` (Existing)
*   `framer-motion` (For smooth transitions)
*   `clsx` / `tailwind-merge` (Standard)
