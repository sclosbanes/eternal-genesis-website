'use client'

import { useState } from 'react'
import { Swords, Shield, Wand2, Footprints, Quote } from 'lucide-react'

const ACCENT_COLORS = {
  'blue-500': '#3b82f6',
  'red-500': '#ef4444',
  'green-500': '#22c55e',
  'amber-500': '#f59e0b',
  'purple-500': '#a855f7',
  'indigo-500': '#6366f1',
  'slate-500': '#64748b',
  'pink-500': '#ec4899',
}

const ROLE_TIPS = {
  Tank: 'In dungeons and Guild Siege, tanks hold aggro and absorb damage so the party can farm safely.',
  DPS: 'High single-target and burst damage for PvP, bosses, solo leveling, and guild wars.',
  'Ranged DPS': 'Farms safely from range and brings steady damage without standing in melee range.',
  Support: 'Heals and buffs make this role essential for party leveling, dungeons, and guild content.',
  'Mage DPS': 'Excellent for AoE farming, dungeon clearing, and fast EXP or Penya gains.',
  Hybrid: 'Flexible enough to buff, tank, and deal damage depending on the party setup.',
}

const flyffClasses = [
  { id: 'knight', name: 'Knight', icon: 'K', role: 'Tank', longDescription: 'The Knight is a defense-focused second job that protects parties with shields, heavy armor, and strong defensive tools.', stats: { attack: 85, defense: 95, magic: 30, speed: 60 }, skills: ['Shield Block', 'Taunt', 'Guardian', 'Iron Will'], accent: 'blue-500' },
  { id: 'blade', name: 'Blade', icon: 'B', role: 'DPS', longDescription: 'The Blade specializes in dual-wield burst damage and excels in solo leveling, boss fights, PvP, and fast Penya farming.', stats: { attack: 95, defense: 70, magic: 40, speed: 90 }, skills: ['Backstab', 'Dual Wield', 'Shadow Step', 'Assassinate'], accent: 'red-500' },
  { id: 'ranger', name: 'Ranger', icon: 'R', role: 'Ranged DPS', longDescription: 'The Ranger fights from a distance, kites monsters, and brings reliable damage to PvE and PvP.', stats: { attack: 90, defense: 60, magic: 50, speed: 85 }, skills: ['Precise Shot', 'Multi Arrow', 'Eagle Eye', 'Rain of Arrows'], accent: 'green-500' },
  { id: 'ringmaster', name: 'Ringmaster', icon: 'RM', role: 'Support', longDescription: 'The Ringmaster keeps parties alive with heals and buffs. It is a core class for group leveling, dungeons, and guild content.', stats: { attack: 50, defense: 65, magic: 95, speed: 70 }, skills: ['Heal', 'Bless', 'Protection', 'Resurrection'], accent: 'amber-500' },
  { id: 'elementor', name: 'Elementor', icon: 'E', role: 'Mage DPS', longDescription: 'The Elementor controls fire, ice, and lightning, dominating AoE farming and dungeon clearing with powerful area spells.', stats: { attack: 40, defense: 55, magic: 100, speed: 75 }, skills: ['Fireball', 'Ice Storm', 'Lightning Bolt', 'Meteor'], accent: 'purple-500' },
  { id: 'psykeeper', name: 'Psykeeper', icon: 'P', role: 'Mage DPS', longDescription: 'The Psykeeper uses psychic power for burst damage, control, and flexible dungeon or PvP play.', stats: { attack: 45, defense: 60, magic: 95, speed: 80 }, skills: ['Mind Control', 'Psychic Blast', 'Mental Shield', 'Reality Warp'], accent: 'indigo-500' },
  { id: 'billposter', name: 'Billposter', icon: 'BP', role: 'Hybrid', longDescription: 'The Billposter mixes melee combat, buffs, and utility. It can support a party while still dealing strong damage.', stats: { attack: 80, defense: 75, magic: 70, speed: 75 }, skills: ['Combat Buff', 'Shield Bash', 'Rally', 'Tactical Strike'], accent: 'slate-500' },
  { id: 'jester', name: 'Jester', icon: 'J', role: 'DPS', longDescription: 'The Jester is a mobile burst class with a unique yoyo style that shines in PvP, solo play, and surprise damage windows.', stats: { attack: 85, defense: 65, magic: 60, speed: 90 }, skills: ['Trick Shot', 'Confusion', 'Jester Dance', 'Surprise Attack'], accent: 'pink-500' },
]

const statConfig = [
  { key: 'attack', label: 'ATK', bar: 'bg-red-500', Icon: Swords },
  { key: 'defense', label: 'DEF', bar: 'bg-blue-500', Icon: Shield },
  { key: 'magic', label: 'MGC', bar: 'bg-purple-500', Icon: Wand2 },
  { key: 'speed', label: 'SPD', bar: 'bg-green-500', Icon: Footprints },
]

export default function Classes() {
  const [activeClass, setActiveClass] = useState(0)
  const c = flyffClasses[activeClass]
  const accentHex = ACCENT_COLORS[c.accent]

  return (
    <section className="py-14 bg-black">
      <div className="max-w-5xl mx-auto px-4">
        <header className="border-b border-gray-700 pb-3 mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">FlyFF Classes</h2>
          <p className="text-sm text-gray-500 mt-0.5">Second job classes in Madrigal. Select one to view its stats and skills.</p>
        </header>

        <div className="grid grid-cols-8 gap-1.5 sm:gap-2 mb-8">
          {flyffClasses.map((cls, i) => (
            <button
              key={cls.id}
              onClick={() => setActiveClass(i)}
              className="flex flex-col items-center gap-1 px-1 py-2.5 rounded-lg border transition-colors min-w-0"
              style={{
                borderColor: activeClass === i ? accentHex : 'rgb(55 65 81)',
                backgroundColor: activeClass === i ? 'rgba(255,255,255,0.06)' : 'transparent',
              }}
            >
              <span className="text-lg sm:text-xl leading-none" aria-hidden>{cls.icon}</span>
              <span className={`text-[10px] sm:text-xs font-medium truncate w-full text-center ${activeClass === i ? 'text-white' : 'text-gray-400'}`}>{cls.name}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 py-4 px-5 rounded-lg border-l-4" style={{ borderLeftColor: accentHex, backgroundColor: 'rgb(17 24 39)' }}>
            <span className="text-4xl" aria-hidden>{c.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white">{c.name}</h3>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: accentHex }}>
                {c.role}
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">{c.longDescription}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statConfig.map(({ key, label, bar, Icon }) => (
              <div key={key} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${c.stats[key]}%` }} />
                </div>
                <p className="text-sm font-semibold text-white mt-1">{c.stats[key]}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {c.skills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 rounded-md bg-gray-800 border border-gray-600 text-sm text-gray-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 py-3 pl-4 border-l-2 border-amber-500/60 bg-gray-900/60 rounded-r-lg">
            <Quote className="w-4 h-4 text-amber-500/80 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400 italic">{ROLE_TIPS[c.role]}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
