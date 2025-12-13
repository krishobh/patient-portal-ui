import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Patient {
  id: string;
  name: string;
  age: number;
  image: string;
}

const mockPatients: Patient[] = [
  {
    id: 'P001',
    name: 'John Doe',
    age: 28,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  },
  {
    id: 'P002',
    name: 'Jane Smith',
    age: 35,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
  },
  {
    id: 'P003',
    name: 'Robert Johnson',
    age: 42,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert'
  }
];

const PatientSelection: React.FC = () => {
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleProceed = () => {
    if (selectedPatientId) {
      router.push(`/patient?patientId=${selectedPatientId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-medical-lightBlue">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold text-medical-darkGray">Clinic Portal</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-medical-darkGray mb-2">
              Select Patient
            </h1>
            <p className="text-medical-text">Choose a patient profile to continue</p>
          </div>

          {/* Patient Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {mockPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className={`cursor-pointer bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all ${
                  selectedPatientId === patient.id
                    ? 'border-2 border-medical-blue ring-2 ring-medical-blue/20'
                    : 'border-2 border-transparent'
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-medical-lightBlue flex items-center justify-center overflow-hidden">
                    {patient.image ? (
                      <img src={patient.image} alt={patient.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-medical-blue" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg text-medical-darkGray">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-medical-text">Age: {patient.age}</p>
                    <p className="text-xs text-medical-text mt-1">ID: {patient.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Proceed Button */}
          {selectedPatientId && (
            <div className="flex justify-center">
              <Button
                onClick={handleProceed}
                size="lg"
                className="px-12"
              >
                Proceed
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientSelection;


