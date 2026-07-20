import LineChartOne from "../charts/line/LineChartOne";
import BarChartOne from "../charts/bar/BarChartOne";

export default function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Top Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4 Stat Boxes (2x2 Grid) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 grid grid-cols-2 gap-3 min-w-0">
          <div className="bg-[#f0f7ff] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">IEP GOAL MASTERY</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">62%</h3>
            <p className="text-xs text-gray-500 leading-tight">8 of 13 goals on track<br/><span className="text-gray-500">+8% this month</span></p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">SESSIONS THIS MONTH</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">14</h3>
            <p className="text-xs text-gray-500 leading-tight">OT: 6 Speech: 5 ABA: 3<br/>vs 11 last month</p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">PENDING REVIEWS</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">3</h3>
            <p className="text-xs text-gray-500 leading-tight">2 labs 1 genetic result<br/>Needs attention</p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">LAST ASSESSMENT</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">18 days</h3>
            <p className="text-xs text-gray-500 leading-tight">ADOS-2-Apr 12, 2026<br/>Next due Jun 2026</p>
          </div>
        </div>

        {/* Session Frequency Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-0 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#575757] text-lg">Session Frequency</h3>
              <p className="text-xs text-gray-500">Weekly sessions across all therapies</p>
            </div>
            <span className="text-xs font-medium text-[#ea580c] bg-[#fff7ed] px-2 py-1 rounded">Last 8 Weeks</span>
          </div>
          <div className="flex-1 -ml-2 -mb-2">
            <LineChartOne />
          </div>
        </div>
      </div>

      {/* IEP Goal Progress Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div>
          <h3 className="font-bold text-[#575757] text-lg">IEP Goal Progress by Domain</h3>
          <p className="text-xs text-gray-500 mb-4">% of goals on track per domain</p>
        </div>
        <div className="h-[250px]">
          <BarChartOne />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-[#575757] text-lg mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {[
              { time: "10:30 AM", title: "Arjun Krishnamurthy", subtitle: "OT Session Dr. Priya Lal" },
              { time: "11:30 AM", title: "Myra Iyer Speech", subtitle: "Therapy Nandita Kumar" },
              { time: "12:30 AM", title: "Vivaan Singh", subtitle: "Psychology Session Dr. Reena Kapoor" },
            ].map((apt, i) => (
              <div key={i} className="flex items-center gap-4 border border-gray-100 rounded-lg p-3">
                <div className="w-20 text-xs font-semibold text-gray-500 border-r border-gray-100 pr-3">{apt.time}</div>
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-[#575757] leading-tight">{apt.title}</p>
                  <p className="text-xs text-gray-500">{apt.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consent Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-[#575757] text-lg mb-4">Consent Requests</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 border border-gray-100 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-[#575757] leading-tight">Arjun Krishnamurthy</p>
                  <p className="text-xs text-gray-500">Requested on May 18, 2026</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-[#575757] text-lg mb-4">Recent Activity</h3>
        <div className="space-y-0">
          {[
            { title: "Session note submitted for Communication goal C-04", subtitle: "Nandita Kumar Speech Therapist", time: "2h ago" },
            { title: "Organic acids panel results uploaded", subtitle: "Dr. Ananya Varma Biomedical", time: "2h ago" },
            { title: "IEP goal C-07 (Emotional Regulation) status updated to In Progress", subtitle: "Dr. Reena Kapoor Clin. Psychologist", time: "2h ago" },
            { title: "New message from Dr. Suresh Mehta re: medication review", subtitle: "Dr. Suresh Mehta Pediatrician", time: "2h ago" },
            { title: "Chromosomal microarray report flagged for review", subtitle: "Dr. Ananya Varma Biomedical", time: "2h ago" },
            { title: "OT session note: Improved pencil grip, fine motor baseline updated", subtitle: "Priya Lal OT Therapist", time: "2h ago" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-[#575757] leading-tight">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.subtitle}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
