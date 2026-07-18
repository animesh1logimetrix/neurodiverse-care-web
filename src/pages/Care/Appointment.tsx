import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Switch from "../../components/form/switch/Switch";
import Select from "../../components/form/Select";
import { CustomModal } from "../../components/ui/modal/CustomModal";
import { HorizontaLDots, PlusIcon } from "../../icons";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
}

interface AppointmentData {
  id: string;
  time: string;
  duration: string;
  title: string;
  patientName: string;
  therapistName: string;
  location: string;
  note: string;
  status: string;
  scheduledAt?: string;
  yourNote?: string;
  timeSlots?: TimeSlot[];
  expanded?: boolean;
}



const AppointmentCard: React.FC<{ 
  data: AppointmentData; 
  onDelete: (id: string) => void;
  onEdit: (data: AppointmentData) => void;
  onChangeStatus: (data: AppointmentData) => void;
}> = ({ data, onDelete, onEdit, onChangeStatus }) => {
  const [isExpanded, setIsExpanded] = useState(!!data.expanded);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    data.timeSlots?.[0]?.id || null
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isPast = data.scheduledAt ? new Date(data.scheduledAt) < new Date() : false;

  return (
    <div className="bg-white rounded-2xl border border-orange-200 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[24px] mb-[24px] transition-all">
      <div
        className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left: Time */}
        <div className="flex flex-col text-gray-500 w-full md:w-32 shrink-0 border-b md:border-b-0 border-gray-100 pb-3 md:pb-0">
          <span className="font-bold text-gray-800 text-sm">{data.time}</span>
          <span className="text-xs">{data.duration}</span>
        </div>

        {/* Middle: Details */}
        <div className="flex-1 min-w-0 flex flex-col gap-1 w-full">
          <h3 className="font-bold text-gray-800 text-sm mb-1">{data.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col">
              <span className="text-gray-700 font-semibold">{data.patientName}</span>
              <span className="text-gray-500 mt-0.5">{data.location}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-700 font-semibold">{data.therapistName}</span>
              <span className="text-gray-500 mt-0.5">{data.note}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4 shrink-0 mt-2 md:mt-0 relative">
          <Badge 
            size="sm" 
            color={data.status === "COMPLETED" ? "success" : data.status === "APPROVED" ? "info" : data.status === "CANCELLED" || data.status === "REJECTED" ? "error" : "warning"}
            className={`font-semibold rounded-md border px-3 py-1 capitalize !bg-opacity-50
            ${data.status === 'COMPLETED' ? 'border-success-500 text-success-700 bg-success-50' :
              data.status === 'PENDING' ? 'border-warning-500 text-warning-700 bg-warning-50' :
              data.status === 'CANCELLED' ? 'border-error-500 text-error-700 bg-error-50' :
              data.status === 'APPROVED' ? 'border-info-500 text-info-700 bg-info-50' :
              data.status === 'REJECTED' ? 'border-error-500 text-error-700 bg-error-50' : ''
            }`}
          >
            {data.status === 'PENDING' ? 'Pending Review' : data.status.toLowerCase()}
          </Badge>
          <div className="relative">
            <button 
              className="dropdown-toggle text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <HorizontaLDots className="w-5 h-5" />
            </button>
            <Dropdown
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              className="w-44 right-0 mt-2 shadow-theme-md z-10"
            >
              <div className="py-1">
                {!isPast && (
                  <DropdownItem 
                    onClick={(e) => {
                      e?.stopPropagation();
                      setIsMenuOpen(false);
                      onEdit(data);
                    }}
                  >
                    Edit
                  </DropdownItem>
                )}

                {/* <div className="border-t border-gray-100 my-1"></div>
                
                <DropdownItem 
                  onClick={(e) => {
                    e?.stopPropagation();
                    setIsMenuOpen(false);
                    onChangeStatus(data);
                  }}
                >
                  Change Status
                </DropdownItem>

                <div className="border-t border-gray-100 my-1"></div> */}
                
                <DropdownItem
                  onClick={(e) => {
                    e?.stopPropagation();
                    setIsMenuOpen(false);
                    onDelete(data.id);
                  }}
                  className="text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20"
                >
                  Delete
                </DropdownItem>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Expanded State */}
      {isExpanded && data.yourNote && data.timeSlots && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h4 className="text-xs font-bold text-gray-800 mb-2 uppercase">Your Note</h4>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-4xl">
            {data.yourNote}
          </p>

          <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase">
            Select a time slot
          </h4>
          <div className="flex flex-col gap-4 mb-8">
            {data.timeSlots.map((slot) => (
              <div key={slot.id} className="flex items-start gap-4">
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch
                    label=""
                    color={selectedSlot === slot.id ? "blue" : "gray"}
                    defaultChecked={selectedSlot === slot.id}
                    onChange={(checked) => {
                      if (checked) setSelectedSlot(slot.id);
                    }}
                  />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="font-bold text-gray-800">{slot.date}</span>
                  <span className="text-gray-500">{slot.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center md:justify-center w-full">
            <button
              className="bg-[#2DA0FF] hover:bg-[#2DA0FF] text-white font-semibold rounded-lg px-8 py-2.5 text-sm transition-colors shadow-sm w-full md:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
            >
              Confirm This Slot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Appointment() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"List" | "Calendar">("List");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editAppointmentId, setEditAppointmentId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusAppointmentId, setStatusAppointmentId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("PENDING");

  // --- API Integrations ---
  const { data: childrenRaw = [] } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const res = await axiosClient.get("/child");
      return res.data;
    },
  });
  const childOptions = childrenRaw.map((child: any) => ({
    value: String(child.id),
    label: child.full_name,
  }));

  const { data: usersRaw = [] } = useQuery({
    queryKey: ["user", "therapist"],
    queryFn: async () => {
      const res = await axiosClient.get("/user?roleName=therapist");
      return res.data;
    },
  });
  const therapistOptions = (Array.isArray(usersRaw) ? usersRaw : usersRaw?.data || []).map((user: any) => ({
    value: String(user.id),
    label: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
  }));

  const { data: appointmentsRaw = [], isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const res = await axiosClient.get("/appointment");
      return res.data;
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/appointment", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Appointment created successfully");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create appointment");
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (payload: { id: string; data: any }) => {
      const res = await axiosClient.patch(`/appointment/${payload.id}`, payload.data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Appointment updated successfully");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update appointment");
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosClient.delete(`/appointment/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Appointment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete appointment");
    }
  });

  const handleDelete = (id: string) => {
    setAppointmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleOpenStatusModal = (data: AppointmentData) => {
    setStatusAppointmentId(data.id);
    const rawApt = appointmentsRaw.find((a: any) => String(a.id) === data.id);
    setSelectedStatus(rawApt?.status || "PENDING");
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (statusAppointmentId) {
      updateAppointmentMutation.mutate({
        id: statusAppointmentId,
        data: { status: selectedStatus }
      });
      setIsStatusModalOpen(false);
      setStatusAppointmentId(null);
    }
  };

  const handleEdit = (data: AppointmentData) => {
    const rawApt = appointmentsRaw.find((a: any) => String(a.id) === data.id);
    let dateStr = "";
    let timeStr = "";
    if (rawApt?.scheduled_at) {
      const d = new Date(rawApt.scheduled_at);
      if (!isNaN(d.getTime())) {
        const tzOffset = d.getTimezoneOffset() * 60000;
        const iso = new Date(d.getTime() - tzOffset).toISOString();
        dateStr = iso.slice(0, 10);
        timeStr = iso.slice(11, 16);
      }
    }

    setBookForm({
      child: String(rawApt?.childId || rawApt?.child_id || rawApt?.child?.id || ""),
      therapist: String(rawApt?.therapistId || rawApt?.therapist_id || rawApt?.therapist?.id || ""),
      sessionType: rawApt?.sessionType || rawApt?.session_type || "",
      scheduleDate: dateStr,
      scheduleTime: timeStr,
      note: rawApt?.note || rawApt?.reason || "",
      status: rawApt?.status || "PENDING"
    });
    setEditAppointmentId(data.id);
    setBookErrors({});
    setIsBookModalOpen(true);
  };

  const closeModal = () => {
    setBookForm({ child: "", therapist: "", sessionType: "", scheduleDate: "", scheduleTime: "", note: "", status: "PENDING" });
    setBookErrors({});
    setEditAppointmentId(null);
    setIsBookModalOpen(false);
  };

  const formattedAppointments: AppointmentData[] = appointmentsRaw.map((apt: any) => ({
    id: String(apt.id),
    time: apt.scheduled_at ? new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
    duration: "60 min",
    title: apt.session_type,
    patientName: apt.child?.full_name || "Unknown Child",
    therapistName: apt.therapist?.name || apt.therapist?.firstName || "Unknown Therapist",
    location: apt.location || "",
    note: apt.reason || "",
    status: apt.status || "PENDING",
    scheduledAt: apt.scheduled_at,
  }));

  const todayDateStr = new Date().toDateString();
  const todayAppointments = formattedAppointments.filter((apt: any) => {
    const rawApt = appointmentsRaw.find((a: any) => String(a.id) === apt.id);
    if (!rawApt?.scheduled_at) return false;
    return new Date(rawApt.scheduled_at).toDateString() === todayDateStr;
  });
  const upcomingAppointments = formattedAppointments.filter((apt: any) => {
    const rawApt = appointmentsRaw.find((a: any) => String(a.id) === apt.id);
    if (!rawApt?.scheduled_at) return true;
    return new Date(rawApt.scheduled_at).toDateString() !== todayDateStr;
  });

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const selectedDateStr = selectedDate.toDateString();
  const selectedDateAppointments = formattedAppointments.filter((apt: any) => {
    const rawApt = appointmentsRaw.find((a: any) => String(a.id) === apt.id);
    if (!rawApt?.scheduled_at) return false;
    return new Date(rawApt.scheduled_at).toDateString() === selectedDateStr;
  });

  const getAppointmentsCountForDate = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
    return formattedAppointments.filter((apt: any) => {
      const rawApt = appointmentsRaw.find((a: any) => String(a.id) === apt.id);
      if (!rawApt?.scheduled_at) return false;
      return new Date(rawApt.scheduled_at).toDateString() === dateStr;
    }).length;
  };

  const [bookForm, setBookForm] = useState({
    child: "",
    therapist: "",
    sessionType: "",
    scheduleDate: "",
    scheduleTime: "",
    note: "",
    status: "PENDING"
  });
  const [bookErrors, setBookErrors] = useState<Record<string, string>>({});

  const handleBookFormChange = (field: string, value: string) => {
    setBookForm(prev => ({ ...prev, [field]: value }));
    if (bookErrors[field]) {
      setBookErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSaveAppointment = () => {
    const errors: Record<string, string> = {};
    if (!bookForm.child.trim()) errors.child = "Child is required";
    if (!bookForm.therapist.trim()) errors.therapist = "Therapist is required";
    if (!bookForm.scheduleDate.trim()) errors.scheduleDate = "Date is required";
    if (!bookForm.scheduleTime.trim()) errors.scheduleTime = "Time is required";
    if (!bookForm.sessionType.trim()) errors.sessionType = "Session type is required";

    if (Object.keys(errors).length > 0) {
      setBookErrors(errors);
      return;
    }

    let scheduled_at_iso = "";
    if (bookForm.scheduleDate && bookForm.scheduleTime) {
      try {
        scheduled_at_iso = new Date(`${bookForm.scheduleDate}T${bookForm.scheduleTime}:00`).toISOString();
      } catch (e) {
        console.error("Invalid date/time", e);
      }
    }

    const payload = {
      child_id: Number(bookForm.child),
      therapist_id: Number(bookForm.therapist),
      session_type: bookForm.sessionType,
      scheduled_at: scheduled_at_iso,
      reason: bookForm.note,
      status: bookForm.status,
      requestedBy_id: 1, // Fallback default
    };

    if (editAppointmentId) {
      updateAppointmentMutation.mutate({
        id: editAppointmentId,
        data: payload
      });
    } else {
      createAppointmentMutation.mutate(payload);
    }
  };

  const timeOptions = React.useMemo(() => {
    const options = [];
    for (let h = 10; h <= 21; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 21 && m > 45) continue;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h > 12 ? h - 12 : h;
        const mins = m === 0 ? '00' : m.toString();
        options.push({
          value: `${h.toString().padStart(2, '0')}:${mins}`,
          label: `${hour12}:${mins} ${ampm}`
        });
      }
    }
    return options;
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Appointments" hideTitle />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {todayAppointments.length} today – {upcomingAppointments.length} upcoming
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveTab("List")}
              className={`${
                activeTab === "List" ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setActiveTab("Calendar")}
              className={`${
                activeTab === "Calendar" ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Calendar
            </button>
          </div>

          <button 
            onClick={() => setIsBookModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#2DA0FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2DA0FF] transition-colors"
          >
            <PlusIcon className="w-4 h-4 fill-current" /> Book Appointment
          </button>
      </div>
      </div>

        {/* Content */}
        {isAppointmentsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <svg className="animate-spin h-8 w-8 text-[#2DA0FF] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium">Loading appointments...</p>
          </div>
        ) : activeTab === "List" ? (
          <div>
            {/* Today Section */}
            <section className="mb-8">
              <h2 className="text-[20px] font-semibold text-gray-800 mb-[16px]">
                Today, {new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </h2>
              <div className="space-y-4">
              {todayAppointments.map((apt: any) => (
                <AppointmentCard key={apt.id} data={apt} onDelete={handleDelete} onEdit={handleEdit} onChangeStatus={handleOpenStatusModal} />
              ))}
              {todayAppointments.length === 0 && <p className="text-sm text-gray-500">No appointments today.</p>}
            </div>
            </section>

            {/* Upcoming Section */}
            <section>
              <h2 className="text-[20px] font-semibold text-gray-800 mb-[16px]">
                Upcoming appointments
              </h2>
              <div className="space-y-4">
              {upcomingAppointments.map((apt: any) => (
                <AppointmentCard key={apt.id} data={apt} onDelete={handleDelete} onEdit={handleEdit} onChangeStatus={handleOpenStatusModal} />
              ))}
              {upcomingAppointments.length === 0 && <p className="text-sm text-gray-500">No upcoming appointments.</p>}
            </div>
          </section>
        </div>
      ) : activeTab === "Calendar" ? (
        <div className="flex flex-col xl:flex-row gap-6 mb-8">
          {/* Calendar Grid */}
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-medium text-gray-800">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 gap-x-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
              {blanks.map(blank => (
                <div key={`blank-${blank}`} className="aspect-square max-w-[80px] mx-auto w-full"></div>
              ))}
              {days.map(day => {
                const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
                const count = getAppointmentsCountForDate(day);
                return (
                  <div 
                    key={day} 
                    onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                    className={`aspect-square max-w-[80px] mx-auto w-full flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all relative ${
                      isSelected ? 'bg-brand-500 text-white shadow-md transform scale-105' : 'hover:bg-white text-gray-700'
                    }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {count > 0 && (
                      <div className="absolute bottom-2 sm:bottom-3 flex gap-1">
                        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                          <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-500'}`}></div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-full xl:w-[400px] bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(15,23,42,0.08)] self-start sticky top-6">
            <div className="flex items-center gap-2 text-brand-500 font-medium mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>{selectedDate.getFullYear()}-{String(selectedDate.getMonth() + 1).padStart(2, '0')}-{String(selectedDate.getDate()).padStart(2, '0')}</span>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {selectedDateAppointments.length > 0 ? (
                selectedDateAppointments.map((apt: any) => (
                  <div key={apt.id} className="flex flex-col gap-1 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{apt.time} - {apt.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">{apt.patientName}</span>
                    <span className="text-xs text-gray-400">{apt.therapistName}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 py-8 text-center">
                  No appointments on this date.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Book Appointment Modal */}
      <CustomModal
        isOpen={isBookModalOpen}
        onClose={closeModal}
        title={editAppointmentId ? "Edit Appointment" : "Book Appointment"}
        subtitle="Fill in the details"
        maxWidth="max-w-2xl"
        footerAlign="center"
        asteriskColor="black"
        overlayBlur={false}
        maxBodyHeight="70vh"
        modalClassName="max-h-[90vh]"
        customFooter={
          <div className="flex items-center justify-center gap-3 px-8 py-5 border-t border-gray-100 w-full">
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer min-w-[120px]"
              onClick={() => setIsBookModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors text-sm cursor-pointer min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveAppointment}
            >
              {createAppointmentMutation.isPending || updateAppointmentMutation.isPending ? "Saving..." : (editAppointmentId ? "Update Appointment" : "Save Appointment")}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Child <span className="text-black">*</span>
            </label>
            <Select 
              options={childOptions} 
              placeholder="Select"
              value={bookForm.child} 
              onChange={(val) => handleBookFormChange("child", val)} 
            />
            {bookErrors.child && <p className="text-xs text-red-600">{bookErrors.child}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Therapist <span className="text-black">*</span>
            </label>
            <Select 
              options={therapistOptions} 
              placeholder="Select"
              value={bookForm.therapist} 
              onChange={(val) => handleBookFormChange("therapist", val)} 
            />
            {bookErrors.therapist && <p className="text-xs text-red-600">{bookErrors.therapist}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Session Type
            </label>
            <Select 
              options={[
                {value: "CONSULTATION", label: "Consultation"},
                {value: "ABA", label: "ABA"},
                {value: "SPEECH", label: "Speech"},
                {value: "OCCUPATIONAL", label: "Occupational"},
                {value: "PHYSIOTHERAPY", label: "Physiotherapy"},
                {value: "PSYCHOLOGY", label: "Psychology"},
                {value: "ASSESSMENT", label: "Assessment"},
                {value: "FOLLOW_UP", label: "Follow-up"},
                {value: "IEP Annual Review", label: "IEP Annual Review"},
                {value: "OT Evaluation", label: "OT Evaluation"}
              ]} 
              placeholder="Select"
              value={bookForm.sessionType}
              onChange={(val) => handleBookFormChange("sessionType", val)} 
            />
          </div>
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Schedule Date <span className="text-black">*</span>
            </label>
            <input 
              type="date" 
              min={(() => {
                const d = new Date();
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              })()}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-theme-xs focus:outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
              value={bookForm.scheduleDate}
              onChange={(e) => handleBookFormChange("scheduleDate", e.target.value)}
              onClick={(e) => {
                try {
                  if ('showPicker' in HTMLInputElement.prototype) {
                    (e.currentTarget as HTMLInputElement).showPicker();
                  }
                } catch (err) {
                  // ignore
                }
              }}
            />
            {bookErrors.scheduleDate && <p className="text-xs text-red-600">{bookErrors.scheduleDate}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Schedule Time <span className="text-black">*</span>
            </label>
            <Select 
              options={timeOptions}
              placeholder="Select Time"
              value={bookForm.scheduleTime}
              onChange={(val) => handleBookFormChange("scheduleTime", val)}
            />
            {bookErrors.scheduleTime && <p className="text-xs text-red-600">{bookErrors.scheduleTime}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="block text-xs font-bold text-black">
            Note
          </label>
          <textarea
            placeholder="Write"
            rows={4}
            value={bookForm.note}
            onChange={(e) => handleBookFormChange("note", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
          />
        </div>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Appointment"
        maxWidth="max-w-md"
        customFooter={
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (appointmentToDelete) deleteAppointmentMutation.mutate(appointmentToDelete);
              }}
              disabled={deleteAppointmentMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {deleteAppointmentMutation.isPending ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        }
      >
        <div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-1">Are you sure?</h4>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this appointment? This action cannot be undone and will permanently remove this record.
              </p>
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Change Status Modal */}
      <CustomModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Change Status"
        maxWidth="max-w-md"
        customFooter={
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveStatus}
              disabled={updateAppointmentMutation.isPending}
              className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {updateAppointmentMutation.isPending ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Save"
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Update Appointment Status
          </label>
          <Select 
            options={[
              {value: "PENDING", label: "Pending Review"},
              {value: "APPROVED", label: "Approved"},
              {value: "REJECTED", label: "Rejected"},
              {value: "CANCELLED", label: "Cancelled"},
              {value: "COMPLETED", label: "Completed"}
            ]} 
            placeholder="Select Status"
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)} 
          />
        </div>
      </CustomModal>
    </>
  );
}

