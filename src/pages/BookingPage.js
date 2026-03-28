import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/db/supabase';
import toast from 'react-hot-toast';
export default function BookingPage() {
    const { t } = useTranslation();
    const [barbers, setBarbers] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBarber, setSelectedBarber] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [notes, setNotes] = useState('');
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            const [barbersRes, servicesRes] = await Promise.all([
                supabase.from('barbers').select('*').eq('is_active', true),
                supabase.from('services').select('*').eq('is_active', true),
            ]);
            if (barbersRes.error)
                throw barbersRes.error;
            if (servicesRes.error)
                throw servicesRes.error;
            setBarbers(barbersRes.data || []);
            setServices(servicesRes.data || []);
        }
        catch (err) {
            console.error('Error fetching data:', err);
            toast.error(t('booking.error'));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBarber || !selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone) {
            toast.error(t('validation.required'));
            return;
        }
        setLoading(true);
        try {
            const booking = {
                id: '',
                barber_id: selectedBarber,
                service_id: selectedService,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail || undefined,
                booking_date: selectedDate,
                booking_time: selectedTime,
                status: 'pending',
                notes: notes || undefined,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            const { error } = await supabase.from('bookings').insert([booking]);
            if (error)
                throw error;
            toast.success(t('booking.success'));
            // Reset form
            setSelectedBarber('');
            setSelectedService('');
            setSelectedDate('');
            setSelectedTime('');
            setCustomerName('');
            setCustomerPhone('');
            setCustomerEmail('');
            setNotes('');
        }
        catch (err) {
            console.error('Booking error:', err);
            toast.error(t('booking.error'));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("main", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12", children: _jsxs("div", { className: "max-w-2xl mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold text-white mb-2", children: t('booking.title') }), _jsx("p", { className: "text-xl text-slate-300", children: t('booking.subtitle') })] }), _jsxs("form", { onSubmit: handleSubmit, className: "bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.selectBarber') }), _jsxs("select", { value: selectedBarber, onChange: (e) => setSelectedBarber(e.target.value), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors", children: [_jsx("option", { value: "", children: t('booking.selectBarber') }), barbers.map((barber) => (_jsx("option", { value: barber.id, children: barber.name }, barber.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.selectService') }), _jsxs("select", { value: selectedService, onChange: (e) => setSelectedService(e.target.value), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors", children: [_jsx("option", { value: "", children: t('booking.selectService') }), services.map((service) => (_jsxs("option", { value: service.id, children: [service.name_ar, " - ", service.price, " SAR"] }, service.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.selectDate') }), _jsx("input", { type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors", min: new Date().toISOString().split('T')[0] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.selectTime') }), _jsx("input", { type: "time", value: selectedTime, onChange: (e) => setSelectedTime(e.target.value), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.yourName') }), _jsx("input", { type: "text", value: customerName, onChange: (e) => setCustomerName(e.target.value), placeholder: t('booking.yourName'), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.yourPhone') }), _jsx("input", { type: "tel", value: customerPhone, onChange: (e) => setCustomerPhone(e.target.value), placeholder: t('booking.yourPhone'), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.yourEmail') }), _jsx("input", { type: "email", value: customerEmail, onChange: (e) => setCustomerEmail(e.target.value), placeholder: t('booking.yourEmail'), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.notes') }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: t('booking.notes'), rows: 3, className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors resize-none" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full px-6 py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-700 text-white rounded-lg font-semibold transition-colors", children: loading ? 'جاري الحجز...' : t('booking.book') })] })] }) }));
}
