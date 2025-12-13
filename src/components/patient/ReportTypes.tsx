import React from 'react';
import { FileText } from 'lucide-react';

interface ReportType {
  id: string;
  name: string;
  icon: typeof FileText;
}

interface ReportTypesProps {
  reportTypes: ReportType[];
  selectedReportType: string;
  onReportTypeSelect: (reportType: string) => void;
}

const ReportTypes: React.FC<ReportTypesProps> = ({
  reportTypes,
  selectedReportType,
  onReportTypeSelect,
}) => {
  return (
    <div className="glass-card rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-medical-darkGray flex items-center">
          <FileText size={20} className="mr-2 text-medical-teal" />
          Reports Types
        </h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {reportTypes.map((reportType) => (
          <button
            key={reportType.id}
            onClick={() => onReportTypeSelect(reportType.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
              selectedReportType === reportType.id
                ? 'bg-medical-teal text-white'
                : 'bg-white hover:bg-medical-lightGray'
            }`}
          >
            <reportType.icon size={24} className="mb-2" />
            <span className="text-sm font-medium">{reportType.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReportTypes;


