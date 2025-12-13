import React, { useState, useEffect, useMemo } from "react";
import PatientHeader from "@/components/patient/PatientHeader";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useRouter } from "next/router";
import { useApi } from "@/hooks/useApi";
import { useUser } from "@/contexts/UserContext";
import ProtectedLayout from "@/layouts/ProtectedLayout";

interface HomeworkFile {
  name: string;
  url: string;
}

interface HomeworkItem {
  id: number;
  date: string;
  title: string;
  description: string;
  files: HomeworkFile[];
  status: "PENDING" | "COMPLETED";
  consultant?: string;
  Consultant: {
    id: string,
    name: string
  };
}

interface ConsultantItem {
  id: number;
  name: string;
}

const AllHomeworkPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { execute } = useApi();
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
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
    return date
  }, [user?.business_date]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (!router.isReady || !user?.token || !user?.user_id || !patientId) return;
    setLoading(true);
    setError(null);
    let query = `/v1/patients/homeworks?page=${currentPage}&per_page=${itemsPerPage}&patient_id=${patientId}`;
    if (selectedStatus != "all") {
      query += `&status=${selectedStatus}`;
    }
    if (selectedDate != null) {
      query += `&date=${selectedDate}`;
    }
    if(selectedConsultant != 'all'){
      query+= `&consultant_id=${selectedConsultant}`
    }
    if(user?.role?.code === "CONSULTANT"){
      query+= `&consultant_id=${user.user_id}`
    }
    execute<any>(
      "get",
      `${query}`,
      undefined,
      {
        onSuccess: (data) => {
          const mapped: HomeworkItem[] = (data.data || []).map((item: any) => ({
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
            Consultant:item.Consultant,
            status: item.status || "PENDING",
            consultant: item.consultant_id
              ? String(item.consultant_id)
              : undefined,
          }));
          setHomework(mapped);
          setLoading(false);
          setTotalPages(Math.ceil(data.count/itemsPerPage));

        },
        onError: (err) => {
          setHomework([]);
          setError("Failed to load homework.");
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
    currentPage,
    selectedConsultant
  ]);

  // Set consultants from preferred_consultants in patient summary

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
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
            photo:
              data.photo || "",
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
          const preferredConsultants: ConsultantItem[] = (data.preferred_consultants || []).map((c: any) => ({
            id: Number(c.id),
            name: String(c.name || c.code || "Consultant")
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

  const filteredHomework = homework
    .filter(
      (hw) =>
        selectedConsultant === "all" || hw.consultant === selectedConsultant
    )
    .filter((hw) => !selectedDate || hw.date === selectedDate);

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader patient={patientData} currentTime={currentTime} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">All Homework</h1>
          {/* <Button onClick={() => {}} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Homework
          </Button> */}
        </div>

        <div className="mb-6 flex gap-4">
          <div className="w-48">
            <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
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
              Loading homework...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {homework.map((homework) => (
                    <TableRow
                      key={homework.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>{formatDate(homework.date)}</TableCell>
                      <TableCell>{homework.title}</TableCell>
                      <TableCell>{homework.Consultant.name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            homework.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {homework.status === "COMPLETED"
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
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

const AllHomework = () => {
  return (
    <ProtectedLayout>
      <AllHomeworkPage />
    </ProtectedLayout>
  );
};

export default AllHomework;
