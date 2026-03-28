import { useTranslation } from 'react-i18next'
import { Scissors, Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

interface HeaderProps {
  isStaff: boolean
  onLogout: () => void
}

export default function Header({ isStaff, onLogout }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')
  }

  const handleLogout = () => {
    localStorage.removeItem('staff_token')
    onLogout()
    setMobileMenuOpen(false)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navLinkClass = (path: string) => {
    const baseClass = "px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
    if (isActive(path)) {
      return `${baseClass} bg-gold-500 text-white shadow-lg`
    }
    return `${baseClass} bg-slate-800 hover:bg-slate-700 text-white`
  }

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors">
            <Scissors size={28} />
            <span className="text-2xl font-bold">Elking</span>
          </Link>

          <nav className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors font-medium"
            >
              {i18n.language === 'ar' ? 'EN' : 'AR'}
            </button>

            {!isStaff ? (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-white transition-colors font-medium"
              >
                {t('header.dashboard')}
              </Link>
            ) : (
              <>
                <Link to="/queue" className={navLinkClass('/queue')}>
                  🎯 الطابور
                </Link>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  📊 {t('header.dashboard')}
                </Link>
                <Link to="/staff-management" className={navLinkClass('/staff-management')}>
                  👥 الموظفين
                </Link>
                <Link to="/admin-settings" className={navLinkClass('/admin-settings')}>
                  ⚙️ الإدارة
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium"
                >
                  خروج
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1 text-gold-400 hover:text-gold-300 transition-colors">
              <Scissors size={24} />
              <span className="text-lg font-bold">Elking</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="px-2 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-white"
              >
                {i18n.language === 'ar' ? 'EN' : 'AR'}
              </button>

              {isStaff && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-white"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {isStaff && mobileMenuOpen && (
            <nav className="mt-3 flex flex-col gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <Link
                to="/queue"
                className={`${navLinkClass('/queue')} text-center`}
                onClick={() => setMobileMenuOpen(false)}
              >
                🎯 الطابور
              </Link>
              <Link
                to="/dashboard"
                className={`${navLinkClass('/dashboard')} text-center`}
                onClick={() => setMobileMenuOpen(false)}
              >
                📊 لوحة التحكم
              </Link>
              <Link
                to="/staff-management"
                className={`${navLinkClass('/staff-management')} text-center`}
                onClick={() => setMobileMenuOpen(false)}
              >
                👥 الموظفين
              </Link>
              <Link
                to="/admin-settings"
                className={`${navLinkClass('/admin-settings')} text-center`}
                onClick={() => setMobileMenuOpen(false)}
              >
                ⚙️ الإدارة
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors text-center"
              >
                خروج
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
