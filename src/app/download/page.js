'use client'
import { useEffect, useState } from 'react'
import { Download, Monitor, Cpu, HardDrive, MemoryStick, Zap, Shield, CheckCircle, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react'
import { SiMega, SiMediafire } from 'react-icons/si'
import { FaGoogleDrive } from 'react-icons/fa'

export default function DownloadPage() {
  const [links, setLinks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/downloads')
      .then((res) => res.json())
      .then((data) => {
        setLinks(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Could not load links:', err)
        setIsLoading(false)
      })
  }, [])

  const getIcon = (type) => {
    switch (type) {
      case 'mega':
        return <SiMega className="text-white text-2xl" />
      case 'mediafire':
        return <SiMediafire className="text-white text-2xl" />
      case 'google':
        return <FaGoogleDrive className="text-white text-2xl" />
      default:
        return <Download className="text-white text-2xl" />
    }
  }

  const getGradient = (type) => {
    switch (type) {
      case 'mega':
        return 'from-red-500 via-red-600 to-red-700'
      case 'mediafire':
        return 'from-blue-500 via-blue-600 to-blue-700'
      case 'google':
        return 'from-green-500 via-green-600 to-green-700'
      default:
        return 'from-gray-500 via-gray-600 to-gray-700'
    }
  }

  const getDescription = (type) => {
    switch (type) {
      case 'mega':
        return 'High speed with resume support'
      case 'mediafire':
        return 'Free and reliable mirror'
      case 'google':
        return 'Fast and reliable source'
      default:
        return 'Click to download'
    }
  }

  const minSpecs = [
    { icon: Cpu, label: 'Processor', value: 'Intel Pentium G3420 or AMD Phenom II X2 550' },
    { icon: Monitor, label: 'Graphics card', value: 'NVIDIA GeForce 210 or AMD Radeon HD 5450' },
    { icon: MemoryStick, label: 'Memory', value: '2 GB RAM' },
    { icon: HardDrive, label: 'Storage', value: '10 GB' },
    { icon: Shield, label: 'OS', value: 'Windows 10 64-bit' },
    { icon: Zap, label: 'DirectX', value: 'DirectX 11' },
  ]
  const recSpecs = [
    { icon: Cpu, label: 'Processor', value: 'Intel Core i3-4130 or AMD FX-6300' },
    { icon: Monitor, label: 'Graphics card', value: 'NVIDIA GeForce GT 610 or AMD Radeon HD 6570' },
    { icon: MemoryStick, label: 'Memory', value: '4 GB RAM' },
    { icon: HardDrive, label: 'Storage', value: '10 GB (SSD)' },
    { icon: Shield, label: 'OS', value: 'Windows 10 64-bit' },
    { icon: Zap, label: 'DirectX', value: 'DirectX 12' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <img src="/bg.png" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black/70 z-[1]" />

      <div className="relative z-10 pt-24 sm:pt-28 px-4 sm:px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-800">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Download Eternal MMO : Genesis</h1>
              <p className="text-sm text-gray-500 mt-1">Choose a mirror and check the system requirements below.</p>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors shrink-0"
            >
              Need help?
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-4 order-2 lg:order-1">
              <div className="bg-gray-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-xl sticky top-24">
                <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm font-bold text-white">System requirements</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-semibold text-red-400 uppercase">Minimum</span>
                    </div>
                    <ul className="space-y-1.5">
                      {minSpecs.map(({ icon: Icon, value }) => (
                        <li key={value} className="flex items-center gap-2 text-xs text-gray-400">
                          <Icon className="w-3.5 h-3.5 text-red-400/80 flex-shrink-0" />
                          <span>{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-semibold text-green-400 uppercase">Recommended</span>
                    </div>
                    <ul className="space-y-1.5">
                      {recSpecs.map(({ icon: Icon, value }) => (
                        <li key={value} className="flex items-center gap-2 text-xs text-gray-400">
                          <Icon className="w-3.5 h-3.5 text-green-400/80 flex-shrink-0" />
                          <span>{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 order-1 lg:order-2">
              <div className="bg-gray-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm font-bold text-white">Download clients</h2>
                </div>
                <div className="divide-y divide-gray-800">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                        <div className="h-10 w-10 bg-gray-700 rounded-lg" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
                          <div className="h-3 bg-gray-700 rounded w-2/3" />
                        </div>
                        <div className="h-9 w-24 bg-gray-700 rounded-lg" />
                      </div>
                    ))
                  ) : links.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No download links available.</div>
                  ) : (
                    links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 hover:bg-gray-800/60 transition-colors group"
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${getGradient(link.icon_type)} shrink-0`}>
                          {getIcon(link.icon_type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">{link.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{getDescription(link.icon_type)}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 shrink-0 text-xs font-semibold text-black bg-amber-500 px-3 py-2 rounded-lg border border-amber-400 group-hover:bg-amber-400 transition-colors">
                          Download
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}