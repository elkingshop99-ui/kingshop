import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

// Pages
import BookingPage from './pages/BookingPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import StaffManagementPage from './pages/StaffManagementPage'
import AdminSettingsPage from './pages/AdminSettingsPage'

// Components
import Header from './components/Header'

function App() {
  const { i18n } = useTranslation()
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    const staffToken = localStorage.getItem('staff_token')
    setIsStaff(!!staffToken)

    // Set HTML dir based on language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
  }, [i18n.language])

  return (
    <>
      <BrowserRouter>
        <Header isStaff={isStaff} onLogout={() => setIsStaff(false)} />
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={() => setIsStaff(true)} />} />
          <Route path="/dashboard" element={isStaff ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/staff-management" element={isStaff ? <StaffManagementPage /> : <Navigate to="/login" />} />
          <Route path="/admin-settings" element={isStaff ? <AdminSettingsPage /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </>
  )
}

export default App
