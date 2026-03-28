import { useState, useEffect } from 'react'
import { supabase, Booking } from '@/db/supabase'
import toast from 'react-hot-toast'
import { Check, X, Clock, Phone } from 'lucide-react'

export default function QueuePage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [barbers, setBarbers] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [refreshTime, setRefreshTime] = useState(25)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime((prev) => (prev === 0 ? 25 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Fetch today's pending bookings sorted by time
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', today)
        .neq('status', 'cancelled')
        .neq('status', 'completed')
        .order('booking_time', { ascending: true })

      if (bookingsError) throw bookingsError

      // Fetch barbers for mapping
      const { data: barbersData, error: barbersError } = await supabase
        .from('barbers')
        .select('id, name')

      if (barbersError) throw barbersError

      const barbersMap: { [key: string]: string } = {}
      ;(barbersData || []).forEach((b: any) => {
        barbersMap[b.id] = b.name
      })

      setBookings(bookingsData || [])
      setBarbers(barbersMap)
    } catch (err: any) {
      console.error('Error fetching queue:', err)
      toast.error('خطأ في تحميل الطابور')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId)

      if (error) throw error

      toast.success('تم إكمال الحجز')
      fetchData()
    } catch (err: any) {
      console.error('Error completing booking:', err)
      toast.error('خطأ في التحديث')
    }
  }

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('هل تريد ملغاء هذا الحجز؟')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error

      toast.success('تم إلغاء الحجز')
      fetchData()
    } catch (err: any) {
      console.error('Error cancelling booking:', err)
      toast.error('خطأ في الإلغاء')
    }
  }

  const currentBooking = bookings.length > 0 ? bookings[0] : null
  const nextBookings = bookings.slice(1)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top Info */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white">🎯 الطابور</h1>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={20} />
            <span>التحديث بعد {refreshTime}ث</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 text-xl">جاري التحميل...</div>
        ) : currentBooking ? (
          <>
            {/* Current Customer - Big Hero */}
            <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-12 mb-12 shadow-2xl border-2 border-gold-400">
              <div className="text-center">
                <p className="text-gold-100 text-lg mb-4">العميل الحالي</p>
                <h2 className="text-white text-6xl font-bold mb-6">{currentBooking.customer_name}</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-gold-100 text-sm mb-1">الهاتف</p>
                    <div className="flex items-center justify-center gap-2 text-white fonts-semibold text-lg">
                      <Phone size={20} />
                      {currentBooking.customer_phone}
                    </div>
                  </div>

                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-gold-100 text-sm mb-1">الوقت</p>
                    <p className="text-white font-semibold text-lg">{currentBooking.booking_time}</p>
                  </div>

                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-gold-100 text-sm mb-1">الحلاق</p>
                    <p className="text-white font-semibold text-lg">{barbers[currentBooking.barber_id] || 'N/A'}</p>
                  </div>

                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-gold-100 text-sm mb-1">الحالة</p>
                    <p className="text-white font-semibold text-lg">🔔 قيد الخدمة</p>
                  </div>
                </div>

                {currentBooking.notes && (
                  <div className="bg-white/10 rounded-lg p-4 mb-8">
                    <p className="text-gold-100 text-sm mb-2">ملاحظات:</p>
                    <p className="text-white text-lg">{currentBooking.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleComplete(currentBooking.id)}
                    className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg transition-colors shadow-lg"
                  >
                    <Check size={24} />
                    اكتمل ✓
                  </button>
                  <button
                    onClick={() => handleCancel(currentBooking.id)}
                    className="flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-lg transition-colors shadow-lg"
                  >
                    <X size={24} />
                    ملغي ✗
                  </button>
                </div>
              </div>
            </div>

            {/* Next Customers List */}
            {nextBookings.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-6">📋 الانتظار</h3>

                <div className="space-y-3">
                  {nextBookings.map((booking, index) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-3xl font-bold text-gold-500 w-12 text-center">{index + 2}</div>

                        <div className="flex-1">
                          <p className="text-white font-semibold text-lg">{booking.customer_name}</p>
                          <div className="flex items-center gap-4 text-slate-300 text-sm mt-1">
                            <span className="flex items-center gap-1">
                              <Phone size={16} />
                              {booking.customer_phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={16} />
                              {booking.booking_time}
                            </span>
                            <span>الحلاق: {barbers[booking.barber_id] || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-400 text-sm">
                        {booking.booking_date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bookings.length === 1 && (
              <div className="text-center mt-12 text-slate-400 text-xl">
                ✅ لا يوجد عملاء منتظرين حالياً
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 text-2xl mb-4">✅ لا يوجد حجوزات اليوم</p>
            <p className="text-slate-500">استرخ، لا حاجة للعمل الآن!</p>
          </div>
        )}
      </div>
    </main>
  )
}
