# Application Shell

## Overview

TaskHub uses a **fixed top navigation bar** with the app logo on the left, navigation links in the center-left, and the user menu on the right. Content renders below in a `max-w-5xl` centered container.

## Navigation Structure

- **Tasks** → `/tasks` (default/home view)
- **Goals** → `/goals`

## Design Intent

- Header is fixed — it stays visible while content scrolls
- Active nav item shows an indigo underline accent
- User avatar uses indigo background for initials fallback
- Mobile: nav links collapse into a hamburger menu dropdown
- Stone neutrals for the header; warm and clean

## Components Provided

- `AppShell` — Main layout wrapper; accepts `children`, `navigationItems`, `user`, and callbacks
- `MainNav` — Desktop nav + mobile hamburger; renders nav buttons
- `UserMenu` — Avatar dropdown with "Sign out" action

## Wiring It Up

```tsx
import { AppShell } from './shell/components'

// In your router layout:
<AppShell
  navigationItems={[
    { label: 'Tasks', href: '/tasks', isActive: pathname === '/tasks' },
    { label: 'Goals', href: '/goals', isActive: pathname === '/goals' },
  ]}
  user={{ name: currentUser.name, avatarUrl: currentUser.avatar }}
  onNavigate={(href) => router.push(href)}
  onLogout={() => signOut()}
>
  {children}
</AppShell>
```

## Visual Reference

See `screenshot.png` if available for the target UI design.
