'use client'

import { useEffect, useState } from 'react'
import {
  Server,
  Settings,
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  Signal,
  Gauge,
  Globe,
  Users as UsersIcon,
  Timer
} from 'lucide-react'

const EXP_RATE = process.env.NEXT_PUBLIC_EXP_RATE || 'High x9999'
const PENYA_RATE = process.env.NEXT_PUBLIC_PENYA_RATE || 'High x9999'
const DROP_RATE = process.env.NEXT_PUBLIC_DROP_RATE || 'High x9999'

export default function ServerStats() {
  const [dateTime, setDateTime] = useState(new Date())
  const [serverStatus, setServerStatus] = useState('offline')
  const [playersOnline, setPlayersOnline] = useState(0)
  const [activeGuilds, setActiveGuilds] = useState(0)
  const [totalAccounts, setTotalAccounts] = useState(0)
  const [totalCharacters, setTotalCharacters] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let stopped = false
    let currentController = null

    const setOffline = () => {
      if (stopped) return
      setServerStatus('offline')
      setPlayersOnline(0)
      setActiveGuilds(0)
      setTotalAccounts(0)
      setTotalCharacters(0)
    }

    const fetchStatus = async () => {
      if (currentController) {
        currentController.abort()
      }

      const controller = new AbortController()
      currentController = controller
      const timeout = setTimeout(() => controller.abort(), 8000)

      try {
        const res = await fetch('/api/server-status', {
          cache: 'no-store',
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()

        if (stopped) return

        if (data.success) {
          setServerStatus(data.status || 'online')
          setPlayersOnline(Number(data.playersOnline || 0))
          setActiveGuilds(Number(data.activeGuilds || 0))
          setTotalAccounts(Number(data.totalAccounts || 0))
          setTotalCharacters(Number(data.totalCharacters || 0))
        } else {
          setOffline()
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Could not retrieve server status:', error)
        }
        setOffline()
      } finally {
        clearTimeout(timeout)
        if (!stopped) {
          setLoading(false)
        }
      }
    }

    fetchStatus()

    const interval = setInterval(fetchStatus, 30000)

    return () => {
      stopped = true
      clearInterval(interval)
      if (currentController) {
        currentController.abort()
      }
    }
  }, [])

  const timeString = dateTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const dateString = dateTime.toLocaleDateString([], {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const minimumRequirements = [
    { label: 'CPU', value: 'Intel Pentium G3420 or AMD Phenom II X2 550', icon: <Cpu className="w-4 h-4" /> },
    { label: 'GPU', value: 'NVIDIA GeForce 210 or AMD Radeon HD 5450', icon: <Monitor className="w-4 h-4" /> },
    { label: 'RAM', value: '2 GB RAM', icon: <MemoryStick className="w-4 h-4" /> },
    { label: 'Storage', value: '10 GB available space', icon: <HardDrive className="w-4 h-4" /> },
    { label: 'OS', value: 'Windows 10 64-bit', icon: <Settings className="w-4 h-4" /> },
    { label: 'DirectX', value: 'DirectX 11', icon: <Server className="w-4 h-4" /> }
  ]

  const recommendedRequirements = [
    { label: 'CPU', value: 'Intel Core i3-4130 or AMD FX-6300', icon: <Cpu className="w-4 h-4" /> },
    { label: 'GPU', value: 'NVIDIA GeForce GT 610 or AMD Radeon HD 6570', icon: <Monitor className="w-4 h-4" /> },
    { label: 'RAM', value: '4 GB RAM', icon: <MemoryStick className="w-4 h-4" /> },
    { label: 'Storage', value: '10 GB available space (SSD optional)', icon: <HardDrive className="w-4 h-4" /> },
    { label: 'OS', value: 'Windows 10 64-bit', icon: <Settings className="w-4 h-4" /> },
    { label: 'DirectX', value: 'DirectX 12', icon: <Server className="w-4 h-4" /> }
  ]

  return (
    <section className="py-10 bg-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-400 mb-1">Server statistics</h2>
          <p className="text-sm text-gray-400">Status, rates, and system requirements</p>
        </div>

        <div className="bg-gray-900 border border-blue-500 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <Signal className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">Live</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Status</span>
                <span className={`text-sm font-semibold ${serverStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                  {serverStatus === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Players</span>
                <span className="text-sm font-semibold text-green-400">
                  {loading ? '...' : playersOnline}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">{timeString}</span>
                <span className="text-xs text-gray-500">{dateString}</span>
              </div>

              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">Uptime</span>
                <span className="text-sm font-semibold text-yellow-400">99.9%</span>
              </div>

              <div className="border-l border-gray-600 pl-4 flex items-center gap-3">
                <span className="text-xs text-gray-500">Rates :</span>
                <span className="text-xs text-blue-400 font-medium">EXP {EXP_RATE}</span>
                <span className="text-xs text-green-400 font-medium">Drop {DROP_RATE}</span>
                <span className="text-xs text-yellow-400 font-medium">Penya {PENYA_RATE}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-blue-500/40 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Minimum requirements</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {minimumRequirements.map((item) => (
              <div key={item.label} className="flex items-start gap-3 bg-black/30 rounded-lg p-3 border border-white/5">
                <span className="text-blue-400 mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
                  <p className="text-sm text-gray-200">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-green-500/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Recommended requirements</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendedRequirements.map((item) => (
              <div key={item.label} className="flex items-start gap-3 bg-black/30 rounded-lg p-3 border border-white/5">
                <span className="text-green-400 mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
                  <p className="text-sm text-gray-200">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
