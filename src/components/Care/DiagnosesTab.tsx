import { useState } from "react";
import CustomModal from "../ui/modal/CustomModal";

export default function DiagnosesTab() {
  const [openStates, setOpenStates] = useState<Record<number, boolean>>({
    0: true, // First item open by default based on image
  });
  const [selectedDiagnosisIndex, setSelectedDiagnosisIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenStates((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const diagnoses = [
    {
      title: "Autism Spectrum Disorder",
      level: "(Level 2)",
      status: "Confirmed",
      severity: "Moderate",
      diagnosedDate: "Sep 15, 2022",
      by: "Dr. Reena Kapoor",
      iepGoals: 4,
      notes:
        "Requires substantial support. Significant deficits in social communication. Restricted, repetitive behaviors impacting daily function.",
      documents: 4,
    },
    {
      title: "Autism Spectrum Disorder",
      level: "(Level 2)",
      status: "Confirmed",
      severity: "Moderate",
      diagnosedDate: "Sep 15, 2022",
      by: "Dr. Reena Kapoor",
      iepGoals: 4,
      notes:
        "Requires substantial support. Significant deficits in social communication. Restricted, repetitive behaviors impacting daily function.",
      documents: 4,
    },
    {
      title: "Autism Spectrum Disorder",
      level: "(Level 2)",
      status: "Confirmed",
      severity: "Moderate",
      diagnosedDate: "Sep 15, 2022",
      by: "Dr. Reena Kapoor",
      iepGoals: 4,
      notes:
        "Requires substantial support. Significant deficits in social communication. Restricted, repetitive behaviors impacting daily function.",
      documents: 4,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex justify-end">
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
          + Add Diagnoses
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Diagnoses</h2>
          <p className="text-sm text-gray-500 mt-1">
            5 Confirm Diagnoses on Record
          </p>
        </div>

        <div className="space-y-0">
          {diagnoses.map((item, index) => {
            const isOpen = openStates[index];
            return (
              <div
                key={index}
                className="border-t border-gray-100 py-4 first:border-t-0"
              >
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleAccordion(index)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {item.title}{" "}
                        <span className="font-normal">{item.level}</span>
                      </h3>
                      <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Severity: {item.severity}</span>
                      <span>Diagnosed: {item.diagnosedDate}</span>
                      <span>By: {item.by}</span>
                      <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.iepGoals} IEP goals
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400">
                    <button 
                      className="hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDiagnosisIndex(index);
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        ></path>
                      </svg>
                    </button>
                    <button className="hover:text-gray-600">
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Clinical Notes
                    </p>
                    <p className="text-sm text-gray-600 mb-4">{item.notes}</p>

                    <div className="flex items-center gap-3">
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                        Edit diagnosis
                      </button>
                      <button 
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDiagnosisIndex(index);
                        }}
                      >
                        View linked IEP goals
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                        Archive
                      </button>
                      <span className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-md">
                        {item.documents} Documents
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnosis Details Modal */}
      <CustomModal 
        isOpen={selectedDiagnosisIndex !== null} 
        onClose={() => setSelectedDiagnosisIndex(null)}
        title="Diagnosis Details"
        maxWidth="max-w-3xl"
        maxBodyHeight="80vh"
        padding="p-0"
        customFooter={<></>}
      >
        {selectedDiagnosisIndex !== null && (() => {
          const item = diagnoses[selectedDiagnosisIndex];
          return (
            <div className="flex flex-col">
              <div className="p-6 pt-8">
                {/* Row 1: Details and IEP Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                    <span className="text-gray-500">ICD-10 Code</span> <span className="text-gray-800">F84.0</span>
                    <span className="text-gray-500">Diagnosis Date</span> <span className="text-gray-800">{item.diagnosedDate}</span>
                    <span className="text-gray-500">Diagnosed By</span> <span className="text-gray-800">{item.by}</span>
                    <span className="text-gray-500">Severity</span> <span className="text-gray-800">{item.severity} {item.level}</span>
                    <span className="text-gray-500">Status</span> 
                    <div>
                      <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {item.status}
                      </span>
                    </div>
                    <span className="text-gray-500">Review Date</span> <span className="text-gray-800">Sep 15, 2023</span>
                    <span className="text-gray-500">Last Updated</span> <span className="text-gray-800">Sep 15, 2022</span>
                  </div>

                  <div className="border-l border-gray-100 pl-8">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Linked IEP Goals ({item.iepGoals})</p>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4">
                      <li className="flex gap-2"><span>•</span> Improve social communication skills</li>
                      <li className="flex gap-2"><span>•</span> Increase independent play</li>
                      <li className="flex gap-2"><span>•</span> Reduce repetitive behaviors</li>
                      <li className="flex gap-2"><span>•</span> Enhance daily living skills</li>
                    </ul>
                    <button className="text-sm font-medium text-gray-600 border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors">
                      View All IEP Goals
                    </button>
                  </div>
                </div>

                {/* Row 2: Reports & Documents */}
                <div className="mb-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Reports & Documents</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {/* Card 1 */}
                    <div className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-40">
                      <p className="font-bold text-gray-800 text-sm mb-1">Diagnostic Report</p>
                      <p className="text-xs text-gray-500 mb-0.5">Sep 15, 2022</p>
                      <p className="text-xs text-gray-500">Dr. Reena Kapoor</p>
                      <p className="text-xs text-gray-400 mt-2">1.2 MB</p>
                    </div>
                    {/* Card 2 */}
                    <div className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-40">
                      <p className="font-bold text-gray-800 text-sm mb-1">MRI Brain Scan</p>
                      <p className="text-xs text-gray-500 mb-0.5">Aug 28, 2022</p>
                      <p className="text-xs text-gray-500">Image</p>
                      <p className="text-xs text-gray-400 mt-2">2.4 MB</p>
                    </div>
                    {/* Card 3 */}
                    <div className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-40">
                      <p className="font-bold text-gray-800 text-sm mb-1">EEG Report</p>
                      <p className="text-xs text-gray-500 mb-0.5">Aug 20, 2022</p>
                      <p className="text-xs text-gray-400 mt-2">pdf 1.1 MB</p>
                    </div>
                    {/* Card 4 */}
                    <div className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-40">
                      <p className="font-bold text-gray-800 text-sm mb-1">Developmental Assessment</p>
                      <p className="text-xs text-gray-500 mb-0.5">Jul 10, 2022</p>
                      <p className="text-xs text-gray-400 mt-2">pdf 1.5 MB</p>
                    </div>
                    {/* Upload Card */}
                    <label className="w-40 shrink-0 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center h-40 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer">
                      <input type="file" className="hidden" multiple />
                      <svg className="w-6 h-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      <span className="text-sm font-medium">Upload More</span>
                    </label>
                  </div>
                </div>

                {/* Row 3: History */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">History</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center w-4 pt-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="w-px h-full bg-gray-200 my-1" />
                      </div>
                      <div className="w-32 text-sm text-gray-500 pt-0.5 shrink-0">Sep 15, 2022</div>
                      <div className="pt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm text-gray-800">Diagnosis confirmed</p>
                        <p className="text-xs text-gray-400">By Dr. Reena Kapoor</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center w-4 pt-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-px h-full bg-gray-200 my-1" />
                      </div>
                      <div className="w-32 text-sm text-gray-500 pt-0.5 shrink-0">Aug 28, 2022</div>
                      <div className="pt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm text-gray-800">Reports added</p>
                        <p className="text-xs text-gray-400">MRI Brain Scan, EEG Report</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center w-4 pt-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      </div>
                      <div className="w-32 text-sm text-gray-500 pt-0.5 shrink-0">Jul 10, 2022</div>
                      <div className="pt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm text-gray-800">Initial assessment completed</p>
                        <p className="text-xs text-gray-400">Developmental Assessment uploaded</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </CustomModal>
    </div>
  );
}
