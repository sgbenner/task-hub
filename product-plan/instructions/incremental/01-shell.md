# Milestone 1: Shell

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Set up the design tokens and application shell — the persistent chrome that wraps all sections.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind color usage examples
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Summary:**
- Primary: `indigo` — buttons, links, active states
- Secondary: `amber` — tags, highlights, badges
- Neutral: `stone` — backgrounds, text, borders
- Fonts: Inter (heading + body), JetBrains Mono (code)

### 2. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper (fixed top nav + content area)
- `MainNav.tsx` — Desktop nav links + mobile hamburger
- `UserMenu.tsx` — Avatar dropdown with sign out

**Wire Up Navigation:**

The shell accepts a `navigationItems` array. Set `isActive` based on the current route:

```tsx
<AppShell
  navigationItems={[
    { label: 'Tasks', href: '/tasks', isActive: pathname === '/tasks' },
    { label: 'Goals', href: '/goals', isActive: pathname === '/goals' },
  ]}
  user={{ name: currentUser.name, avatarUrl: currentUser.avatarUrl }}
  onNavigate={(href) => router.push(href)}
  onLogout={() => signOut()}
>
  {children}
</AppShell>
```

**User Menu:**

The user menu expects:
- `user.name` — Display name (used for initials fallback if no avatar)
- `user.avatarUrl` — Optional avatar image URL
- `onLogout` — Called when user clicks "Sign out"

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/shell/README.md` — Shell design intent and wiring guide
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured (colors + fonts)
- [ ] Shell renders with top navigation bar
- [ ] "Tasks" and "Goals" nav links navigate to correct routes
- [ ] Active nav item shows indigo highlight
- [ ] User menu shows user name and avatar (or initials)
- [ ] "Sign out" in user menu triggers logout
- [ ] Hamburger menu works on mobile
- [ ] Content area renders children below the fixed header
