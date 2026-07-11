import { useState } from "react";
import { HorizontaLDots } from "../../icons";
import CustomModal from "../ui/modal/CustomModal";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";

interface IEPGoal {
  id: string;
  code: string;
  domain: string;
  status: string;
  description: string;
  progress: number;
  therapist: string;
  frequency: string;
  lastSession: string;
}

const mockGoals: IEPGoal[] = [
  {
    id: "1",
    code: "G-01",
    domain: "Communication",
    status: "In Progress",
    description: "Arjun will use 3-word phrases to make requests in structured settings with 80% accuracy across 3 consecutive sessions.",
    progress: 59,
    therapist: "Nandita Kumar",
    frequency: "3x per week (Speech)",
    lastSession: "Apr 28, 2026",
  },
  {
    id: "2",
    code: "G-02",
    domain: "Communication",
    status: "In Progress",
    description: "Arjun will respond to his name with eye contact or orientation within 5 seconds in 4 out of 5 trials.",
    progress: 72,
    therapist: "Dr. Reena Kapoor",
    frequency: "Daily (10 min)",
    lastSession: "Apr 28, 2026",
  },
  {
    id: "3",
    code: "G-03",
    domain: "Communication",
    status: "In Progress",
    description: "Arjun will initiate turn-taking during group play in 4 out of 5 opportunities",
    progress: 69,
    therapist: "Priya Lal",
    frequency: "2x per week (Social Skills)",
    lastSession: "Apr 25, 2026",
  }
];

const domains = [
  "All",
  "Communication",
  "Fine Motor",
  "Emotional Regulation",
  "Social Skills",
  "Self-Care",
  "Academics",
];

const IEPGoalsTab = () => {
  const [activeDomain, setActiveDomain] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    childId: "",
    domain: "",
    title: "",
    description: "",
    priority: "",
    therapist: "",
    status: "",
    startDate: "",
    targetDate: "",
    frequency: "",
    masteryCriteria: ""
  });

  const filteredGoals = activeDomain === "All" 
    ? mockGoals 
    : mockGoals.filter(goal => goal.domain === activeDomain);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">IEP Goals</h2>
          <p className="text-sm text-gray-500 mt-1">
            1 mastered - 7 active 8 total
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          + Add Goal
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

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-orange-200/60 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-green-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-800">{goal.code}</span>
                <span className="text-sm font-medium text-gray-600">{goal.domain}</span>
                <span className="text-sm font-semibold text-gray-800">{goal.status}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <HorizontaLDots className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm font-medium text-gray-800 mb-6 max-w-4xl">
              {goal.description}
            </p>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-8 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1.5">
                Therapist: {goal.therapist}
              </div>
              <div className="flex items-center gap-1.5">
                Freq: {goal.frequency}
              </div>
              <div className="flex items-center gap-1.5">
                Last session: <span className="font-bold text-gray-800">{goal.lastSession}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredGoals.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-600 font-medium">No goals found for this domain</p>
          </div>
        )}
      </div>

      <CustomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add IEP Goal"
        maxWidth="max-w-3xl"
        customFooter={
          <div className="flex justify-center gap-4 px-8 py-5 border-t border-gray-100 w-full">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-8 py-2 text-sm font-bold text-gray-600 bg-[#e2e8f0] rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsAddModalOpen(false);
              }}
              className="px-8 py-2 text-sm font-bold text-white bg-[#60a5fa] rounded-lg hover:bg-blue-500 transition-colors"
            >
              Save Diagnosis
            </button>
          </div>
        }
      >
        <div>
          <h3 className="text-gray-800 font-semibold mb-6">Goal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div>
              <Label>Child*</Label>
              <Select 
                options={[{value: "1", label: "Arjun Kumar"}]}
                onChange={(val) => setFormData(prev => ({...prev, childId: val}))}
                placeholder="Select"
              />
            </div>
            
            <div>
              <Label>Domain*</Label>
              <Select 
                options={domains.filter(d => d !== "All").map(d => ({value: String(d), label: String(d)}))}
                onChange={(val) => setFormData(prev => ({...prev, domain: val}))}
                placeholder="Select"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label>Goal Title*</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                placeholder=""
              />
            </div>
            
            <div className="md:col-span-2">
              <Label>Goal Description*</Label>
              <TextArea 
                value={formData.description}
                onChange={(val) => setFormData(prev => ({...prev, description: val}))}
                placeholder="Describe the observable behavior and context..."
                rows={3}
              />
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select 
                options={[
                  {value: "High", label: "High"},
                  {value: "Medium", label: "Medium"},
                  {value: "Low", label: "Low"}
                ]}
                onChange={(val) => setFormData(prev => ({...prev, priority: val}))}
                placeholder="Select"
              />
            </div>
            
            <div>
              <Label>Assigned Therapist</Label>
              <Select 
                options={[
                  {value: "Nandita Kumar", label: "Nandita Kumar"},
                  {value: "Dr. Reena Kapoor", label: "Dr. Reena Kapoor"},
                  {value: "Priya Lal", label: "Priya Lal"}
                ]}
                onChange={(val) => setFormData(prev => ({...prev, therapist: val}))}
                placeholder="Select"
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <Select 
                options={[
                  {value: "Not Started", label: "Not Started"},
                  {value: "In Progress", label: "In Progress"},
                  {value: "Mastered", label: "Mastered"}
                ]}
                onChange={(val) => setFormData(prev => ({...prev, status: val}))}
                placeholder="Select"
              />
            </div>
            
            <div>
              <Label>Start Date</Label>
              <DatePicker 
                value={formData.startDate}
                onChange={(val) => setFormData(prev => ({...prev, startDate: val}))}
                placeholder="Select"
              />
            </div>
            
            <div>
              <Label>Target Date</Label>
              <DatePicker 
                value={formData.targetDate}
                onChange={(val) => setFormData(prev => ({...prev, targetDate: val}))}
                placeholder="Select"
              />
            </div>
            
            <div>
              <Label>Frequency/Schedule</Label>
              <Select 
                options={[
                  {value: "Daily", label: "Daily"},
                  {value: "Weekly", label: "Weekly"},
                  {value: "Monthly", label: "Monthly"}
                ]}
                onChange={(val) => setFormData(prev => ({...prev, frequency: val}))}
                placeholder="Select"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label>Mastery Criteria*</Label>
              <Input 
                value={formData.masteryCriteria}
                onChange={(e) => setFormData(prev => ({...prev, masteryCriteria: e.target.value}))}
                placeholder="Select"
              />
            </div>
            
            <div className="md:col-span-2 mt-2">
              <Label>Teaching Targets*</Label>
              <div className="mt-1 w-full border-2 border-dashed border-gray-200 rounded-lg bg-white p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="text-gray-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">No targets added yet</p>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default IEPGoalsTab;
