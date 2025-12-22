import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { LogOut, Calendar, ArrowLeft, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dynamic from "next/dynamic";
import { useUser } from "@/contexts/UserContext";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/contexts/ToastContext";
import ProtectedLayout from "@/layouts/ProtectedLayout";

// Import Froala editor styles
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
// import "froala-editor/js/plugins.pkgd.min.js";

const FroalaEditorComponent = dynamic(() => import("react-froala-wysiwyg"), {
  ssr: false,
});

interface ReportData {
  id: number;
  report_template_id: number;
  description: string;
  patient_id: number;
  created_by: number;
  modified_by: number | null;
  approved_by: number | null;
  title: string;
  is_deleted: boolean;
  approved_at: string | null;
  status: string;
  created_at: string;
  modified_at: string;
  ReportTemplate: {
    id: number;
    name: string;
    template: string;
    department_id: number;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
  };
  Patient: {
    id: number;
    organisation_id: number;
    full_name: string;
    notification_name: string;
    email: string;
    gender: string;
    is_active: boolean;
    is_deleted: boolean;
    code: string;
    token: string | null;
    password: string;
    role: string;
    whatsapp_num: string | null;
    photo: string | null;
    createdAt: string;
    updatedAt: string;
  };
  creator: {
    id: number;
    department_id: number;
    name: string;
    code: string;
    is_active: boolean;
    is_deleted: boolean;
    token: string;
    email: string;
    password: string;
    role: string;
    whatsapp_num: string;
    photo: string | null;
    reports_to: number | null;
    createdAt: string;
    updatedAt: string;
  };
  modifier: any;
  approver: any;
}

const EditReport = () => {
  const router = useRouter();
  // Changed: Get id and reportId from query parameters instead of dynamic route
  const patientId = router.query.id as string;
  const reportId = router.query.reportId as string;
  const { user, logout } = useUser();
  const { toast } = useToast();
  const { execute, isLoading } = useApi();

  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [reportupdate, setreportupdate] = useState(1);
  const froalaRef = useRef<any>(null);

  const [pluginsLoaded, setPluginsLoaded] = useState(false);

  const formattedDate = useMemo(() => {
    if (!user?.business_date) return "";
    const date = new Date(user.business_date);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [user?.business_date]);

  // Load report data on mount
  useEffect(() => {
    if (!router.isReady || !reportId || !user?.token) return;

    const fetchReportData = async () => {
      setIsLoadingReport(true);
      try {
        const data = await execute<ReportData>(
          "get",
          `/v1/patient-report/${reportId}`,
          undefined,
          {
            onSuccess: (data) => {
              setReportData(data);
              setSelectedTemplate(data.ReportTemplate);
              setReportContent(data.description);
              setReportTitle(data.title);
              setPatientData(data.Patient);
            },
            onError: () => {
              toast({
                title: "Error",
                description: "Failed to load report data.",
                variant: "destructive",
              });
              router.back();
            },
          },
          { Authorization: `Bearer ${user.token}` }
        );
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load report data.",
          variant: "destructive",
        });
        router.back();
      } finally {
        setIsLoadingReport(false);
      }
    };

    fetchReportData();
  }, [reportId, user?.token, router.isReady,reportupdate]);


  const getInitials = (name: string) => {
    if (!name) return "P";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };
  const currentTime = useMemo(() => {
    if (!user?.business_date) return new Date();
    const date = new Date(user.business_date);
    return date;
  }, [user?.business_date]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  useEffect(() => {
    const loadPlugins = async () => {
      if (typeof window === "undefined") return;
      try {
        await Promise.all([
          import("froala-editor/js/plugins/print.min.js"),
          import("froala-editor/js/plugins/font_family.min.js"),
          import("froala-editor/js/plugins/align.min.js"),
          import("froala-editor/js/plugins/colors.min.js"),
          import("froala-editor/js/plugins/font_size.min.js"),
          import("froala-editor/js/plugins/lists.min.js"),
          import("froala-editor/js/plugins/paragraph_style.min.js"),
          import("froala-editor/js/plugins/table.min.js"),
          import("froala-editor/js/plugins/quote.min.js"),
        ]);
        setPluginsLoaded(true);
      } catch (err) {
        // swallow plugin load errors; editor will still mount without them
        console.error("Failed to load froala plugins", err);
        setPluginsLoaded(true);
      }
    };
    loadPlugins();
  }, []);
  if (!pluginsLoaded) return <div></div>;

  if (!router.isReady) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-medical-text">Initializing...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (isLoadingReport || !reportData) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-medical-text">Loading report data...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="w-full bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="flex items-center">
                  <div className="mr-4">
                    <Avatar className="h-16 w-16 border-2 border-medical-teal">
                      <AvatarImage
                        src={user?.photo}
                        alt={user?.user_name}
                      />
                      <AvatarFallback className="bg-medical-lightBlue text-medical-blue text-lg font-semibold">
                        {getInitials(user?.user_name || "" )}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-medical-darkGray">
                      {user?.user_name || "Patient"}
                    </h1>
                  </div>
                </div>
                <div>
                  <img
                    src={user?.organisation?.logo}
                    alt={user?.organisation?.name}
                    className="h-6"
                  />
                </div>
                <div className="flex items-center text-medical-darkGray mb-1 gap-6">
                  <Calendar size={18} className="mr-1" />
                  <span>{formatDate(currentTime)}</span>
                  <button
                    onClick={() => router.push("/reset-password")}
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
                {(patientData?.preferred_consultants || []).map(
                  (consultant: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center glass-card px-3 py-1 rounded-md"
                    >
                      <span className="text-xs font-medium text-medical-teal">
                        {consultant.department}:
                      </span>
                      <span className="text-xs ml-1 text-medical-darkGray">
                        {consultant.name}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="bg-card rounded-lg shadow p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Report Title
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-medical-teal focus:border-medical-teal"
                  placeholder="Enter report title"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  disabled={isLoading || reportData.status == "APPROVED"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Report Content
                </label>
                <div
                  className={`min-h-[400px] ${
                    reportData.status == "APPROVED" ? "editor-locked" : ""
                  }`}
                >
                  <FroalaEditorComponent
                    tag="textarea"
                    model={reportContent}
                    onModelChange={(value: any) => {
                      setReportContent(value);
                    }}
                    config={{
                      placeholderText: "Edit Your Report Content Here!",
                      charCounterCount: false,
                      height: 700,
                      toolbarButtons: [
                        "undo",
                        "redo",
                        "|",
                        "bold",
                        "italic",
                        "underline",
                        "strikeThrough",
                        "subscript",
                        "superscript",
                        "|",
                        "fontFamily",
                        "fontSize",
                        "textColor",
                        "backgroundColor",
                        "inlineStyle",
                        "paragraphStyle",
                        "|",
                        "paragraphFormat",
                        "align",
                        "formatOL",
                        "formatUL",
                        "outdent",
                        "indent",
                        "quote",
                        "-",
                        "insertLink",
                        "insertImage",
                        "insertVideo",
                        "insertTable",
                        "|",
                        "emoticons",
                        "fontAwesome",
                        "specialCharacters",
                        "embedly",
                        "insertFile",
                        "insertHR",
                        "|",
                        "print",
                        "getPDF",
                        "spellChecker",
                        "selectAll",
                        "clearFormatting",
                        "|",
                        "fullscreen",
                        "help",
                        "html",
                      ],
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-medical-text">
                  <p>
                    <strong>Last Modified:</strong>{" "}
                    {new Date(
                      reportData.modified_at || reportData.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
};

export default EditReport;
