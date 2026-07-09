import React from "react";
import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router";

// ─── SVG Icons ──────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function PaperclipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Stat Icons
function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Category Icons
function LightningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function MortarboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const stats = [
  { label: "Total Submitted", value: "5", icon: <HomeIcon />, color: "#7db9fb", bg: "#f0f6fe" },
  { label: "Pending Review", value: "1", icon: <ClockIcon />, color: "#f79009", bg: "#fffaeb" },
  { label: "Actioned", value: "2", icon: <CheckCircleIcon />, color: "#12b76a", bg: "#ecfdf3" },
  { label: "This Month", value: "0", icon: <CalendarIcon />, color: "#7a5af8", bg: "#f4f3ff" },
];

const observations = [
  {
    title: "Increased meltdowns during transitions",
    category: "Behavior",
    date: "Jun 28, 2025",
    daysAgo: "375 days ago",
    description: "Aiden had three significant meltdowns today when transitioning between activities — from breakfast to getting dressed, from the car to school, and from school to home. Each lasted about 10–15 minutes. He was inconsolable until we provided deep pressure via a weighted blanket.",
    attachments: 1,
    status: "Acknowledged",
    icon: <LightningIcon />,
    iconColor: "#f79009",
    iconBg: "#fffaeb",
    statusBadge: "bg-[#f4f3ff] text-[#7a5af8]",
    statusIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    )
  },
  {
    title: "Spontaneous two-word phrases at dinner",
    category: "Communication",
    date: "Jun 25, 2025",
    daysAgo: "378 days ago",
    description: 'For the first time, Aiden used two-word combinations spontaneously during dinner: "more juice" and "all done" without prompting. He made eye contact while saying it and smiled when we responded. This is a big step forward from his usual single-word requests.',
    attachments: 0,
    status: "Actioned",
    icon: <BookIcon />,
    iconColor: "#7db9fb",
    iconBg: "#f0f6fe",
    statusBadge: "bg-[#ecfdf3] text-[#12b76a]",
    statusIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    )
  },
  {
    title: "Hypersensitivity to clothing tags",
    category: "Sensory Response",
    date: "Jun 22, 2025",
    daysAgo: "382 days ago",
    description: "Getting dressed has become a 30-minute battle every morning. Aiden refuses to wear any shirt with a tag and screams when fabric touches his neck. We have started buying tagless clothing but even seams on socks are causing distress.",
    attachments: 1,
    status: "Viewed",
    icon: <PulseIcon />,
    iconColor: "#f79009",
    iconBg: "#fffaeb",
    statusBadge: "bg-[#fffaeb] text-[#f79009]",
    statusIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    )
  },
  {
    title: "Parallel play with neighbor child",
    category: "Social Interaction",
    date: "Jun 18, 2025",
    daysAgo: "385 days ago",
    description: "Aiden played in the backyard alongside our neighbor's son (age 6) for nearly 40 minutes without any intervention needed. While they were not directly interacting, he tolerated the proximity and even glanced at the other child several times. No aggression or withdrawal.",
    attachments: 1,
    status: "Actioned",
    icon: <UsersIcon />,
    iconColor: "#12b76a",
    iconBg: "#ecfdf3",
    statusBadge: "bg-[#ecfdf3] text-[#12b76a]",
    statusIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    )
  },
  {
    title: "Difficulty with homework focus",
    category: "Learning",
    date: "Jun 15, 2025",
    daysAgo: "388 days ago",
    description: "Aiden could not sit for more than 3 minutes on his homework today. He kept getting up to spin or flap. We tried the visual timer strategy from the therapist but it did not help tonight. The homework itself was math — which he usually enjoys.",
    attachments: 0,
    status: "Submitted",
    icon: <MortarboardIcon />,
    iconColor: "#7a5af8",
    iconBg: "#f4f3ff",
    statusBadge: "bg-[#f0f6fe] text-[#7db9fb]",
    statusIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    )
  }
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function HomeObservations() {
  return (
    <>
      <PageMeta
        title="Home Observations | NeuroCare"
        description="Record and share what you notice at home with your child's care team."
      />

      <div
        className="min-h-screen bg-[#f8fafc] -mx-4 md:-mx-6 -my-4 md:-my-6 p-[32px]"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-[32px] gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-gray-900 leading-tight">
              Home Observations
            </h1>
            <p className="text-[16px] text-gray-500 mt-1">
              Record and share what you notice at home with your child's care team.
            </p>
          </div>
          <button
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white text-[15px] font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98] shadow-sm"
            style={{ backgroundColor: "#7db9fb" }}
          >
            <PlusIcon />
            New Observation
          </button>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] mb-[24px]">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-[20px] flex flex-row items-center gap-[16px]">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.bg, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div>
                <div className="text-[24px] font-bold text-gray-900 leading-none mb-1">{stat.value}</div>
                <div className="text-[14px] text-gray-500 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── List Section ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
          
          {/* Filters */}
          <div className="p-[20px] border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search observations..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7db9fb]/20 focus:border-[#7db9fb] text-[14px] transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <select className="block w-full sm:w-[140px] pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7db9fb]/20 focus:border-[#7db9fb] text-[14px] appearance-none cursor-pointer transition-colors">
                  <option>All Statuses</option>
                  <option>Actioned</option>
                  <option>Pending</option>
                  <option>Acknowledged</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDownIcon />
                </div>
              </div>
              <div className="relative w-full sm:w-auto">
                <select className="block w-full sm:w-[160px] pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7db9fb]/20 focus:border-[#7db9fb] text-[14px] appearance-none cursor-pointer transition-colors">
                  <option>All Categories</option>
                  <option>Behavior</option>
                  <option>Communication</option>
                  <option>Learning</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>
          </div>

          {/* List Items */}
          <div className="flex flex-col divide-y divide-gray-100">
            {observations.map((obs, idx) => (
              <div key={idx} className="p-[20px] sm:p-[24px] hover:bg-gray-50/50 transition-colors flex gap-[16px] sm:gap-[24px] cursor-pointer group">
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ backgroundColor: obs.iconBg, color: obs.iconColor }}
                >
                  {obs.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1.5">
                    <div>
                      <h3 className="text-[16px] sm:text-[18px] font-semibold text-gray-900 leading-snug group-hover:text-[#7db9fb] transition-colors">
                        {obs.title}
                      </h3>
                      <div className="flex items-center flex-wrap gap-2 text-[14px] text-gray-500 mt-1">
                        <span className="font-medium text-gray-600">{obs.category}</span>
                        <span>·</span>
                        <span>{obs.date}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline text-gray-400">{obs.daysAgo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium ${obs.statusBadge}`}>
                        {obs.statusIcon}
                        {obs.status}
                      </span>
                      <div className="text-gray-300 group-hover:text-gray-400 transition-colors hidden sm:block">
                        <ChevronRightIcon />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[14px] text-gray-600 mt-3 leading-relaxed">
                    {obs.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    {obs.attachments > 0 && (
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-500 font-medium">
                        <PaperclipIcon />
                        {obs.attachments} attachment{obs.attachments !== 1 ? 's' : ''}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {/* Placeholder for staff interaction icons */}
                      {idx !== 1 && idx !== 4 && (
                        <>
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <UserIcon />
                          </div>
                          {idx === 0 || idx === 2 || idx === 3 ? (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                              <EyeIcon />
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </>
  );
}
