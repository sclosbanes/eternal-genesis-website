'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'

export default function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('All fields are required.')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('The new password and confirmation do not match.')
      return
    }

    if (newPassword.length < 8) {
      alert('The new password must contain at least 8 characters.')
      return
    }

    alert('Password updated successfully!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[#0c0f1c] border border-white/5 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={18} className="text-yellow-400" />
        <h2 className="text-white font-semibold text-md">Security</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Current password</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-md bg-[#1f2937] text-white placeholder-gray-400 border border-gray-600 focus:outline-none"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">New password</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-md bg-[#1f2937] text-white placeholder-gray-400 border border-gray-600 focus:outline-none"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Confirm password</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-md bg-[#1f2937] text-white placeholder-gray-400 border border-gray-600 focus:outline-none"
            placeholder="Confirm the new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handlePasswordUpdate}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Update password
        </button>
      </div>
    </div>
  )
}