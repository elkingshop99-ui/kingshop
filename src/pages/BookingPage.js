import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/db/supabase';
import toast from 'react-hot-toast';
import { AlertCircle, Clock } from 'lucide-react';
const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];
// Normalize Egyptian phone numbers
const normalizePhone = (phone) => {
    // Remove all non-digit characters
    let normalized = phone.replace(/\D/g, '');
    // If starts with 0, keep it (e.g., 01000139417)
    if (normalized.startsWith('0')) {
        return normalized;
    }
    // If starts with 2 (country code), convert to 0 (e.g., 201000139417 -> 01000139417)
    if (normalized.startsWith('2')) {
        return '0' + normalized.substring(1);
    }
    return normalized;
};
export default function BookingPage() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const [barbers, setBarbers] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [existingBooking, setExistingBooking] = useState(null);
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
    useEffect(() => {
        if (selectedBarber && selectedDate) {
            checkBookedSlots();
        }
    }, [selectedBarber, selectedDate]);
    useEffect(() => {
        if (customerPhone) {
            checkExistingBooking();
        }
    }, [customerPhone, selectedDate]);
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
            // Auto-select first barber and first service
            if (barbersRes.data && barbersRes.data.length > 0) {
                setSelectedBarber(barbersRes.data[0].id);
            }
            if (servicesRes.data && servicesRes.data.length > 0) {
                setSelectedService(servicesRes.data[0].id);
            }
        }
        catch (err) {
            console.error('Error fetching data:', err);
            toast.error(t('booking.error'));
        }
    };
    const checkBookedSlots = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('booking_time')
                .eq('barber_id', selectedBarber)
                .eq('booking_date', selectedDate)
                .neq('status', 'cancelled');
            if (error)
                throw error;
            const booked = (data || []).map((b) => b.booking_time);
            setBookedSlots(booked);
        }
        catch (err) {
            console.error('Error checking bookings:', err);
        }
    };
    const checkExistingBooking = async () => {
        try {
            const normalizedPhone = normalizePhone(customerPhone);
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('customer_phone', normalizedPhone)
                .eq('booking_date', selectedDate)
                .neq('status', 'cancelled')
                .limit(1);
            if (error)
                throw error;
            if (data && data.length > 0) {
                setExistingBooking(data[0]);
            }
            else {
                setExistingBooking(null);
            }
        }
        catch (err) {
            console.error('Error checking existing booking:', err);
        }
    };
    const findNearestAvailableSlot = () => {
        for (const slot of TIME_SLOTS) {
            if (!bookedSlots.includes(slot)) {
                setSelectedTime(slot);
                return slot;
            }
        }
        return null;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate all required fields
        if (!selectedBarber?.trim()) {
            toast.error('اختر حلاق من فضلك');
            return;
        }
        if (!selectedService?.trim()) {
            toast.error('اختر خدمة من فضلك');
            return;
        }
        if (!selectedDate?.trim()) {
            toast.error('اختر التاريخ من فضلك');
            return;
        }
        if (!selectedTime?.trim()) {
            toast.error('اختر الموعد من فضلك');
            return;
        }
        if (!customerName?.trim()) {
            toast.error('أدخل اسمك من فضلك');
            return;
        }
        if (!customerPhone?.trim()) {
            toast.error('أدخل رقم الهاتف من فضلك');
            return;
        }
        if (bookedSlots.includes(selectedTime)) {
            toast.error('هذا المعاد محجوز بالفعل');
            return;
        }
        setLoading(true);
        try {
            const normalizedPhone = normalizePhone(customerPhone);
            // Create booking data WITHOUT id, created_at, updated_at
            // Supabase will generate these automatically
            const bookingData = {
                barber_id: selectedBarber,
                service_id: selectedService,
                customer_name: customerName.trim(),
                customer_phone: normalizedPhone,
                customer_email: customerEmail?.trim() || null,
                booking_date: selectedDate,
                booking_time: selectedTime,
                status: 'pending',
                notes: notes?.trim() || null,
            };
            console.log('Submitting booking:', bookingData);
            const { error } = await supabase.from('bookings').insert([bookingData]);
            if (error) {
                console.error('Supabase error details:', error);
                throw error;
            }
            toast.success('✅ تم الحجز بنجاح! سنتواصل معك قريباً');
            // Reset form
            setSelectedBarber(barbers[0]?.id || '');
            setSelectedService(services[0]?.id || '');
            setSelectedDate('');
            setSelectedTime('');
            setCustomerName('');
            setCustomerPhone('');
            setCustomerEmail('');
            setNotes('');
            setExistingBooking(null);
        }
        catch (err) {
            console.error('Booking error full:', err);
            if (err.message?.includes('uuid')) {
                toast.error('❌ خطأ في البيانات - تأكد من اختيار الحلاق والخدمة');
            }
            else if (err.code === '22P02') {
                toast.error('❌ صيغة بيانات غير صحيحة - حاول مرة أخرى');
            }
            else {
                toast.error('❌ حدث خطأ: ' + (err.message || t('booking.error')));
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("main", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold text-white mb-2", children: t('booking.title') }), _jsx("p", { className: "text-xl text-slate-300", children: t('booking.subtitle') })] }), _jsxs("form", { onSubmit: handleSubmit, className: "bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.selectBarber') }), _jsxs("select", { value: selectedBarber, onChange: (e) => setSelectedBarber(e.target.value), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors", dir: isArabic ? 'rtl' : 'ltr', children: [_jsx("option", { value: "", children: t('booking.selectBarber') }), barbers.map((barber) => (_jsx("option", { value: barber.id, children: barber.name }, barber.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.selectService') }), _jsxs("select", { value: selectedService, onChange: (e) => setSelectedService(e.target.value), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors", dir: isArabic ? 'rtl' : 'ltr', children: [_jsx("option", { value: "", children: t('booking.selectService') }), services.map((service) => (_jsxs("option", { value: service.id, children: [service.name_ar, " - ", service.price, " SAR (", service.duration_minutes, " \u062F\u0642\u064A\u0642\u0629)"] }, service.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.selectDate') }), _jsx("input", { type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors", min: new Date().toISOString().split('T')[0] })] }), selectedDate && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-slate-200", children: t('bookingAdvanced.availableSlots') }), _jsxs("button", { type: "button", onClick: () => {
                                                const nearest = findNearestAvailableSlot();
                                                if (!nearest) {
                                                    toast.error('لا توجد مواعيد متاحة اليوم');
                                                }
                                                else {
                                                    toast.success(`تم اختيار أقرب موعد: ${nearest}`);
                                                }
                                            }, className: "text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors flex items-center gap-1", children: [_jsx(Clock, { size: 14 }), t('bookingAdvanced.smartSelection')] })] }), _jsx("div", { className: "grid grid-cols-4 gap-2 mb-4", children: TIME_SLOTS.map((slot) => {
                                        const isBooked = bookedSlots.includes(slot);
                                        const isSelected = selectedTime === slot;
                                        return (_jsxs("button", { type: "button", onClick: () => !isBooked && setSelectedTime(slot), disabled: isBooked, className: `py-3 px-2 rounded-lg font-semibold text-sm transition-all ${isBooked
                                                ? 'bg-red-500/30 border border-red-500 text-red-300 cursor-not-allowed opacity-50'
                                                : isSelected
                                                    ? 'bg-gold-500 border border-gold-600 text-white shadow-lg'
                                                    : 'bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500'}`, children: [slot, isBooked && _jsx("span", { className: "text-xs block", children: "\u0645\u062D\u062C\u0648\u0632" })] }, slot));
                                    }) }), _jsx("p", { className: "text-xs text-slate-400 text-center", children: t('bookingAdvanced.selectFromGrid') })] })), existingBooking && (_jsxs("div", { className: "bg-amber-500/20 border border-amber-500 rounded-lg p-4 flex gap-3", children: [_jsx(AlertCircle, { className: "text-amber-500 flex-shrink-0 mt-0.5", size: 20 }), _jsxs("div", { className: "text-amber-100 text-sm", children: [_jsx("p", { className: "font-semibold mb-1", children: t('bookingAdvanced.phoneWarning') }), _jsxs("p", { children: [_jsx("strong", { children: existingBooking.booking_date }), " \u0641\u064A \u0627\u0644\u0633\u0627\u0639\u0629 ", _jsx("strong", { children: existingBooking.booking_time })] }), _jsxs("p", { className: "text-xs text-amber-200 mt-2", children: ["\u0627\u0644\u062D\u062C\u0632 \u0628\u0627\u0633\u0645: ", existingBooking.customer_name] })] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.yourName') }), _jsx("input", { type: "text", value: customerName, onChange: (e) => setCustomerName(e.target.value), placeholder: t('booking.yourName'), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors", dir: isArabic ? 'rtl' : 'ltr' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.yourPhone') }), _jsx("input", { type: "tel", value: customerPhone, onChange: (e) => setCustomerPhone(e.target.value), placeholder: "01000139417 \u0623\u0648 201000139417", className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors", dir: "ltr" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "\u0627\u0644\u0635\u064A\u063A \u0627\u0644\u0645\u0642\u0628\u0648\u0644\u0629: 01000139417 \u0623\u0648 201000139417" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.yourEmail') }), _jsx("input", { type: "email", value: customerEmail, onChange: (e) => setCustomerEmail(e.target.value), placeholder: t('booking.yourEmail'), className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200 mb-2", children: t('booking.notes') }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: t('booking.notes'), rows: 3, className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors resize-none", dir: isArabic ? 'rtl' : 'ltr' })] }), _jsx("button", { type: "submit", disabled: loading || !selectedTime, className: "w-full px-6 py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-700 text-white rounded-lg font-semibold transition-colors", children: loading ? 'جاري الحجز...' : t('booking.book') })] })] }) }));
}
