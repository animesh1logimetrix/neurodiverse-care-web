import { useState } from "react";
import {
  PlusIcon,
  AlertIcon,
  ArrowRightIcon,
  FileIcon,
  HorizontaLDots,
} from "../../icons";

// Types
type GeneticTestStatus = "Needs Review" | "Awaiting Report" | "Normal" | "Positive";

interface GeneticTest {
  id: string;
  title: string;
  lab: string;
  orderedDate: string;
  reportedDate?: string;
  orderedBy: string;
  status: GeneticTestStatus;
  expanded?: boolean;
  result?: string;
  interpretation?: string[];
}

// Status styles mapping
const statusStyles: Record<GeneticTestStatus, { bg: string; border: string; text: string; icon: string }> = {
  "Needs Review": {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "bg-red-100",
  },
  "Awaiting Report": {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    icon: "bg-yellow-100",
  },
  Normal: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: "bg-green-100",
  },
  Positive: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: "bg-green-100",
  },
};

// StatusBadge Component
function StatusBadge({ status }: { status: GeneticTestStatus }) {
  const styles = statusStyles[status];
  return (
    <div className={`${styles.bg} ${styles.border} border px-2.5 py-1 rounded-sm text-xs font-semibold ${styles.text} whitespace-nowrap`}>
      {status}
    </div>
  );
}

