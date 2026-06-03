---
name: JAZ Design System
description: The Sovereign Zone Meridian visual language for Joint Annual Zone.
colors:
  primary: "#8B0000"
  primary-hover: "#6B0000"
  accent-green: "#16a34a"
  neutral-bg: "#ffffff"
  neutral-fg: "#0f172a"
  neutral-navy-dark: "#0b1426"
  neutral-navy-light: "#f5f7fa"
  border: "rgba(15, 23, 42, 0.1)"
typography:
  display:
    fontFamily: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', var(--font-ibm-plex-sans-arabic), 'IBM Plex Sans Arabic', sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 900
    lineHeight: "1.2"
  body:
    fontFamily: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', var(--font-ibm-plex-sans-arabic), 'IBM Plex Sans Arabic', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.7"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# Design System: JAZ Event Management Platform

## 1. Overview

**Creative North Star: "The Sovereign Zone Meridian"**

The Sovereign Zone Meridian is the visual system guiding JAZ (Joint Annual Zone). Designed for absolute professional credibility, it commands power, global connectivity, and prestigious exclusivity. The aesthetic merges the serious, institutional presence of official Iraqi governance with high-end modern interactivity, rejecting cheap startup hype and flat corporate layouts.

The layout density is generous yet structured. Whitespace is active, and sections feel distinct, breathing through carefully calculated spacing steps. We avoid decorative clutter like floating background blobs or unnecessary borders, utilizing clean high-contrast boundaries instead.

**Key Characteristics:**
- **Executive Gravity:** Deep navy darks (#0b1426) and pure whites (#ffffff) paired with an authoritative deep red (#8B0000) primary color.
- **Rhythmic Contrast:** Wide content zones separated by wide gaps, highlighting the importance of the text content.
- **Atmospheric Interactivity:** Subtle, custom animations and dynamic elements (such as the 3D globe) that communicate real, live global actions.

---

## 2. Colors

JAZ uses an executive, restrained color strategy. Highly saturated hues are strictly locked down to maintain official dignity.

### Primary
- **Iraqi Sovereign Red** (#8B0000 / oklch(0.205 0 0)): Used specifically for primary CTAs, major structural highlights, and active Iraqi event markers. It is never used decoratively.
- **Sovereign Crimson Hover** (#6B0000 / oklch(0.165 0 0)): Darker crimson shift for primary button active states.

### Secondary
- **International Emerald Green** (#16a34a / oklch(0.60 0.17 142)): Applied exclusively to global markers, international events, and active success/verified tags.

### Neutral
- **Deep Obsidian Navy** (#0b1426 / oklch(0.145 0 0)): Used for major background zones, core typography, and structural containers.
- **Pristine White** (#ffffff / oklch(1 0 0)): The background container default, tinted minimally to maintain absolute crispness.
- **Muted Platinum** (#f5f7fa / oklch(0.97 0 0)): Secondary panel backing to separate information grids.

### Named Rules
**The 10% Sovereignty Rule.** The primary red accent is used on ≤10% of any screen. Its rarity is what commands respect and indicates official priority.
**The Brand Tint Rule.** Pure greys are forbidden. Every grey shade must be tinted toward the obsidian brand hue (chroma 0.005–0.01) to keep layouts coherent.

---

## 3. Typography

JAZ features a bespoke bilingual system designed to keep layouts visually balanced in both Arabic and English.

**Display Font:** Plus Jakarta Sans (Latin fallback) & IBM Plex Sans Arabic (Arabic primary)
**Body Font:** Plus Jakarta Sans & IBM Plex Sans Arabic

**Character:** A high-contrast sans-serif pairing. Bold geometric letterforms in English align smoothly with the highly legible, geometric structure of IBM Plex Sans Arabic, creating a unified premium presence.

### Hierarchy
- **Display** (900, clamp(2rem, 5vw, 3.5rem), 1.2): Reserved for hero section titles and sector page headlines.
- **Headline** (800, 2rem, 1.3): Page headers and section banners.
- **Title** (700, 1.25rem, 1.4): Card and event title headers.
- **Body** (400, 1rem, 1.7): General copy and descriptions. Max line length is constrained to 70ch for premium readability.
- **Label** (600, 0.75rem, 1.15, uppercase): System indicators, metadata tabs, and tags.

### Named Rules
**The Dual-Tongue Alignment Rule.** Translation containers must be double-checked for height parity. Line heights for Arabic are set to 1.7 to prevent descenders from clipping, while English is set to 1.6.

---

## 4. Elevation

JAZ utilizes a hybrid elevation model. Surfaces are flat at rest, relying on subtle, low-chroma borders (1px border, rgba(15, 23, 42, 0.1)) to partition data. Depth is layered and responsive, appearing only as an interactive reaction to state changes.

### Shadow Vocabulary
- **Ambient Focus** (`box-shadow: 0 4px 24px rgba(139, 0, 0, 0.08)`): Applied under active buttons or focused input panels to represent state reactions.
- **Tactile Lift** (`box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04)`): Interactive lift on cards during hover states.

### Named Rules
**The Flat-Rest Doctrine.** No element is allowed to float with deep shadows at rest. Depth is a dynamic response to user input, keeping screens crisp and uncluttered.

---

## 5. Components

### Buttons
- **Shape:** Softly curved corners (6px radius).
- **Primary:** Iraqi Sovereign Red (#8B0000), white text, 12px 24px padding.
- **Hover/Focus:** Transitions smoothly to Sovereign Crimson Hover (#6B0000) using a 200ms ease-out curve.

### Cards / Containers
- **Corner Style:** Rounded (10px radius, calc(var(--radius) - 2px)).
- **Background:** Crisp white (#ffffff) or muted platinum (#f5f7fa) surfaces.
- **Border:** Scoped to a 1px solid slate border with 10% opacity.

### Inputs / Fields
- **Style:** 1px boundary stroke, pristine white background, 6px radius.
- **Focus:** Highlighted with a 1.5px Sovereign Red ring and a subtle deep red shadow glow.

---

## 6. Do's and Don'ts

### Do:
- **Do** maintain a strict 70ch line limit for all body copy to ensure clear readability.
- **Do** test both LTR and RTL alignments when modifying templates.
- **Do** rely on font weights (bold vs. regular) for hierarchy rather than using different colors.
- **Do** keep interactive elements inside semantic, accessible markup containers with aria-labels.

### Don't:
- **Don't** use decorative side-stripe card borders (e.g., border-left-4 red lines). It is a major AI-slop anti-reference.
- **Don't** use text gradients (`background-clip: text`) on display headers. Focus on pure solid colors.
- **Don't** nest cards within other cards. Strip layout complexity and use simple layout gaps instead.
- **Don't** apply floating dark shadows to static cards at rest. Keep them flat.
