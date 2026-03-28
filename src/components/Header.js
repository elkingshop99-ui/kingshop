import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Header({ isStaff, onLogout }) {
    const { t, i18n } = useTranslation();
    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
    };
    const handleLogout = () => {
        localStorage.removeItem('staff_token');
        onLogout();
    };
    return (_jsx("header", { className: "bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4 flex items-center justify-between", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors", children: [_jsx(Scissors, { size: 28 }), _jsx("span", { className: "text-2xl font-bold", children: "Elking" })] }), _jsxs("nav", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: toggleLanguage, className: "px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors text-sm font-medium", children: i18n.language === 'ar' ? 'EN' : 'AR' }), !isStaff ? (_jsx(Link, { to: "/login", className: "px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-white transition-colors font-medium", children: t('header.dashboard') })) : (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Link, { to: "/dashboard", className: "px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors font-medium", children: t('header.dashboard') }), _jsx(Link, { to: "/staff-management", className: "px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors font-medium", children: "\u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646" }), _jsx("button", { onClick: handleLogout, className: "px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium", children: t('dashboard.logout') })] }))] })] }) }));
}
