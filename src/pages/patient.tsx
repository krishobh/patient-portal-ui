import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import HomeworkSection from "@/components/ui/HomeworkSection";
import NotesSection from "@/components/ui/NotesSection";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock,Settings, LogOut, Video } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useUser } from "@/contexts/UserContext";
import ProtectedLayout from "@/layouts/ProtectedLayout";


interface Patient {
  id: string;
  name: string;
  photo: string;
  diagnoses: string[];
  therapyDepartments: Array<{
    name: string;
    therapist: string;
  }>;
  preferred_consultants: Array<{
    id: string;
    name: string;
    department: string;
    department_id: string;
    code: string;
  }>;
}

interface Report {
  id: number;
  title: string;
  date: string;
  author: string;
  content: string;
  status?: string;
  approved_by?: number;
  approved_at?: string;
  creator: any;
  report_template_id?: string;
}

interface HomeworkItem {
  id: number;
  date: string;
  title: string;
  description: string;
  files: { name: string; url: string }[];
  status: "PENDING" | "COMPLETED";
  consultant?: string;
}


const PatientDetails: React.FC = () => {
  const router = useRouter();
  const { patientId } = router.query;
  const { user, hydrated, logout } = useUser();
  const { execute } = useApi();
  const [selectedReportType, setSelectedReportType] = useState("daily");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [homeworkOpen, setHomeworkOpen] = useState(false);
  const [patientData, setPatientData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportTemplates, setReportTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  const [homeworkError, setHomeworkError] = useState<string | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const currentTime = useMemo(() => {
    if (!user?.business_date) return new Date();
    const date = new Date(user.business_date);
    return date;
  }, [user?.business_date]);

  // Redirect if no patientId
  useEffect(() => {
    if (!patientId && router.isReady) {
      router.push('/patient-selection');
    }
  }, [patientId, router]);

  // Fetch patient data from API
  useEffect(() => {
    // Wait for router and user context to be ready
    if (!router.isReady || !hydrated) {
      return;
    }
    
    // Get patientId as string (handle array case from Next.js query)
    const patientIdStr = Array.isArray(patientId) ? patientId[0] : patientId;
    
    // Check if we have required data
    if (!patientIdStr) {
      setLoading(false);
      setError("Patient ID is required");
      return;
    }
    
    if (!user?.token) {
      setLoading(false);
      setError("Authentication required. Please login.");
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }
    
    setLoading(true);
    setError(null);
    execute<any>(
      "get",
      `/v1/patients/${patientIdStr}/summary`,
      undefined,
      {
        onSuccess: (data) => {
          setPatientData({
            id: data.code,
            name: data.patient_name,
            photo: data.photo || "",
            diagnoses: data.diagnosis || [],
            therapyDepartments: (data.preferred_consultants || []).map(
              (c: any) => ({
                id: c.id,
                name: c.department,
                therapist: c.name,
                department_id: c.department_id,
                code: c.code,
              })
            ),
            preferred_consultants: data.preferred_consultants || [],
          });
          // Set consultant selection - select the first consultant as default
          if (
            data.preferred_consultants &&
            data.preferred_consultants.length > 0
          ) {
            setSelectedConsultant(data.preferred_consultants[0]);
          }
          setLoading(false);
        },
        onError: (err) => {
          setPatientData(null);
          setError("Failed to load patient data.");
          setLoading(false);
        },
      },
      { Authorization: `Bearer ${user.token}` }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, user?.token, router.isReady, hydrated]);

  const handleReportTypeSelect = (templateId: string) => {
    setSelectedReportType(templateId);
    const templateObj = reportTemplates.find(
      (tpl: any) => tpl.id?.toString() == templateId
    );
    setSelectedTemplate(templateObj || null);
    
    // Filter reports by template
    if (templateObj) {
      const filteredReports = reports.filter(
        (r) => r.report_template_id === templateObj.id?.toString()
      );
      // In a real app, you'd fetch reports here
    }
  };

  const handleReportSelect = (report: Report) => {
    setSelectedReport(report);
    // In a real app, you'd open a modal or navigate to report details
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Get initials from patient name
  const getInitials = (name: string) => {
    if (!name) return "P";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fetchHomework = () => {
    // Get patientId as string (handle array case from Next.js query)
    const patientIdStr = Array.isArray(patientId) ? patientId[0] : patientId;
    
    if (!patientIdStr || !user?.token || !user?.user_id || !selectedConsultant?.id)
      return;
    setHomeworkLoading(true);
    setHomeworkError(null);
    execute<any>(
      "get",
      `/v1/patients/homeworks?consultant_id=&patient_id=${patientIdStr}&page=1&per_page=10`,
      undefined,
      {
        onSuccess: (data) => {
          // Map API response to HomeworkItem[]
          const mapped: HomeworkItem[] = (data.data || [])
            .filter((item: any) => !item.is_delete)
            .map((item: any) => ({
              id: item.id,
              date: item.createdAt,
              title: item.title,
              description: item.description,
              files: Array.isArray(item.files)
                ? item.files.map((url: string) => ({
                    name: url.split("/").pop() || "file",
                    url,
                  }))
                : [],
              status: item.status || "PENDING",
              consultant: item.consultant_id
                ? String(item.consultant_id)
                : undefined,
            }));
          setHomework(mapped);
          setHomeworkLoading(false);
        },
        onError: (err) => {
          setHomework([]);
          setHomeworkError("Failed to load homework.");
          setHomeworkLoading(false);
        },
      },
      { Authorization: `Bearer ${user.token}` }
    );
  };

  useEffect(() => {
    fetchHomework();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, user?.token, user?.user_id, selectedConsultant]);

  // Fetch appointments
  const fetchAppointments = () => {
    // Get patientId as string (handle array case from Next.js query)
    const patientIdStr = Array.isArray(patientId) ? patientId[0] : patientId;
    
    if (!patientIdStr || !user?.token || !user?.organisation?.id || !user?.business_date) {
      return;
    }

    setAppointmentsLoading(true);
    setAppointmentsError(null);

    // Use business_date from login response for both date_from and date_to (only business date appointments)
    const businessDate = new Date(user.business_date);
    const businessDateStr = businessDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Use the reports API endpoint
    const apiUrl = `${process.env.NEXT_PUBLIC_REPORTS_API_BASE_URL || 'https://api.edencdc.org'}/reports/patient_history/${patientIdStr}?patient_id=${patientIdStr}&date_from=${businessDateStr}&date_to=${businessDateStr}&organisation_id=${user.organisation.id}`;

    // Use fetch directly since this is a different base URL
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const rawAppointments = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
        
        // Flatten the response structure: each date object contains logs array
        // Map each log to an appointment
        const mappedAppointments: any[] = [];
        
        rawAppointments.forEach((dateGroup: any) => {
          const appointmentDate = dateGroup.date || businessDateStr;
          const logs = Array.isArray(dateGroup.logs) ? dateGroup.logs : [];
          
          logs.forEach((log: any, index: number) => {
            mappedAppointments.push({
              id: `${appointmentDate}-${index}`,
              appointment_id: `${appointmentDate}-${index}`,
              consultant_id: log.consultant || null,
              consultant_name: log.consultant || '',
              is_online: log.is_online === true,
              availability_date: appointmentDate,
              slot_name: log.time || '',
              slot_end_time: log.end_time || '',
              patient_name: patientData?.name || '',
              patient_code: patientData?.id || '',
              category_name: log.DeptCategory?.name || (typeof log.DeptCategory === 'string' ? log.DeptCategory : '') || '',
              status: log.status || '',
              zoom_join_url: log.zoom_join_url || null,
              zoom_start_url: log.zoom_join_url || null,
              group_id: log.group || null,
              department_id: log.department || null,
              group: log.group,
              department: log.department,
            });
          });
        });
        
        setAppointments(mappedAppointments);
        setAppointmentsLoading(false);
      })
      .catch((err) => {
        setAppointmentsError("Failed to load appointments.");
        setAppointments([]);
        setAppointmentsLoading(false);
      });
  };

  useEffect(() => {
    if (router.isReady && hydrated && patientId && user?.token && user?.organisation?.id && user?.business_date && patientData) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, user?.token, user?.organisation?.id, user?.business_date, router.isReady, hydrated, patientData]);

  return (
    <div className="min-h-screen bg-medical-lightGray">
      {loading ? (
        <div className="text-center py-8 text-medical-text">
          Loading patient data...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          {/* Header */}
          <header className="w-full bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="flex items-center">
                  <div className="mr-4">
                    <Avatar className="h-16 w-16 border-2 border-medical-teal">
                      <AvatarImage 
                        src={patientData?.photo} 
                        alt={patientData?.name || "Patient"}
                      />
                      <AvatarFallback className="bg-medical-lightBlue text-medical-blue text-lg font-semibold">
                        {getInitials(patientData?.name || "Patient")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-medical-darkGray">{patientData?.name || "Patient"}</h1>
                    <div className="mt-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-medium text-medical-text">Diagnoses:</span>
                        {(patientData?.diagnoses || []).map((diagnosis: string, index: number) => (
                          <span 
                            key={index} 
                            className="text-xs font-medium px-2 py-1 bg-medical-lightBlue text-medical-blue rounded-full"
                          >
                            {diagnosis}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-medical-darkGray mb-1 gap-6">
                  <Calendar size={18} className="mr-1" />
                  <span>{formatDate(currentTime)}</span>
                  <button
                    onClick={() => router.push('/reset-password')}
                    className="flex items-center text-medical-text hover:text-medical-teal transition-colors"
                  >
                    <Settings size={18} className="mr-1" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-medical-text hover:text-medical-teal transition-colors"
                  >
                    <LogOut size={18} className="mr-1" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
              
              {/* Therapy Departments */}
              <div className="flex flex-wrap gap-2 mt-4">
                {(patientData?.preferred_consultants || []).map((consultant: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center glass-card px-3 py-1 rounded-md"
                  >
                    <span className="text-xs font-medium text-medical-teal">{consultant.department}:</span>
                    <span className="text-xs ml-1 text-medical-darkGray">{consultant.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
              {/* Schedule Section - 70% width */}
              <div className="lg:w-[70%]">
                <div className="glass-card rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-medical-darkGray flex items-center">
                      <Calendar size={20} className="mr-2 text-medical-teal" />
                      Today's Therapy Schedule
                    </h2>
                    <span className="text-sm font-medium px-3 py-1 bg-medical-lightBlue text-medical-blue rounded-full">
                      {formatDate(currentTime)}
                    </span>
                  </div>
                  
                  {appointmentsLoading && (
                    <div className="text-center py-8 text-medical-text">
                      Loading appointments...
                    </div>
                  )}
                  {appointmentsError && (
                    <div className="text-center py-8 text-red-500">{appointmentsError}</div>
                  )}
                  {!appointmentsLoading && !appointmentsError && appointments.length === 0 && (
                    <div className="text-center py-8 text-medical-text">
                      No appointments found.
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                    {appointments.map((appointment: any) => {
                      const therapistName = appointment.consultant_name || "GROUP SESSION";
                      const department = appointment.category_name || appointment.department || "Therapy";
                      const timeSlot = appointment.slot_name && appointment.slot_end_time
                        ? `${appointment.slot_name} - ${appointment.slot_end_time}`
                        : appointment.slot_name || "";
                      const room = appointment.group || appointment.department || "Room TBD";
                      const isOnline = appointment.is_online === true;
                      const meetLink = appointment.zoom_start_url || appointment.zoom_join_url;

                      return (
                        <div 
                          key={appointment.id || appointment.appointment_id || Math.random()}
                          className="glass-card p-4 rounded-lg hover:shadow-md transition-shadow card-hover"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-medical-darkGray">{therapistName}</h3>
                              {/* <p className="text-sm text-medical-text">{department}</p> */}
                            </div>
                            {isOnline && (
                              <span className="flex items-center text-xs font-medium px-2 py-1 bg-medical-pink/10 text-medical-pink rounded-full">
                                <Video size={14} className="mr-1" />
                                Online
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center text-sm text-medical-text">
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span>{timeSlot}</span>
                            </div>
                            {/* <span>{room}</span> */}
                          </div>
                          
                          {isOnline && meetLink && (
                            <a 
                              href={meetLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="mt-3 text-xs flex items-center justify-center text-white bg-medical-blue hover:bg-blue-600 rounded-md px-3 py-1 transition-colors"
                            >
                              <Video size={14} className="mr-1" />
                              Join Meeting
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Right Sidebar - 30% width */}
              <div className="lg:w-[30%] space-y-6">
                {/* Homework Section */}
                <HomeworkSection 
                  homework={homework}
                  isOpen={homeworkOpen}
                  onOpenChange={setHomeworkOpen}
                  isTherapist={false}
                  homeworkLoading={homeworkLoading}
                  homeworkError={homeworkError}
                  onRefresh={fetchHomework}
                />
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default function PatientDetailsPage() {
  return (
    <ProtectedLayout>
      <PatientDetails />
    </ProtectedLayout>
  );
}


