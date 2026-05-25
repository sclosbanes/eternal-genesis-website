'use client'

import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Gift,
  Loader2,
  Search,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Wallet,
  XCircle,
  Zap
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'

function safeString(value) {
  return String(value || '').trim()
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatPrice(value) {
  return safeNumber(value).toFixed(2)
}

function getPointType(item) {
  const type = safeString(item?.points_type || item?.category).toLowerCase()
  return type === 'vote' ? 'vote' : 'donate'
}

function getPointLabel(item) {
  return getPointType(item) === 'vote' ? 'Vote Points' : 'Donate Points'
}

function getPointBadgeClasses(item) {
  return getPointType(item) === 'vote'
    ? 'border-blue-400/40 bg-blue-500/10 text-blue-300'
    : 'border-amber-400/40 bg-amber-500/10 text-amber-300'
}

function getImageUrl(item) {
  const url = safeString(item?.image_url)
  return url || null
}

function ShopSkeleton() {
  return (
    <section className="min-h-screen bg-black px-4 py-24 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="h-24 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ItemMall() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [buyingId, setBuyingId] = useState(null)
  const [captureRunning, setCaptureRunning] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadItems() {
      try {
        setError('')
        const res = await fetch('/api/topup', { cache: 'no-store' })
        const data = await res.json().catch(() => [])

        if (!res.ok) {
          throw new Error(data?.error || 'Could not load the shop')
        }

        if (mounted) {
          setItems(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('[SHOP LOAD ERROR]', err)
        if (mounted) setError(err.message || 'Shop error')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadItems()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paypalStatus = params.get('paypal')
    const token = params.get('token')

    if (paypalStatus === 'cancel') {
      Swal.fire({
        title: 'Payment canceled',
        text: 'No points were credited.',
        icon: 'info',
        confirmButtonText: 'OK',
        background: '#111827',
        color: '#fff'
      })
      window.history.replaceState({}, '', '/shops')
      return
    }

    if (paypalStatus !== 'success' || !token || captureRunning) {
      return
    }

    async function captureOrder() {
      setCaptureRunning(true)

      Swal.fire({
        title: 'Verifying payment',
        text: 'PayPal is confirming the transaction. Do not close this page.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
        background: '#111827',
        color: '#fff'
      })

      try {
        const res = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paypalOrderId: token })
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Could not confirm the payment')
        }

        await Swal.fire({
          title: data.alreadyCredited ? 'Already credited' : 'Payment confirmed',
          text: `${safeNumber(data.points)} ${data.pointsType === 'vote' ? 'Vote Points' : 'Donate Points'} credited to ${safeString(data.characterName) || 'the selected character'}. Log out and back into the game if the points are not visible right away.`,
          icon: 'success',
          confirmButtonText: 'OK',
          background: '#111827',
          color: '#fff'
        })
      } catch (err) {
        console.error('[PAYPAL CAPTURE CLIENT ERROR]', err)
        await Swal.fire({
          title: 'Payment needs review',
          text: err.message || 'PayPal could not be confirmed automatically. Check the admin panel or SQL before crediting manually.',
          icon: 'error',
          confirmButtonText: 'OK',
          background: '#111827',
          color: '#fff'
        })
      } finally {
        setCaptureRunning(false)
        window.history.replaceState({}, '', '/shops')
      }
    }

    captureOrder()
  }, [captureRunning])

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return items
      .filter((item) => {
        const type = getPointType(item)
        if (activeType !== 'all' && type !== activeType) return false

        if (!normalizedSearch) return true

        const name = safeString(item.name).toLowerCase()
        const description = safeString(item.description).toLowerCase()
        return name.includes(normalizedSearch) || description.includes(normalizedSearch)
      })
      .sort((a, b) => {
        const typeA = getPointType(a) === 'donate' ? 0 : 1
        const typeB = getPointType(b) === 'donate' ? 0 : 1
        if (typeA !== typeB) return typeA - typeB
        return safeNumber(a.price) - safeNumber(b.price)
      })
  }, [items, activeType, search])

  async function handleBuy(item) {
    const itemId = Number(item?.id)

    if (!Number.isInteger(itemId) || itemId <= 0) {
      Swal.fire({
        title: 'Invalid pack',
        text: 'This shop pack is invalid.',
        icon: 'error',
        background: '#111827',
        color: '#fff'
      })
      return
    }

    const result = await Swal.fire({
      title: 'Character name',
      html: `
        <div style="text-align:left;font-size:14px;line-height:1.5;color:#d1d5db">
          <p><b style="color:#fbbf24">${safeString(item.name)}</b></p>
          <p>${safeNumber(item.points).toLocaleString()} ${getPointLabel(item)} - ${formatPrice(item.price)} EUR</p>
          <p style="margin-top:10px">Enter the <b>exact character name</b> that should receive the points.</p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Character name en jeu',
      inputAttributes: {
        maxlength: '32',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Continue to PayPal',
      cancelButtonText: 'Cancel',
      background: '#111827',
      color: '#fff',
      inputValidator: (value) => {
        const name = safeString(value)
        if (!name || name.length < 2) return 'Enter a valid character name.'
        return null
      }
    })

    if (!result.isConfirmed) {
      return
    }

    const characterName = safeString(result.value)

    setBuyingId(itemId)

    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          characterName
        })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.success || !data.approvalUrl) {
        throw new Error(data.error || 'Could not create the PayPal payment')
      }

      window.location.href = data.approvalUrl
    } catch (err) {
      console.error('[PAYPAL CREATE CLIENT ERROR]', err)
      Swal.fire({
        title: 'Error PayPal',
        text: err.message || 'Could not create the PayPal payment.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#111827',
        color: '#fff'
      })
      setBuyingId(null)
    }
  }

  if (loading) return <ShopSkeleton />

  if (error) {
    return (
      <section className="min-h-screen bg-black px-4 py-24 text-white flex items-center justify-center">
        <div className="max-w-lg w-full rounded-2xl border border-red-500/40 bg-gray-900 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-300 mb-2">Shop error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-500"
          >
            Reload
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-black px-4 py-24 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <div className="rounded-3xl border border-amber-500/20 bg-gray-950/80 backdrop-blur p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 mb-4">
                <Shield className="w-4 h-4" /> Automatic PayPal payment
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Shop Cash Shop</h1>
              <p className="text-gray-300 max-w-2xl">
                Choose a pack, enter the exact character name, pay with PayPal, and the points will be credited automatically to the in-game shop.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                <Wallet className="w-5 h-5 text-amber-300 mb-2" />
                <div className="font-bold">Donate Points</div>
                <div className="text-gray-400 text-xs">ACCOUNT_TBL.cash</div>
              </div>
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                <Star className="w-5 h-5 text-blue-300 mb-2" />
                <div className="font-bold">Vote Points</div>
                <div className="text-gray-400 text-xs">ACCOUNT_TBL.votepoint</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', icon: ShoppingCart },
              { key: 'donate', label: 'Donate Points', icon: Crown },
              { key: 'vote', label: 'Vote Points', icon: Star }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveType(tab.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold border transition ${
                  activeType === tab.key
                    ? 'border-amber-400 bg-amber-500 text-black'
                    : 'border-gray-700 bg-gray-900 text-gray-200 hover:border-amber-400/50'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-0 lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search packs..."
              className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <XCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No packs found</h2>
            <p className="text-gray-400">Check the packs in the shop admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => {
              const imageUrl = getImageUrl(item)
              const isBuying = buyingId === Number(item.id)

              return (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden hover:border-amber-500/50 transition shadow-xl flex flex-col"
                >
                  <div className="relative h-40 bg-gray-900 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={safeString(item.name) || 'Shop pack'}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                        <Sparkles className="w-14 h-14 text-amber-400/70" />
                      </div>
                    )}

                    <div className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-black ${getPointBadgeClasses(item)}`}>
                      {getPointLabel(item)}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-lg font-black text-white line-clamp-1 mb-2">
                      {safeString(item.name) || 'Shop pack'}
                    </h2>
                    <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px] mb-4">
                      {safeString(item.description) || 'Cash Shop points pack.'}
                    </p>

                    <div className="mt-auto space-y-4">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <div className="text-2xl font-black text-amber-300">{formatPrice(item.price)} EUR</div>
                          <div className="text-xs text-gray-500">PayPal payment</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-white">{safeNumber(item.points).toLocaleString()}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuy(item)}
                        disabled={isBuying || captureRunning}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-black text-black hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
                      >
                        {isBuying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Redirecting...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" /> Buy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5 text-sm text-green-100 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
          <p>
            Points are credited only after server-side PayPal confirmation. You may need to relog in-game to refresh the shop balance.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5 text-xs text-gray-500 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          No credit is applied on click. Credit is applied only after PayPal capture is validated server-side.
        </div>
      </div>
    </section>
  )
}
