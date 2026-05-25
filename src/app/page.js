"use client";

import ParticlesBackground from "@/components/ParticlesBackground";
import {
  ArrowDownToLine,
  CalendarDays,
  Crown,
  Download,
  Gift,
  Layers,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

const featureCards = [
  { image: "/assets/home/feature-progression.png", icon: Zap, title: "Fast Progression", desc: "Level up fast and unlock powerful skills and gear." },
  { image: "/assets/home/feature-pvp.png", icon: Swords, title: "PvP Arena", desc: "Compete in intense real-time PvP battles." },
  { image: "/assets/home/feature-raids.png", icon: Shield, title: "Raids & Bosses", desc: "Team up and defeat epic world bosses." },
  { image: "/assets/home/feature-wings.png", icon: Sparkles, title: "Custom Wings", desc: "Collect and upgrade stunning wings." },
  { image: "/assets/home/feature-events.png", icon: Gift, title: "Events", desc: "Join events and earn exclusive rewards." },
  { image: "/assets/home/feature-rankings.png", icon: Crown, title: "Rankings", desc: "Climb the ranks and become a legend." },
];

const newsCards = [
  { tag: "NEW", title: "Grand Launch Is Live!", desc: "Eternal MMO : Genesis is officially live. Jump in now and begin your legend.", meta: "News" },
  { tag: "UPDATE", title: "Patch v1.0.0 - Genesis", desc: "New features, balance updates, and bug fixes for a smoother adventure.", meta: "Updates" },
  { tag: "EVENT", title: "Double EXP Weekend", desc: "Enjoy boosted progress and prepare your character for battle.", meta: "Events" },
];

const classCards = [
  { image: "/assets/home/class-blade-master.png", name: "Slayer" },
  { image: "/assets/home/class-elementor.png", name: "Arcanist" },
  { image: "/assets/home/class-ranger.png", name: "Crackshooter" },
  { image: "/assets/home/class-crusader.png", name: "Templar" },
  { image: "/assets/home/class-acrobat.png", name: "Harlequin" },
  { image: "/assets/home/class-psykeeper.png", name: "Mentalist" },
  { image: "/assets/home/class-force-master.png", name: "Force Master" },
];

const topPlayers = [
  ["1", "GenesisKing", "Blade", "Lv. 150", "42,589"],
  ["2", "SkyHunter", "Ranger", "Lv. 150", "38,764"],
  ["3", "BladeOfEternity", "Knight", "Lv. 149", "35,201"],
  ["4", "DarkSavior", "Psykeeper", "Lv. 149", "31,987"],
  ["5", "Moonlight", "Elementor", "Lv. 148", "29,450"],
];

export default function HomePage() {
  const [status, setStatus] = useState({
    status: "online",
    playersOnline: 0,
    totalAccounts: 0,
  });

  useEffect(() => {
    fetch("/api/server-status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setStatus({
            status: data.status || "online",
            playersOnline: Number(data.playersOnline || 0),
            totalAccounts: Number(data.totalAccounts || 0),
          });
        }
      })
      .catch(() => {});
  }, []);

  const online = status.status === "online";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020711] text-white">
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/bg.png"
          className="h-full w-full object-cover object-center"
          aria-hidden="true"
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_58%_at_50%_10%,rgba(0,90,150,0.15),rgba(1,8,20,0.68)_58%,rgba(0,0,0,0.96)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#020711]/76 to-[#020711]" />
      </div>

      <ParticlesBackground />

      <section id="home" className="relative z-10 px-4 pb-10 pt-28 sm:px-6 lg:pt-24">
        <div className="mx-auto flex min-h-[620px] max-w-7xl flex-col items-center justify-center text-center">
          <img
            src="/newlogo.png"
            alt="Eternal MMO : Genesis"
            className="h-auto w-full max-w-[430px] object-contain drop-shadow-[0_0_36px_rgba(0,212,255,0.35)]"
          />

          <p className="mt-5 font-serif text-3xl font-bold uppercase tracking-[0.18em] text-stone-100 sm:text-4xl">
            Awaken The Genesis
          </p>
          <p className="mt-3 max-w-2xl text-xs font-bold uppercase tracking-[0.42em] text-slate-200 sm:text-sm">
            A new FlyFF-inspired MMORPG adventure
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.4em] text-slate-300 sm:text-sm">
            Rise. Fight. Evolve.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/register"
              className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-md border border-amber-200/60 bg-gradient-to-r from-amber-500 to-amber-300 px-7 py-3 text-sm font-black uppercase tracking-[0.08em] text-black shadow-[0_0_30px_rgba(245,158,11,0.32)] transition hover:from-amber-400 hover:to-amber-200"
            >
              <UserPlus className="h-4 w-4" />
              Play now
            </a>
            <a
              href="/download"
              className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-md border border-cyan-200/45 bg-cyan-400/10 px-7 py-3 text-sm font-black uppercase tracking-[0.08em] text-cyan-100 shadow-[0_0_28px_rgba(0,212,255,0.22)] transition hover:bg-cyan-300/18"
            >
              <ArrowDownToLine className="h-4 w-4" />
              Download client
            </a>
          </div>
        </div>

        <div className="mx-auto -mt-7 max-w-6xl rounded-lg border border-amber-300/35 bg-[#03101d]/82 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.48)] backdrop-blur-xl">
          <div className="grid gap-4 md:grid-cols-4 md:divide-x md:divide-amber-200/15">
            <StatusItem icon={Users} label="Online Players" value={status.playersOnline.toLocaleString()} sub={`${status.totalAccounts.toLocaleString()} accounts`} />
            <StatusItem icon={Shield} label="Server Status" value={online ? "Online" : "Offline"} sub={online ? "All systems operational" : "Checking server"} valueClass={online ? "text-emerald-300" : "text-red-300"} />
            <StatusItem icon={Layers} label="Game Version" value="v1.0.0" sub="Genesis launch" />
            <StatusItem icon={CalendarDays} label="Latest Patch" value="May 18, 2025" sub="Patch notes" />
          </div>
        </div>
      </section>

      <ContentShell>
        <SectionTitle>Game Features</SectionTitle>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {featureCards.map(({ image, icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-lg border border-amber-300/24 bg-[#06101d]/82 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-amber-300/55 hover:bg-[#091b2d]/86">
              <div className="relative mx-auto mb-3 aspect-[1.65] overflow-hidden rounded-md border border-white/8 bg-black">
                <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/12 to-transparent" />
                <div className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-md border border-amber-300/35 bg-black/55">
                  <Icon className="h-4 w-4 text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]" />
                </div>
              </div>
              <h3 className="font-serif text-sm font-bold uppercase tracking-[0.08em] text-amber-200">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-300">{desc}</p>
            </div>
          ))}
        </div>

        <SectionHeader title="Latest News & Updates" href="/posts" action="View all news" />
        <div className="grid gap-3 lg:grid-cols-3">
          {newsCards.map((news) => (
            <article key={news.title} className="overflow-hidden rounded-lg border border-amber-300/24 bg-[#06101d]/86">
              <div className="relative h-24 bg-[url('/bg.png')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/10" />
                <span className="absolute left-3 top-3 rounded bg-amber-500 px-2 py-1 text-[10px] font-black text-black">{news.tag}</span>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-base font-bold uppercase tracking-[0.08em] text-white">{news.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{news.desc}</p>
                <p className="mt-3 text-xs text-amber-300">May 18, 2025 <span className="mx-2 text-slate-600">|</span> {news.meta}</p>
              </div>
            </article>
          ))}
        </div>

        <SectionTitle>Choose Your Class</SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {classCards.map(({ image, name }, index) => (
            <div key={name} className="rounded-lg border border-amber-300/24 bg-[#06101d]/86 p-2">
              <div className="relative aspect-[0.92] overflow-hidden rounded-md bg-black">
                <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-300 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-2 right-2 text-center">
                  <h3 className="font-serif text-xs font-bold uppercase tracking-[0.08em] text-white">{name}</h3>
                  <div className="mx-auto mt-2 grid h-8 w-8 place-items-center rounded-full border border-amber-300/50 bg-black/45 text-amber-300">
                    {index + 1}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-lg border border-amber-300/24 bg-[#06101d]/86 p-4">
            <SectionHeader title="Top Players" href="/ranking" action="View rankings" compact />
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  <tr>
                    <th className="py-3">Rank</th>
                    <th>Player</th>
                    <th>Class</th>
                    <th>Level</th>
                    <th className="text-right">PvP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {topPlayers.map(([rank, player, cls, level, points]) => (
                    <tr key={player} className="text-slate-200">
                      <td className="py-2 font-black text-amber-300">{rank}</td>
                      <td className="font-semibold">{player}</td>
                      <td>{cls}</td>
                      <td>{level}</td>
                      <td className="text-right">{points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-amber-300/24 bg-[#06101d]/86 p-4">
            <SectionHeader title="Premium Shop" href="/shops" action="View shop" compact />
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
              Enhance your adventure with exclusive items, boosts, cosmetics, and account upgrades.
            </p>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[Gift, Sparkles, Shield, Star].map((Icon, index) => (
                <div key={index} className="grid aspect-square place-items-center rounded-md border border-white/10 bg-[url('/bg.png')] bg-cover bg-center">
                  <div className="grid h-full w-full place-items-center bg-black/55">
                    <Icon className="h-8 w-8 text-amber-300" />
                  </div>
                </div>
              ))}
            </div>
            <a href="/shops" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-amber-200/55 bg-gradient-to-r from-amber-500 to-amber-300 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">
              <Trophy className="h-4 w-4" />
              Top-up now
            </a>
          </div>
        </div>
      </ContentShell>

      <footer className="relative z-10 border-t border-white/10 bg-[#020711]/95 px-4 py-8 text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <img src="/newlogo.png" alt="Eternal MMO : Genesis" className="h-auto w-28 object-contain" />
            <h2 className="mt-3 text-xl font-black text-white">Eternal MMO</h2>
            <p className="mt-2 max-w-xs text-sm leading-6">Eternal MMO : Genesis is a FlyFF-inspired MMORPG where your legend begins.</p>
          </div>
          <FooterLinks title="Game" links={["Home", "Download", "Rankings", "Shop"]} />
          <FooterLinks title="Community" links={["News", "Events", "Forums", "Discord"]} />
          <FooterLinks title="Support" links={["Help Center", "Guides", "FAQ", "Contact Us"]} />
        </div>
        <p className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-4 text-center text-xs">
          © 2026 Eternal MMO : Genesis. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

function ContentShell({ children }) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl space-y-7 px-4 pb-14 sm:px-6">
      {children}
    </section>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300/45" />
      <h2 className="font-serif text-xl font-bold uppercase tracking-[0.16em] text-white">{children}</h2>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300/45" />
    </div>
  );
}

function SectionHeader({ title, href, action, compact = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${compact ? "" : "border-t border-amber-300/18 pt-5"}`}>
      <h2 className="font-serif text-xl font-bold uppercase tracking-[0.12em] text-white">{title}</h2>
      <a href={href} className="rounded-md border border-amber-300/35 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-200 hover:bg-amber-300/10">
        {action}
      </a>
    </div>
  );
}

function StatusItem({ icon: Icon, label, value, sub, valueClass = "text-amber-300" }) {
  return (
    <div className="flex items-center gap-4 md:px-4">
      <Icon className="h-8 w-8 shrink-0 text-amber-300" />
      <div className="min-w-0 text-left">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">{label}</p>
        <p className={`mt-1 text-lg font-black uppercase ${valueClass}`}>{value}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

function FooterLinks({ title, links }) {
  return (
    <div>
      <h3 className="font-serif text-sm font-bold uppercase tracking-[0.16em] text-slate-200">{title}</h3>
      <div className="mt-3 grid gap-2 text-sm">
        {links.map((link) => (
          <a key={link} href={link === "Home" ? "/" : `/${link.toLowerCase().replaceAll(" ", "-")}`} className="hover:text-amber-300">
            {link}
          </a>
        ))}
      </div>
    </div>
  );
}
