import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-300 border-t border-white/10 px-6 pt-12 pb-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h4 className="text-white font-semibold mb-3 uppercase tracking-wide">Account</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/register" className="flex items-center gap-1 hover:text-yellow-400">
                <ChevronRight className="w-4 h-4" /> Register
              </a>
            </li>
            <li>
              <a href="/login" className="flex items-center gap-1 hover:text-yellow-400">
                <ChevronRight className="w-4 h-4" /> Log in
              </a>
            </li>
            <li>
              <a href="/download" className="flex items-center gap-1 hover:text-yellow-400">
                <ChevronRight className="w-4 h-4" /> Download client
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 uppercase tracking-wide">Community</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/forum" className="flex items-center gap-1 hover:text-yellow-400">
                <ChevronRight className="w-4 h-4" /> Forum
              </a>
            </li>
            <li>
              <a
                href="https://discord.gg/Qq4KManJSn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-yellow-400"
              >
                <ChevronRight className="w-4 h-4" /> Discord
              </a>
            </li>
            <li>
              <a href="/rankings" className="flex items-center gap-1 hover:text-yellow-400">
                <ChevronRight className="w-4 h-4" /> Rankings
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 uppercase tracking-wide">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/help" className="flex items-center gap-1 hover:text-yellow-400">
                <ChevronRight className="w-4 h-4" /> Help center
              </a>
            </li>
            <li>
              <a href="/contact" className="flex items-center gap-1 hover:text-yellow-400">
                <ChevronRight className="w-4 h-4" /> Contact us
              </a>
            </li>
            <li>
              <a href="/bug-report" className="flex items-center gap-1 hover:text-yellow-400">
                <ChevronRight className="w-4 h-4" /> Report a bug
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-start md:items-center text-left md:text-center space-y-3">
          <Image
            src="/newlogo.png"
            alt="Logo Eternal MMO : Genesis"
            width={110}
            height={110}
            className="object-contain drop-shadow-md"
          />
          <p className="text-sm text-gray-400">(c) 2026 Eternal MMO : Genesis. All rights reserved.</p>
          <p className="text-xs text-gray-500">A community-powered MMORPG experience</p>
        </div>
      </div>
    </footer>
  )
}
