import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Booking, Barber, Service } from '@/db/supabase'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const [bookings, setBookings] = useState<(Booking & { barber?: Barber; service?: Service })[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'today' | 'all'>('today')

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('bookings')
        .select(`
          *,
          barbers:barber_id (id, name, phone, email),
          services:service_id (id, name_ar, name_en, price, duration_minutes)
        `)
        .order('booking_date', { ascending: false })

      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        query = query.eq('booking_date', today)
      }

      const { data, error } = await query

      if (error) throw error

      setBookings(
        (data || []).map((b: any) => ({
          ...b,
          barber: b.barbers ? b.barbers[0] : undefined,
          service: b.services ? b.services[0] : undefined,
        }))
      )
    } catch (err: any) {
      console.error(err)
      toast.error('خطأ في تحميل الحجوزات')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId)

      if (error) throw error

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: status as any } : b)))
      toast.success('تم تحديث الحالة')
    } catch (err: any) {
      toast.error('خطأ في تحديث الحالة')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{t('dashboard.todayBookings')}</h1>

          <div className="flex gap-4">
            <button
              onClick={() => setFilter('today')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'today' ? 'bg-gold-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-gold-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              جميع الحجوزات
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
            <p className="text-slate-300 mt-4">جاري التحميل...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-12">
            <p className="text-slate-300 text-lg">لا توجد حجوزات</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{booking.customer_name}</h3>
                    <p className="text-slate-400">{booking.customer_phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                    {t(`booking_status.${booking.status}`)}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-slate-300">
                    <strong>الحلاق:</strong> {booking.barber?.name}
                  </p>
                  <p className="text-slate-300">
                    <strong>الخدمة:</strong> {booking.service?.name_ar}
                  </p>
                  <p className="text-slate-300">
                    <strong>الموعد:</strong> {booking.booking_time}
                  </p>
                  <p className="text-slate-300">
                    <strong>التاريخ:</strong>{' '}
                    {format(new Date(booking.booking_date), 'EEEE، d MMMM yyyy', {
                      locale: i18n.language === 'ar' ? ar : undefined,
                    })}
                  </p>
                  {booking.notes && (
                    <p className="text-slate-300">
                      <strong>ملاحظات:</strong> {booking.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(booking.id, 'confirmed')}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> تأكيد
                  </button>
                  <button
                    onClick={() => updateStatus(booking.id, 'cancelled')}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> إلغاء
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
