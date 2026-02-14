import React, { useState, useEffect, useMemo } from "react";
import PatientHeader from "@/components/patient/PatientHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/router";
import { useApi } from "@/hooks/useApi";
import { useUser } from "@/contexts/UserContext";
import ProtectedLayout from "@/layouts/ProtectedLayout";

interface ConsultantItem {
  id: number;
  name: string;
}

interface Report {
  id: number;
  title: string;
  created_at: string;
  created_by: number;
  status: string;
  report_template_id: number;
  description: string;
  ReportTemplate: {
    id: number;
    name: string;
  };
  creator: {
    id: number;
    name: string;
  };
}

const AllReportsPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { execute } = useApi();
  const [reports, setReports] = useState<Report[]>([]);
  const [consultants, setConsultants] = useState<ConsultantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedConsultant, setSelectedConsultant] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  const [patientData, setPatientData] = useState<any | null>(null);

  // Get patientId from query params (handle array case)
  const patientId = useMemo(() => {
    const id = router.query.patientId;
    return Array.isArray(id) ? id[0] : id;
  }, [router.query.patientId]);

  const currentTime = useMemo(() => {
    if (!user?.business_date) return new Date();
    const date = new Date(user.business_date);
    return date;
  }, [user?.business_date]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Fetch reports
  useEffect(() => {
    if (!router.isReady || !user?.token || !user?.user_id || !patientId) return;
    setLoading(true);
    setError(null);

    let query = `/v1/patient-report?page=${currentPage}&per_page=${itemsPerPage}&patient_id=${patientId}&is_available_for_patient=true`;
    
    if (selectedStatus !== "all") {
      query += `&status=${selectedStatus}`;
    }
    if (selectedDate !== "") {
      query += `&date=${selectedDate}`;
    }
    if (selectedConsultant !== "all") {
      query += `&created_by=${selectedConsultant}`;
    }

    execute<any>(
      "get",
      query,
      undefined,
      {
        onSuccess: (data) => {
          setReports(data.data || []);
          setLoading(false);
          setTotalPages(Math.ceil(data.count / itemsPerPage));
        },
        onError: (err) => {
          setReports([]);
          setError("Failed to load reports.");
          setLoading(false);
        },
      },
      { Authorization: `Bearer ${user.token}` }
    );
  }, [
    router.isReady,
    patientId,
    user?.token,
    user?.user_id,
    selectedDate,
    selectedStatus,
    selectedConsultant,
    currentPage,
  ]);

  // Fetch patient data for header
  useEffect(() => {
    if (!router.isReady || !patientId || !user?.token) return;
    setLoading(true);
    setError(null);
    execute<any>(
      "get",
      `/v1/patients/${patientId}/summary`,
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
          // Set consultants from preferred_consultants
          const preferredConsultants: ConsultantItem[] = (
            data.preferred_consultants || []
          ).map((c: any) => ({
            id: Number(c.id),
            name: String(c.name || c.code || "Consultant"),
          }));
          setConsultants(preferredConsultants);
          setLoading(false);
        },
        onError: (err) => {
          setPatientData(null);
          setConsultants([]);
          setError("Failed to load patient data.");
          setLoading(false);
        },
      },
      { Authorization: `Bearer ${user.token}` }
    );
  }, [router.isReady, patientId, user?.token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader patient={patientData} currentTime={currentTime} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">All Reports</h1>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="w-48">
            <Select
              value={selectedConsultant}
              onValueChange={setSelectedConsultant}
            >
              <SelectTrigger>
                <SelectValue placeholder="Consultant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {consultants.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md border"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg shadow">
          {loading ? (
            <div className="text-center py-8 text-medical-text">
              Loading reports...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        No reports found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          router.push(
                            `/patient-edit-report?id=${patientId}&reportId=${report.id}`
                          );
                        }}
                      >
                        <TableCell>{formatDate(report.created_at)}</TableCell>
                        <TableCell>
                          {report.ReportTemplate?.name || "N/A"}
                        </TableCell>
                        <TableCell>{report.creator?.name || "N/A"}</TableCell>
                        <TableCell>{report.title || "Untitled Report"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : report.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {report.status === "PENDING_APPROVAL"
                              ? "Pending Approval"
                              : report.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </div>
        {totalPages >= 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
};

const AllReports = () => {
  return (
    <ProtectedLayout>
      <AllReportsPage />
    </ProtectedLayout>
  );
};

export default AllReports;
