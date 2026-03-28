import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Barber, Service, Booking } from '@/db/supabase'
import toast from 'react-hot-toast'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
]

interface WorkingHours {
  id: string
  barber_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
}

// Format date to Arabic format
const formatDateArabic = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${days[date.getDay()]}، ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

// Normalize Egyptian phone numbers
const normalizePhone = (phone: string) => {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '')
  
  // If starts with 0, keep it (e.g., 01000139417)
  if (normalized.startsWith('0')) {
    return normalized
  }
  
  // If starts with 2 (country code), convert to 0 (e.g., 201000139417 -> 01000139417)
  if (normalized.startsWith('2')) {
    return '0' + normalized.substring(1)
  }
  
  return normalized
}

// Check if booking time is in the past
const isPastTime = (timeStr: string, dateStr: string): boolean => {
  const now = new Date()
  const bookingDate = new Date(dateStr + 'T00:00:00')
  
  // If booking date is in the past, it's always past
  if (bookingDate.toDateString() < now.toDateString()) {
    return true
  }
  
  // If booking date is today, check if time has passed
  if (bookingDate.toDateString() === now.toDateString()) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const bookingTime = hours * 60 + minutes
    const currentTime = now.getHours() * 60 + now.getMinutes()
    return bookingTime <= currentTime
  }
  
  return false
}

// Compare two time strings (HH:MM format)
const compareTimeStrings = (time1: string, time2: string): number => {
  const [h1, m1] = time1.split(':').map(Number)
  const [h2, m2] = time2.split(':').map(Number)
  const t1 = h1 * 60 + m1
  const t2 = h2 * 60 + m2
  return t1 - t2
}

