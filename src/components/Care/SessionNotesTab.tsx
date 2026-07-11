import { useState } from "react";
import { HorizontaLDots } from "../../icons";

interface SessionNote {
  id: string;
  initials: string;
  therapist: string;
  role: string;
  type: string;
  duration: string;
  datetime: string;
  goals: string[];
}

const mockNotes: SessionNote[] = [
  {
    id: "1",
    initials: "RS",
    therapist: "Rohit Sharma",
    role: "ABA Therapist",
    type: "ABA",
    duration: "60 min",
    datetime: "Apr 29, 2026 at 10:30 AM",
    goals: ["G-02-Name Response", "G-05-Emotional Regulation"],
  },
  {
    id: "2",
    initials: "PS",
    therapist: "Priya Sharma",
    role: "Speech Therapist",
    type: "Speech",
    duration: "45 min",
    datetime: "Apr 28, 2026 at 11:30 AM",
    goals: ["G-01-3-Word Phrases"],
  },
  {
    id: "3",
    initials: "RS",
    therapist: "Rohit Sharma",
    role: "ABA Therapist",
    type: "ABA",
    duration: "60 min",
    datetime: "Apr 28, 2026 at 10:30 AM",
    goals: ["G-02-Name Response", "G-05-Emotional Regulation"],
  }
];

const domains = [
  "All",
  "ABA",
  "Speech",
  "OT",
  "Psychology",
];

const SessionNotesTab = () => {
  const [activeDomain, setActiveDomain] = useState("All");

  const filteredNotes = activeDomain === "All" 
    ? mockNotes 
    : mockNotes.filter(note => note.type === activeDomain);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Session Notes</h2>
          <p className="text-sm text-gray-500 mt-1">
            6 notes this month
          </p>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          + Add Note
        </button>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-4 border-b border-gray-100 overflow-x-auto pb-1 custom-scrollbar">
        {domains.map((domain) => (
          <button
            key={domain}
            onClick={() => setActiveDomain(domain)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              activeDomain === domain
                ? "text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 rounded-t-lg"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
            }`}
          >
            {domain}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl shadow-sm border border-orange-200/60 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-sm shrink-0">
              {note.initials}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-gray-900">
                  {note.therapist} <span className="font-normal text-gray-600">{note.role} {note.type} - {note.duration}</span>
                </h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-gray-500">{note.datetime}</span>
                
                <div className="flex items-center gap-2">
                  {note.goals.map((goal, idx) => (
                    <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredNotes.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-600 font-medium">No notes found for this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionNotesTab;
