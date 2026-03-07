import type { ReactNode } from 'react'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

export interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

export interface AppShellUser {
  name: string
  avatarUrl?: string
}

export interface AppShellProps {
  children: ReactNode
  navigationItems: NavigationItem[]
  user?: AppShellUser
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-['Inter',sans-serif]">
      {/* Fixed top nav */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-6">
          {/* Logo */}
          <span className="text-base font-semibold text-stone-900 dark:text-stone-100 tracking-tight shrink-0">
            TaskHub
          </span>

          {/* Nav + User row */}
          <div className="flex items-center gap-4 flex-1 justify-between">
            <MainNav items={navigationItems} onNavigate={onNavigate} />
            {user && <UserMenu user={user} onLogout={onLogout} />}
          </div>
        </div>
      </header>

      {/* Content area — offset by header height */}
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