export default function BookingPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null)

  const [selectedBarber, setSelectedBarber] = useState<string>('')
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')
  
  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingBooking, setPendingBooking] = useState<any>(null)
  const [confirmationStep, setConfirmationStep] = useState<'confirm' | 'success'>('confirm')
  const [isConfirming, setIsConfirming] = useState(false)
  const [closingCountdown, setClosingCountdown] = useState(3)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      checkBookedSlots()
      fetchWorkingHoursForBarber()
    }
  }, [selectedBarber, selectedDate])

  useEffect(() => {
    if (customerPhone) {
      checkExistingBooking()
    }
  }, [customerPhone, selectedDate])

  // Countdown timer for closing modal after success
  useEffect(() => {
    if (confirmationStep !== 'success') {
      return
    }
    
    setClosingCountdown(3)
    const interval = setInterval(() => {
      setClosingCountdown(prev => {
        if (prev <= 1) {
          // Auto close
          setShowConfirmation(false)
          setConfirmationStep('confirm')
          setPendingBooking(null)
          
          // Reset form
          setSelectedBarber(barbers[0]?.id || '')
          setSelectedService(services[0]?.id || '')
          setSelectedDate('')
          setSelectedTime('')
          setCustomerName('')
          setCustomerPhone('')
          setCustomerEmail('')
          setNotes('')
          setExistingBooking(null)
          
          clearInterval(interval)
        }
        return Math.max(prev - 1, 0)
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [confirmationStep, barbers, services])

  const fetchData = async () => {
    try {
      const [barbersRes, servicesRes] = await Promise.all([
        supabase.from('barbers').select('*').eq('is_active', true),
        supabase.from('services').select('*').eq('is_active', true),
      ])

      if (barbersRes.error) throw barbersRes.error
      if (servicesRes.error) throw servicesRes.error

      setBarbers(barbersRes.data || [])
      setServices(servicesRes.data || [])

      // Auto-select first barber and first service
      if (barbersRes.data && barbersRes.data.length > 0) {
        setSelectedBarber(barbersRes.data[0].id)
      }
      if (servicesRes.data && servicesRes.data.length > 0) {
        setSelectedService(servicesRes.data[0].id)
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      toast.error(t('booking.error'))
    }
  }

  const checkBookedSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_time')
        .eq('barber_id', selectedBarber)
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled')

      if (error) throw error

      const booked = (data || []).map((b) => b.booking_time)
      setBookedSlots(booked)
    } catch (err: any) {
      console.error('Error checking bookings:', err)
    }
  }

  const fetchWorkingHoursForBarber = async () => {
    try {
      const bookingDate = new Date(selectedDate + 'T00:00:00')
      const dayOfWeek = bookingDate.getDay()

      const { data, error } = await supabase
        .from('working_hours')
        .select('*')
        .eq('barber_id', selectedBarber)
        .eq('day_of_week', dayOfWeek)
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        const hours = data[0] as WorkingHours
        setWorkingHours([hours])
        
        // Calculate available slots based on working hours
        if (hours.is_working) {
          const slots = TIME_SLOTS.filter(slot => 
            compareTimeStrings(slot, hours.start_time) >= 0 &&
            compareTimeStrings(slot, hours.end_time) < 0
          )
          setAvailableSlots(slots)
        } else {
          setAvailableSlots([])
        }
      } else {
        // If no working hours defined, use all slots (for backward compatibility)
        setWorkingHours([])
        setAvailableSlots(TIME_SLOTS)
      }
    } catch (err: any) {
      console.error('Error fetching working hours:', err)
      // If error, use all slots as fallback
      setAvailableSlots(TIME_SLOTS)
    }
  }

  const checkExistingBooking = async () => {
    try {
      const normalizedPhone = normalizePhone(customerPhone)
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_phone', normalizedPhone)
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled')
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        setExistingBooking(data[0])
      } else {
        setExistingBooking(null)
      }
    } catch (err: any) {
      console.error('Error checking existing booking:', err)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all required fields
    if (!selectedBarber?.trim()) {
      toast.error('اختر حلاق من فضلك')
      return
    }
    if (!selectedService?.trim()) {
      toast.error('اختر خدمة من فضلك')
      return
    }
    if (!selectedDate?.trim()) {
      toast.error('اختر التاريخ من فضلك')
      return
    }
    if (!selectedTime?.trim()) {
      toast.error('اختر الموعد من فضلك')
      return
    }
    if (!customerName?.trim()) {
      toast.error('أدخل اسمك من فضلك')
      return
    }
    if (!customerPhone?.trim()) {
      toast.error('أدخل رقم الهاتف من فضلك')
      return
    }

    // Check if time is in the past
    if (isPastTime(selectedTime, selectedDate)) {
      toast.error('❌ لا يمكن الحجز في وقت مضى - اختر وقت في المستقبل')
      return
    }

    // Check if time is already booked
    if (bookedSlots.includes(selectedTime)) {
      toast.error('❌ هذا المعاد محجوز بالفعل - اختر معاد آخر')
      return
    }

    // Check if time is within working hours
    if (workingHours.length > 0) {
      const hours = workingHours[0]
      if (!hours.is_working) {
        toast.error('❌ الحلاق غير متاح في هذا اليوم')
        return
      }
      if (!availableSlots.includes(selectedTime)) {
        toast.error('❌ هذا الوقت خارج أوقات عمل الحلاق')
        return
      }
    }

    // Show confirmation modal instead of submitting directly
    const normalizedPhone = normalizePhone(customerPhone)
    
    // Get barber and service names
    const barberData = barbers.find(b => b.id === selectedBarber)
    const serviceData = services.find(s => s.id === selectedService)
    
    const booking = {
      barber_id: selectedBarber,
      service_id: selectedService,
      barber_name: barberData?.name || '',
      service_name: serviceData?.name_ar || '',
      service_price: serviceData?.price || 0,
      service_duration: serviceData?.duration_minutes || 0,
      customer_name: customerName.trim(),
      customer_phone: normalizedPhone,
      customer_email: customerEmail?.trim() || null,
      booking_date: selectedDate,
      booking_time: selectedTime,
      status: 'pending',
      notes: notes?.trim() || null,
    }

    setPendingBooking(booking)
    setShowConfirmation(true)
    setConfirmationStep('confirm')
  }

  const handleConfirmBooking = async () => {
    if (!pendingBooking) return

    // Validate that barber and service IDs are valid UUIDs
    if (!pendingBooking.barber_id || pendingBooking.barber_id.length === 0) {
      toast.error('❌ اختر حلاق من فضلك')
      setConfirmationStep('confirm')
      return
    }

    if (!pendingBooking.service_id || pendingBooking.service_id.length === 0) {
      toast.error('❌ اختر خدمة من فضلك')
      setConfirmationStep('confirm')
      return
    }

    // Double check that the barber exists
    const selectedBarberData = barbers.find(b => b.id === pendingBooking.barber_id)
    if (!selectedBarberData) {
      toast.error('❌ الحلاق المختار غير صحيح - اختر حلاق آخر')
      setConfirmationStep('confirm')
      return
    }

    // Double check that the service exists
    const selectedServiceData = services.find(s => s.id === pendingBooking.service_id)
    if (!selectedServiceData) {
      toast.error('❌ الخدمة المختارة غير صحيحة - اختر خدمة أخرى')
      setConfirmationStep('confirm')
      return
    }

    setIsConfirming(true)
    try {
      // Extract only the fields that exist in the bookings table
      const bookingData = {
        barber_id: pendingBooking.barber_id,
        service_id: pendingBooking.service_id,
        customer_name: pendingBooking.customer_name,
        customer_phone: pendingBooking.customer_phone,
        customer_email: pendingBooking.customer_email,
        booking_date: pendingBooking.booking_date,
        booking_time: pendingBooking.booking_time,
        status: pendingBooking.status,
        notes: pendingBooking.notes,
      }

      const { error } = await supabase.from('bookings').insert([bookingData])

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      // Show success state
      setConfirmationStep('success')
    } catch (err: any) {
      console.error('Booking error full:', err)
      
      if (err.message?.includes('uuid')) {
        toast.error('❌ خطأ في البيانات - تأكد من اختيار الحلاق والخدمة')
      } else if (err.code === '22P02') {
        toast.error('❌ صيغة بيانات غير صحيحة - حاول مرة أخرى')
      } else {
        toast.error('❌ حدث خطأ: ' + (err.message || 'حاول مرة أخرى'))
      }
      
      setConfirmationStep('confirm')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleEditBooking = () => {
    setShowConfirmation(false)
    setPendingBooking(null)
    setConfirmationStep('confirm')
  }

  const handleCancelBooking = () => {
    setShowConfirmation(false)
    setPendingBooking(null)
    setConfirmationStep('confirm')
  }

  const handleBackdropClick = (e: React.MouseEvent): void => {
    // Don't close if clicking the modal itself
    if (e.target === e.currentTarget) {
      // Don't close during confirmation or success
      if (!isConfirming && confirmationStep !== 'success') {
        handleEditBooking()
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{t('booking.title')}</h1>
          <p className="text-xl text-slate-300">{t('booking.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 space-y-6">
          {/* Barber Selection - Auto-selected */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">{t('booking.selectBarber')}</label>
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <option value="">{t('booking.selectBarber')}</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">{t('booking.selectService')}</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <option value="">{t('booking.selectService')}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name_ar} - {service.price} ج.م ({service.duration_minutes} دقيقة)
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">{t('booking.selectDate')}</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time Slots Grid */}
          {selectedDate && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-200">{t('bookingAdvanced.availableSlots')}</label>
                <button
                  type="button"
                  onClick={() => {
                    const nearest = availableSlots.find(slot => 
                      !bookedSlots.includes(slot) && !isPastTime(slot, selectedDate)
                    )
                    if (!nearest) {
                      toast.error('لا توجد مواعيد متاحة اليوم')
                    } else {
                      setSelectedTime(nearest)
                      toast.success(`تم اختيار أقرب موعد: ${nearest}`)
                    }
                  }}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                >
                  <Clock size={14} />
                  {t('bookingAdvanced.smartSelection')}
                </button>
              </div>

              {availableSlots.length === 0 && workingHours.length > 0 && !workingHours[0]?.is_working && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300 mb-4">
                  ⚠️ الحلاق غير متاح في هذا اليوم
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 mb-4">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot)
                    const isPast = isPastTime(slot, selectedDate)
                    const isSelected = selectedTime === slot
                    const isDisabled = isBooked || isPast

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => !isDisabled && setSelectedTime(slot)}
                        disabled={isDisabled}
                        className={`py-3 px-2 rounded-lg font-semibold text-sm transition-all ${
                          isBooked
                            ? 'bg-red-500/30 border border-red-500 text-red-300 cursor-not-allowed opacity-50'
                            : isPast
                            ? 'bg-gray-500/30 border border-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-gold-500 border border-gold-600 text-white shadow-lg'
                            : 'bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500'
                        }`}
                      >
                        {slot}
                        {isBooked && <span className="text-xs block">محجوز</span>}
                        {isPast && <span className="text-xs block">مضى</span>}
                      </button>
                    )
                  })
                ) : (
                  <div className="col-span-4 text-center text-slate-400 p-4">
                    لا توجد مواعيد متاحة
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 text-center">
                {t('bookingAdvanced.selectFromGrid')}
              </p>
            </div>
          )}

          {/* Phone Warning */}
          {existingBooking && (
            <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-amber-100 text-sm">
                <p className="font-semibold mb-1">{t('bookingAdvanced.phoneWarning')}</p>
                <p>
                  <strong>{existingBooking.booking_date}</strong> في الساعة <strong>{existingBooking.booking_time}</strong>
                </p>
                <p className="text-xs text-amber-200 mt-2">الحجز باسم: {existingBooking.customer_name}</p>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">{t('booking.yourName')}</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('booking.yourName')}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors"
                dir={isArabic ? 'rtl' : 'ltr'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">{t('booking.yourPhone')}</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="01000139417 أو 201000139417"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors"
                dir="ltr"
              />
              <p className="text-xs text-slate-400 mt-1">الصيغ المقبولة: 01000139417 أو 201000139417</p>
            </div>
          </div>

          {/* Email & Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">{t('booking.yourEmail')}</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder={t('booking.yourEmail')}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">{t('booking.notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('booking.notes')}
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors resize-none"
              dir={isArabic ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedTime}
            className="w-full px-6 py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-700 text-white rounded-lg font-semibold transition-colors"
          >
            {t('booking.book')}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {confirmationStep === 'confirm' ? (
              <>
                {/* Confirmation Header */}
                <div className="bg-gradient-to-r from-gold-500 to-gold-600 px-8 py-6 text-white rounded-t-xl">
                  <h2 className="text-3xl font-bold">تأكيد الحجز</h2>
                  <p className="text-gold-100 mt-1">تأكد من البيانات قبل الحجز</p>
                </div>

                {/* Booking Details */}
                <div className="px-8 py-8 space-y-6">
                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Name */}
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                      <p className="text-slate-400 text-sm mb-2">الاسم</p>
                      <p className="text-white text-lg font-semibold">{pendingBooking?.customer_name}</p>
                    </div>

                    {/* Phone */}
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                      <p className="text-slate-400 text-sm mb-2">رقم الهاتف</p>
                      <p className="text-white text-lg font-semibold">{pendingBooking?.customer_phone}</p>
                    </div>

                    {/* Barber */}
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                      <p className="text-slate-400 text-sm mb-2">الحلاق</p>
                      <p className="text-white text-lg font-semibold">
                        {pendingBooking?.barber_name || 'جاري التحميل...'}
                      </p>
                    </div>

                    {/* Service */}
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                      <p className="text-slate-400 text-sm mb-2">الخدمة</p>
                      <div>
                        <p className="text-white text-lg font-semibold">
                          {pendingBooking?.service_name || 'جاري التحميل...'}
                        </p>
                        <p className="text-slate-300 text-xs mt-1">
                          ⏱️ {pendingBooking?.service_duration} دقيقة
                        </p>
                        <p className="text-gold-400 text-sm mt-1 font-semibold">
                          {pendingBooking?.service_price} ج.م
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                      <p className="text-slate-400 text-sm mb-2">التاريخ</p>
                      <p className="text-white text-lg font-semibold">{formatDateArabic(pendingBooking?.booking_date || '')}</p>
                    </div>

                    {/* Time */}
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                      <p className="text-slate-400 text-sm mb-2">الوقت</p>
                      <p className="text-white text-lg font-semibold text-center">{pendingBooking?.booking_time}</p>
                    </div>
                  </div>

                  {/* Notes if exists */}
                  {pendingBooking?.notes && (
                    <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                      <p className="text-blue-300 text-sm mb-2">ملاحظاتك</p>
                      <p className="text-blue-100">{pendingBooking.notes}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-8 py-6 bg-slate-800/50 border-t border-slate-700 flex gap-4 rounded-b-xl">
                  {/* Cancel Button - Red */}
                  <button
                    onClick={handleCancelBooking}
                    disabled={isConfirming}
                    className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-300 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    إلغاء
                  </button>

                  {/* Edit Button - Blue */}
                  <button
                    onClick={handleEditBooking}
                    disabled={isConfirming}
                    className="flex-1 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500 text-blue-300 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    تعديل
                  </button>

                  {/* Confirm Button - Green */}
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isConfirming}
                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {isConfirming ? 'جاري...' : '✓ تأكيد الحجز'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="px-8 py-12 flex flex-col items-center justify-center text-center">
                  {/* Success Icon with Animation */}
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse blur-lg"></div>
                    <CheckCircle2 size={80} className="text-green-400 relative animate-bounce" />
                  </div>

                  {/* Success Message */}
                  <h3 className="text-4xl font-bold text-white mb-3">تم التأكيد! 🎉</h3>
                  <p className="text-xl text-slate-300 mb-2">حجزك تم بنجاح</p>
                  <p className="text-slate-400">سنتواصل معك على الرقم {pendingBooking?.customer_phone}</p>

                  {/* Booking Summary */}
                  <div className="mt-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6 w-full">
                    <p className="text-green-300 text-sm mb-3 font-semibold">📋 بيانات الحجز</p>
                    <div className="space-y-2 text-right">
                      <p className="text-slate-200">
                        <span className="text-slate-400">الحلاق:</span> {pendingBooking?.barber_name}
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-400">الخدمة:</span> {pendingBooking?.service_name}
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-400">السعر:</span> <span className="text-gold-400 font-semibold">{pendingBooking?.service_price} ج.م</span>
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-400">المدة:</span> {pendingBooking?.service_duration} دقيقة
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-400">التاريخ والوقت:</span> {formatDateArabic(pendingBooking?.booking_date || '')} - {pendingBooking?.booking_time}
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-400">رقم الهاتف:</span> {pendingBooking?.customer_phone}
                      </p>
                    </div>
                  </div>

                  {/* Closing text */}
                  <div className="mt-8 text-center">
                    <p className="text-slate-300 text-sm mb-4">
                      ✅ سيتم إغلاق هذه النافذة تلقائياً خلال...
                    </p>
                    <div className="inline-block bg-gold-500/20 border-2 border-gold-500 rounded-full px-6 py-3">
                      <p className="text-gold-400 text-3xl font-bold">{closingCountdown}</p>
                    </div>
                    <p className="text-slate-400 text-xs mt-4">الرجاء الانتظار</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
