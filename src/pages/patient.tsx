import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import PatientHeader from "@/components/patient/PatientHeader";
import ReportTypes from "@/components/patient/ReportTypes";
import ReportList from "@/components/patient/ReportList";
import HomeworkSection from "@/components/ui/HomeworkSection";
import ScheduleTile from "@/components/ui/ScheduleTile";
import { FileText, User, Calendar } from "lucide-react";
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
  const { user, hydrated } = useUser();
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

  // Map API templates to ReportTypes format
  const reportTypeButtons = reportTemplates.map((tpl: any) => ({
    id: tpl.id?.toString() || tpl.type || tpl.name,
    name: tpl.name,
    icon: FileText,
  }));

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

  const fetchHomework = () => {
    // Get patientId as string (handle array case from Next.js query)
    const patientIdStr = Array.isArray(patientId) ? patientId[0] : patientId;
    
    if (!patientIdStr || !user?.token || !user?.user_id || !selectedConsultant?.id)
      return;
    setHomeworkLoading(true);
    setHomeworkError(null);
    execute<any>(
      "get",
      `/v1/patients/homeworks?consultant_id=${selectedConsultant?.id}&patient_id=${patientIdStr}&page=1&per_page=5`,
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
          <PatientHeader patient={patientData} currentTime={currentTime} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0">
              <div className="lg:w-[70%] lg:pr-6">
                {/* Appointments Section */}
                <div className="glass-card rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-medical-darkGray flex items-center">
                      <Calendar size={20} className="mr-2 text-medical-teal" />
                      Today's Appointments
                    </h2>
                    <span className="text-sm font-medium px-3 py-1 bg-medical-lightBlue text-medical-blue rounded-full">
                      {user?.business_date ? formatDate(new Date(user.business_date)) : formatDate(currentTime)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {appointmentsLoading && (
                      <div className="col-span-full text-center py-4 text-medical-text">
                        Loading appointments...
                      </div>
                    )}
                    {appointmentsError && (
                      <div className="col-span-full text-center py-4 text-red-500">
                        {appointmentsError}
                      </div>
                    )}
                    {!appointmentsLoading &&
                      !appointmentsError &&
                      appointments.length === 0 && (
                        <div className="col-span-full text-center py-4 text-medical-text">
                          No appointments found.
                        </div>
                      )}
                    {appointments.map((appointment: any) => (
                      <ScheduleTile
                        key={
                          appointment.id ||
                          appointment.appointment_id ||
                          Math.random()
                        }
                        appointment={appointment}
                        onClick={() => {}}
                      />
                    ))}
                  </div>
                </div>

                {/* Therapist Section */}
                <div className="glass-card rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-medical-darkGray flex items-center">
                      <User size={18} className="mr-2 text-medical-teal" />
                      Therapists
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patientData.preferred_consultants.map((consultant: any, index: number) => {
                      const isSelected = selectedConsultant?.id === consultant.id;

                      return (
                        <div
                          key={index}
                          className={`bg-white rounded-lg p-4 shadow-sm transition-shadow border ${
                            isSelected
                              ? "border-medical-teal bg-medical-lightBlue"
                              : "border-gray-100"
                          } hover:shadow-md hover:border-medical-teal cursor-pointer`}
                          onClick={() => setSelectedConsultant(consultant)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-medical-lightBlue flex items-center justify-center mr-3">
                              <User
                                size={16}
                                className="text-medical-blue"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-medical-darkGray">
                                {consultant.name}
                              </p>
                              <p className="text-xs text-medical-text">
                                {consultant.department}
                              </p>
                              <p className="text-xs text-medical-text">
                                Code: {consultant.code}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* <ReportTypes
                  reportTypes={reportTypeButtons}
                  selectedReportType={selectedReportType}
                  onReportTypeSelect={handleReportTypeSelect}
                />
                
                {reportTemplates.length === 0 ? (
                  <div className="glass-card rounded-xl p-6 mb-6 text-center text-medical-text">
                    <p className="mb-2">
                      No report templates found.
                    </p>
                  </div>
                ) : (
                  <ReportList
                    reports={reports}
                    selectedReportType={selectedReportType}
                    reportTypeName={
                      reportTypeButtons.find((rt) => rt.id === selectedReportType)
                        ?.name || ""
                    }
                    onReportSelect={handleReportSelect}
                  />
                )} */}
              </div>
              <div className="lg:w-[30%]">
                {/* Homework Section */}
                <HomeworkSection
                  homework={homework}
                  isOpen={homeworkOpen}
                  onOpenChange={setHomeworkOpen}
                  isTherapist={true}
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