// ClinicalReviewAlert Component
function ClinicalReviewAlert() {
  const handleAcknowledge = () => {
    // TODO: Connect to backend API for acknowledging genetic result
    console.log("Acknowledge genetic result and schedule counseling");
  };

  return (
    <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex gap-3">
        <AlertIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-900 mb-1">
            Genetic result requires clinical review
          </h3>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Chromosomal Microarray identified a 16p11.2 microdeletion (VUS). Genetic counseling and family trio testing have been recommended.
          </p>
          <p className="text-xs text-gray-500 mb-3">
            No provider has acknowledged this result yet.
          </p>
          <button
            onClick={handleAcknowledge}
            className="text-xs text-orange-600 font-semibold hover:text-orange-700 transition-colors inline-flex items-center gap-1"
          >
            Acknowledge & schedule counseling
            <ArrowRightIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// GeneticTestCard Component (Reusable)
function GeneticTestCard({ test, isExpanded }: { test: GeneticTest; isExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(isExpanded ?? false);

  const handleViewReport = () => {
    // TODO: Connect to backend API to view full genetic report
    console.log(`View full report for ${test.title}`);
  };

  const handleAddNote = () => {
    // TODO: Connect to backend API to add clinical note
    console.log(`Add clinical note for ${test.title}`);
  };

  const handleMarkReviewed = () => {
    // TODO: Connect to backend API to mark result as reviewed
    console.log(`Mark ${test.title} as reviewed`);
  };

  return (
    <div className="w-full bg-white border border-orange-200 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-5 h-5 rounded-full bg-orange-100 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-semibold text-sm text-gray-900">{test.title}</h3>
            <StatusBadge status={test.status} />
          </div>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-600 mb-3 pl-8">
        <span>Lab: <span className="font-medium">{test.lab}</span></span>
        <span className="hidden sm:inline">•</span>
        <span>Ordered: <span className="font-medium">{test.orderedDate}</span></span>
        {test.reportedDate && (
          <>
            <span className="hidden sm:inline">•</span>
            <span>Reported: <span className="font-medium">{test.reportedDate}</span></span>
          </>
        )}
        {!test.reportedDate && (
          <>
            <span className="hidden sm:inline">•</span>
            <span>Reported: <span className="font-medium">-</span></span>
          </>
        )}
        <span className="hidden sm:inline">•</span>
        <span>By <span className="font-medium">{test.orderedBy}</span></span>
      </div>

      {/* Expanded Content */}
      {(expanded || isExpanded) && test.result && (
        <>
          <div className="pl-8 mb-4 space-y-3 border-t border-gray-100 pt-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Result</p>
              <p className="text-xs text-gray-600 leading-relaxed">{test.result}</p>
            </div>
            {test.interpretation && test.interpretation.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Clinical Interpretation</p>
                <div className="space-y-2">
                  {test.interpretation.map((paragraph, idx) => (
                    <p key={idx} className="text-xs text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pl-8 flex flex-wrap gap-3 border-t border-gray-100 pt-3">
            <button
              onClick={handleViewReport}
              className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              View full report
            </button>
            <button
              onClick={handleAddNote}
              className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              Add clinical note
            </button>
            <button
              onClick={handleMarkReviewed}
              className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Mark as reviewed
            </button>
          </div>
        </>
      )}

      {/* Toggle Button (for collapsed cards) */}
      {!isExpanded && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

// CounselingCard Component
function CounselingCard() {
  const handleSchedule = () => {
    // TODO: Connect to backend API for scheduling counseling session
    console.log("Schedule genetic counseling session");
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4 mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex gap-3 flex-1">
        <div className="w-5 h-5 bg-green-100 rounded-full flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-1">Need help understanding results?</h3>
          <p className="text-xs text-gray-600">Schedule a genetic counseling session with our clinical geneticist.</p>
        </div>
      </div>
      <button
        onClick={handleSchedule}
        className="bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
      >
        Schedule Counseling
      </button>
    </div>
  );
}

// Main GeneticTestingTab Component
export default function GeneticTestingTab() {
  const handleAddMedication = () => {
    // TODO: Connect to backend API or modal for adding medication
    console.log("Add Medication - Open modal or redirect to form");
  };

  // Sample genetic test data
  const expandedTest: GeneticTest = {
    id: "1",
    title: "Chromosomal Microarray (CMA)",
    lab: "Medgenome Labs",
    orderedDate: "Mar 10, 2026",
    reportedDate: "Apr 18, 2026",
    orderedBy: "Dr. Ananya Varma",
    status: "Needs Review",
    expanded: true,
    result:
      "Variant of Uncertain Significance (VUS)-16p11.2 microdeletion detected (0.6 Mb)",
    interpretation: [
      "The 16p11.2 microdeletion is associated with ASD, intellectual disability, and speech delay. VUS classification clinical significance uncertain.",
      "Genetic counseling recommended. Family trio testing advised to assess inheritance.",
    ],
  };

  const collapsedTests: GeneticTest[] = [
    {
      id: "2",
      title: "Whole Exome Sequencing (WES)",
      lab: "Strand Life Sciences",
      orderedDate: "Apr 2, 2026",
      orderedBy: "Dr. Ananya Varma",
      status: "Awaiting Report",
    },
    {
      id: "3",
      title: "Fragile X Syndrome (FMR1)",
      lab: "Medgenome Labs",
      orderedDate: "Oct 20, 2022",
      reportedDate: "Nov 4, 2022",
      orderedBy: "Dr. Suresh Mehta",
      status: "Normal",
    },
    {
      id: "4",
      title: "MTHFR Gene Polymorphism Panel",
      lab: "Neuberg Diagnostics",
      orderedDate: "Jan 15, 2024",
      reportedDate: "Jan 28, 2024",
      orderedBy: "Dr. Ananya Varma",
      status: "Positive",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Genetic Testing</h2>
        <button
          onClick={handleAddMedication}
          className="inline-flex items-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors w-fit"
        >
          <PlusIcon className="w-4 h-4" />
          Add Medication
        </button>
      </div>

      {/* Clinical Review Alert */}
      <ClinicalReviewAlert />

      {/* Expanded Test Card */}
      <GeneticTestCard test={expandedTest} isExpanded={true} />

      {/* Collapsed Test Cards */}
      <div>
        {collapsedTests.map((test) => (
          <GeneticTestCard key={test.id} test={test} isExpanded={false} />
        ))}
      </div>

      {/* Counseling Card */}
      <CounselingCard />
    </div>
  );
}
