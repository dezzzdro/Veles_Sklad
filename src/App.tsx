import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Layout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Warehouse from './pages/Warehouse'
import Assembly from './pages/Assembly'
import Arrival from './pages/Arrival'
import Issued from './pages/Issued'
import Counterparties from './pages/Counterparties'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import Debug from './pages/Debug'
import UIDemo from './components/UIDemo'
import { useThemeStore } from './stores/themeStore'

function App() {
  const { initializeTheme } = useThemeStore()

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return (
    <>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sklad" element={<Warehouse />} />
          <Route path="/sborka" element={<Assembly />} />
          <Route path="/prihod" element={<Arrival />} />
          <Route path="/vydannoe" element={<Issued />} />
          <Route path="/kontragenty" element={<Counterparties />} />
          <Route path="/nastroyki" element={<Settings />} />
          <Route path="/uvedomleniya" element={<Notifications />} />
          <Route path="/otladka" element={<Debug />} />
          <Route path="/ui-demo" element={<UIDemo />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App