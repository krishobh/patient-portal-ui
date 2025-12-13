import React from "react";
import { Calendar, Clock, LogOut, ArrowLeft, Plus, X, Settings } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/ToastContext";
import { useState } from "react";
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';

interface PatientHeaderProps {
  patient?: {
    id: string;
    name: string;
    photo: string;
    diagnoses: string[];
    therapyDepartments: Array<{
      name: string;
      therapist: string;
    }>;
  };
  currentTime?: Date;
  showLogout?: boolean;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient,
  currentTime = new Date(),
  showLogout = true,
}) => {
  const router = useRouter();
  const { patientId } = router.query;
  const { toast } = useToast();
  const { execute, isLoading } = useApi();
  const { user, logout } = useUser();
  const [diagnosisInputs, setDiagnosisInputs] = useState<string[]>([""]);
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false);

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

  const handleBack = () => {
    router.back();
  };

  const handleAddDiagnosisInput = () => {
    setDiagnosisInputs([...diagnosisInputs, ""]);
  };

  const handleRemoveDiagnosisInput = (index: number) => {
    if (diagnosisInputs.length > 1) {
      const newInputs = diagnosisInputs.filter((_, i) => i !== index);
      setDiagnosisInputs(newInputs);
    }
  };

  const handleDiagnosisInputChange = (index: number, value: string) => {
    const newInputs = [...diagnosisInputs];
    newInputs[index] = value;
    setDiagnosisInputs(newInputs);
  };

  const handleSavePatientDetails = async () => {
    const validDiagnoses = diagnosisInputs.filter(
      (input) => input.trim() !== ""
    );
    const patientIdInt = typeof patientId === 'string' ? parseInt(patientId, 10) : Array.isArray(patientId) ? parseInt(patientId[0], 10) : undefined;
    if (!patientIdInt || isNaN(patientIdInt)) {
      toast({
        title: "Error",
        description: "Invalid patient ID in URL.",
        variant: "destructive",
      });
      return;
    }
    if (validDiagnoses.length > 0 && user?.token) {
      try {
        for (const diagnosis of validDiagnoses) {
          await execute(
            'post',
            '/v1/patients/diagnosis',
            {
              patient_id: patientIdInt,
              diagnosis_text: diagnosis,
            },
            {
              showSuccessToast: false,
            },
            { Authorization: `Bearer ${user.token}` }
          );
        }
        toast({
          title: "Patient Details Updated",
          description: "Diagnosis information has been saved successfully",
        });
        setIsPatientDetailsOpen(false);
        setDiagnosisInputs([""]);
        // Refresh the page to show updated diagnoses
        router.reload();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save diagnosis information",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please enter at least one diagnosis",
        variant: "destructive",
      });
    }
  };

  const renderHeader = () => {
    return (
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {patient ? (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors mr-4"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5 text-medical-darkGray" />
                </button>
                <div className="mr-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={patient.photo} alt={patient.name} />
                    <AvatarFallback>{patient.name.split('')[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-medical-darkGray">
                      {patient.name}
                    </h1>
                    <span className="ml-3 text-sm font-medium px-2 py-1 bg-medical-lightBlue text-medical-blue rounded-full">
                      {patient.id}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-sm font-medium text-medical-text">
                        Diagnoses:
                      </span>
                      {patient.diagnoses.map((diagnosis, index) => (
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

              <div className="flex flex-col items-end">
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
            </div>
          ) : (
            <div className="flex justify-end">
              {showLogout && (
                <>
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
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4 hidden">
          {patient &&
            patient.therapyDepartments &&
            patient.therapyDepartments.map((dept, index) => (
              <div
                key={index}
                className="flex items-center glass-card px-3 py-1 rounded-md"
              >
                <span className="text-xs font-medium text-medical-teal">
                  {dept.name}:
                </span>
                <span className="text-xs ml-1 text-medical-darkGray">
                  {dept.therapist}
                </span>
              </div>
            ))}
        </div>

        <Dialog open={isPatientDetailsOpen} onOpenChange={setIsPatientDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis
                </label>
                <div className="space-y-2">
                  {diagnosisInputs.map((diagnosis, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={diagnosis}
                        onChange={(e) => handleDiagnosisInputChange(index, e.target.value)}
                        placeholder="Enter diagnosis"
                        className="flex-1"
                      />
                      {index === diagnosisInputs.length - 1 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleAddDiagnosisInput}
                          className="h-10 w-10 p-0"
                        >
                          <Plus size={16} />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveDiagnosisInput(index)}
                          className="h-10 w-10 p-0"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsPatientDetailsOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePatientDetails}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
    );
  };

  return renderHeader();
};

export default PatientHeader;
