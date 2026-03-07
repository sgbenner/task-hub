import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { NavigationItem } from './AppShell'

interface MainNavProps {
  items: NavigationItem[]
  onNavigate?: (href: string) => void
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleClick = (href: string) => {
    onNavigate?.(href)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-1">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => handleClick(item.href)}
            className={[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              item.isActive
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-md text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {mobileOpen && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg py-1 z-50">
            {items.map((item) => (
              <button
                key={item.href}
                onClick={() => handleClick(item.href)}
                className={[
                  'w-full text-left px-4 py-2 text-sm font-medium transition-colors',
                  item.isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
