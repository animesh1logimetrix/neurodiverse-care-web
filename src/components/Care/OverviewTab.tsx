import { useEffect } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import LineChartOne from "../charts/line/LineChartOne";
import BarChartOne from "../charts/bar/BarChartOne";

export default function OverviewTab() {
  const { id: childId } = useParams();

  const { data: dashboardData, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", childId],
    queryFn: async () => {
      const res = await axiosClient.get(`/child/${childId}/dashboard`);
      return res.data;
    },
    enabled: !!childId,
  });

  useEffect(() => {
    if (isError) {
      const message = (error as any)?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(", ") : message || "Failed to load dashboard data.");
    }
  }, [isError, error]);

  const dashboard = dashboardData?.data || {};

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-gray-500">
        <svg className="animate-spin h-8 w-8 text-[#2DA0FF] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4 Stat Boxes (2x2 Grid) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 grid grid-cols-2 gap-3 min-w-0">
          <div className="bg-[#f0f7ff] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">IEP GOAL MASTERY</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboard.iepGoalMastery?.percentage || 0}%</h3>
            <p className="text-xs text-gray-500 leading-tight">
              {dashboard.iepGoalMastery?.goalsOnTrack || 0} of {dashboard.iepGoalMastery?.totalGoals || 0} goals on track<br/>
              <span className="text-gray-500">{dashboard.iepGoalMastery?.changePercentage > 0 ? `+${dashboard.iepGoalMastery?.changePercentage}` : (dashboard.iepGoalMastery?.changePercentage || 0)}% this month</span>
            </p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">SESSIONS THIS MONTH</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboard.sessionsThisMonth?.total || 0}</h3>
            <p className="text-xs text-gray-500 leading-tight">
              {Object.entries(dashboard.sessionsThisMonth?.byType || {}).map(([type, count]) => `${type}: ${count}`).join(' ') || "No sessions"}<br/>
            </p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">PENDING REVIEWS</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboard.pendingReviews?.total || 0}</h3>
            <p className="text-xs text-gray-500 leading-tight">
              {dashboard.pendingReviews?.pendingLabResults || 0} labs {dashboard.pendingReviews?.pendingGeneticResults || 0} genetic result<br/>
              Needs attention
            </p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">LAST ASSESSMENT</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboard.lastAssessment?.daysAgo || 0} days</h3>
            <p className="text-xs text-gray-500 leading-tight">
              {dashboard.lastAssessment?.lastAssessmentDate || "N/A"}<br/>
              Next due {dashboard.lastAssessment?.nextAssessmentDate || "N/A"}
            </p>
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
            <LineChartOne data={{
              categories: ["Mar 4", "Mar 5", "Mar 6", "Mar 7", "Mar 8", "Mar 9", "Mar 10"],
              series: [
                { name: "OT", data: [12, 18, 15, 20, 25, 22, 18] },
                { name: "Speech", data: [8, 12, 25, 18, 20, 15, 22] },
                { name: "ABA", data: [5, 8, 10, 12, 15, 10, 8] }
              ]
            }} />
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
          {/* Passing dynamic data to chart if supported */}
          <BarChartOne data={dashboard.iepGoalProgress} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-[#575757] text-lg mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {(() => {
              // Try to find the array whether it's directly upcomingAppointments or nested inside
              const aptsList = Array.isArray(dashboard.upcomingAppointments) 
                ? dashboard.upcomingAppointments 
                : (dashboard.upcomingAppointments?.appointments || dashboard.upcomingAppointments?.data || dashboard.appointments || []);

              if (aptsList.length > 0) {
                return aptsList.map((apt: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 border border-gray-100 rounded-lg p-3">
                    <div className="w-20 text-xs font-semibold text-gray-500 border-r border-gray-100 pr-3">
                      {apt.scheduledAt 
                        ? new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : (apt.time || "TBD")}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                      {apt.therapist?.profileImage && (
                        <img src={apt.therapist.profileImage} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#575757] leading-tight">
                        {apt.child?.name || apt.title || apt.patientName || apt.name || "Patient"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {apt.subtitle ? apt.subtitle : `${apt.sessionType || 'Session'} - Dr. ${apt.therapist?.name || 'Unknown'}`}
                      </p>
                    </div>
                  </div>
                ));
              }

              // Fallback to show if empty
              return (
                <p className="text-sm text-gray-500">No upcoming appointments.</p>
              );
            })()}
          </div>
        </div>

        {/* Consent Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-[#575757] text-lg mb-4">Consent Requests</h3>
          <div className="space-y-3">
            {(dashboard.invitationRequests?.requests || []).length > 0 ? dashboard.invitationRequests.requests.map((req: any, i: number) => (
              <div key={i} className="flex items-center gap-4 border border-gray-100 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                  {req.therapist?.profileImage && (
                    <img src={req.therapist.profileImage} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#575757] leading-tight">{req.therapist?.name}</p>
                  <p className="text-xs text-gray-500">Requested on {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No pending requests.</p>
            )}
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

