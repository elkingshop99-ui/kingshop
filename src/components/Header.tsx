import { useTranslation } from 'react-i18next'
import { Scissors } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HeaderProps {
  isStaff: boolean
  onLogout: () => void
}

export default function Header({ isStaff, onLogout }: HeaderProps) {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')
  }

  const handleLogout = () => {
    localStorage.removeItem('staff_token')
    onLogout()
  }

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors">
          <Scissors size={28} />
          <span className="text-2xl font-bold">Elking</span>
        </Link>

        <nav className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors text-sm font-medium"
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
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors font-medium"
              >
                {t('header.dashboard')}
              </Link>
              <Link
                to="/staff-management"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors font-medium"
              >
                الموظفين
              </Link>
              <Link
                to="/admin-settings"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors font-medium"
              >
                الإدارة
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium"
              >
                {t('dashboard.logout')}
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
