import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import toast from 'react-hot-toast';
import { Check, X, Clock, Phone } from 'lucide-react';
export default function QueuePage() {
    const [bookings, setBookings] = useState([]);
    const [barbers, setBarbers] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshTime, setRefreshTime] = useState(25);
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshTime((prev) => (prev === 0 ? 25 : prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const fetchData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            // Fetch today's pending bookings sorted by time
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select('*')
                .eq('booking_date', today)
                .neq('status', 'cancelled')
                .neq('status', 'completed')
                .order('booking_time', { ascending: true });
            if (bookingsError)
                throw bookingsError;
            // Fetch barbers for mapping
            const { data: barbersData, error: barbersError } = await supabase
                .from('barbers')
                .select('id, name');
            if (barbersError)
                throw barbersError;
            const barbersMap = {};
            (barbersData || []).forEach((b) => {
                barbersMap[b.id] = b.name;
            });
            setBookings(bookingsData || []);
            setBarbers(barbersMap);
        }
        catch (err) {
            console.error('Error fetching queue:', err);
            toast.error('خطأ في تحميل الطابور');
        }
        finally {
            setLoading(false);
        }
    };
    const handleComplete = async (bookingId) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'completed' })
                .eq('id', bookingId);
            if (error)
                throw error;
            toast.success('تم إكمال الحجز');
            fetchData();
        }
        catch (err) {
            console.error('Error completing booking:', err);
            toast.error('خطأ في التحديث');
        }
    };
    const handleCancel = async (bookingId) => {
        if (!window.confirm('هل تريد ملغاء هذا الحجز؟'))
            return;
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('id', bookingId);
            if (error)
                throw error;
            toast.success('تم إلغاء الحجز');
            fetchData();
        }
        catch (err) {
            console.error('Error cancelling booking:', err);
            toast.error('خطأ في الإلغاء');
        }
    };
    const currentBooking = bookings.length > 0 ? bookings[0] : null;
    const nextBookings = bookings.slice(1);
    return (_jsx("main", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-12", children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-white", children: "\uD83C\uDFAF \u0627\u0644\u0637\u0627\u0628\u0648\u0631" }), _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(Clock, { size: 20 }), _jsxs("span", { children: ["\u0627\u0644\u062A\u062D\u062F\u064A\u062B \u0628\u0639\u062F ", refreshTime, "\u062B"] })] })] }), loading ? (_jsx("div", { className: "text-center text-slate-400 text-xl", children: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644..." })) : currentBooking ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-12 mb-12 shadow-2xl border-2 border-gold-400", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-gold-100 text-lg mb-4", children: "\u0627\u0644\u0639\u0645\u064A\u0644 \u0627\u0644\u062D\u0627\u0644\u064A" }), _jsx("h2", { className: "text-white text-6xl font-bold mb-6", children: currentBooking.customer_name }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white/20 rounded-lg p-4", children: [_jsx("p", { className: "text-gold-100 text-sm mb-1", children: "\u0627\u0644\u0647\u0627\u062A\u0641" }), _jsxs("div", { className: "flex items-center justify-center gap-2 text-white fonts-semibold text-lg", children: [_jsx(Phone, { size: 20 }), currentBooking.customer_phone] })] }), _jsxs("div", { className: "bg-white/20 rounded-lg p-4", children: [_jsx("p", { className: "text-gold-100 text-sm mb-1", children: "\u0627\u0644\u0648\u0642\u062A" }), _jsx("p", { className: "text-white font-semibold text-lg", children: currentBooking.booking_time })] }), _jsxs("div", { className: "bg-white/20 rounded-lg p-4", children: [_jsx("p", { className: "text-gold-100 text-sm mb-1", children: "\u0627\u0644\u062D\u0644\u0627\u0642" }), _jsx("p", { className: "text-white font-semibold text-lg", children: barbers[currentBooking.barber_id] || 'N/A' })] }), _jsxs("div", { className: "bg-white/20 rounded-lg p-4", children: [_jsx("p", { className: "text-gold-100 text-sm mb-1", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx("p", { className: "text-white font-semibold text-lg", children: "\uD83D\uDD14 \u0642\u064A\u062F \u0627\u0644\u062E\u062F\u0645\u0629" })] })] }), currentBooking.notes && (_jsxs("div", { className: "bg-white/10 rounded-lg p-4 mb-8", children: [_jsx("p", { className: "text-gold-100 text-sm mb-2", children: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A:" }), _jsx("p", { className: "text-white text-lg", children: currentBooking.notes })] })), _jsxs("div", { className: "flex gap-4 justify-center", children: [_jsxs("button", { onClick: () => handleComplete(currentBooking.id), className: "flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg transition-colors shadow-lg", children: [_jsx(Check, { size: 24 }), "\u0627\u0643\u062A\u0645\u0644 \u2713"] }), _jsxs("button", { onClick: () => handleCancel(currentBooking.id), className: "flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-lg transition-colors shadow-lg", children: [_jsx(X, { size: 24 }), "\u0645\u0644\u063A\u064A \u2717"] })] })] }) }), nextBookings.length > 0 && (_jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-6", children: "\uD83D\uDCCB \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631" }), _jsx("div", { className: "space-y-3", children: nextBookings.map((booking, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600", children: [_jsxs("div", { className: "flex items-center gap-4 flex-1", children: [_jsx("div", { className: "text-3xl font-bold text-gold-500 w-12 text-center", children: index + 2 }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-white font-semibold text-lg", children: booking.customer_name }), _jsxs("div", { className: "flex items-center gap-4 text-slate-300 text-sm mt-1", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Phone, { size: 16 }), booking.customer_phone] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { size: 16 }), booking.booking_time] }), _jsxs("span", { children: ["\u0627\u0644\u062D\u0644\u0627\u0642: ", barbers[booking.barber_id] || 'N/A'] })] })] })] }), _jsx("div", { className: "text-slate-400 text-sm", children: booking.booking_date })] }, booking.id))) })] })), bookings.length === 1 && (_jsx("div", { className: "text-center mt-12 text-slate-400 text-xl", children: "\u2705 \u0644\u0627 \u064A\u0648\u062C\u062F \u0639\u0645\u0644\u0627\u0621 \u0645\u0646\u062A\u0638\u0631\u064A\u0646 \u062D\u0627\u0644\u064A\u0627\u064B" }))] })) : (_jsxs("div", { className: "text-center py-16", children: [_jsx("p", { className: "text-slate-400 text-2xl mb-4", children: "\u2705 \u0644\u0627 \u064A\u0648\u062C\u062F \u062D\u062C\u0648\u0632\u0627\u062A \u0627\u0644\u064A\u0648\u0645" }), _jsx("p", { className: "text-slate-500", children: "\u0627\u0633\u062A\u0631\u062E\u060C \u0644\u0627 \u062D\u0627\u062C\u0629 \u0644\u0644\u0639\u0645\u0644 \u0627\u0644\u0622\u0646!" })] }))] }) }));
}
