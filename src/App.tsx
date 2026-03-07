import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from './components/shell'
import { TasksPage } from './pages/TasksPage'
import { GoalsPage } from './pages/GoalsPage'

const user = { name: 'Steven' }

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const navigationItems = [
    { label: 'Tasks', href: '/tasks', isActive: location.pathname === '/tasks' },
    { label: 'Goals', href: '/goals', isActive: location.pathname === '/goals' },
  ]

  return (
    <AppShell
      navigationItems={navigationItems}
      user={user}
      onNavigate={(href) => navigate(href)}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/goals" element={<GoalsPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
