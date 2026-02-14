import React from 'react';
import { File, FileText } from 'lucide-react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

const regex = /(<([^>]+)>)/gi;

interface Report {
  id: number;
  title: string;
  date: string;
  author: string;
  content: string;
  status?: string;
  approved_by?: number;
  approved_at?: string;
  creator: any
}

interface ReportListProps {
  reports: Report[];
  selectedReportType: string;
  reportTypeName: string;
  onReportSelect: (report: Report) => void;
  patientId?: string;
}

const ReportList: React.FC<ReportListProps> = ({
  reports,
  selectedReportType,
  reportTypeName,
  onReportSelect,
  patientId
}) => {
  const router = useRouter();

  const handleViewAllReports = () => {
    router.push(`/all-reports?patientId=${patientId}`);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-medical-darkGray flex items-center">
          <FileText size={20} className="mr-2 text-medical-teal" />
          {reportTypeName || 'Reports'}
        </h2>
        <Button 
          onClick={handleViewAllReports}
          size="sm"
          className="bg-medical-teal hover:bg-medical-teal/90 text-white"
        >
          View All Reports
        </Button>
      </div>
      
      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div 
              key={report.id}
              onClick={() => onReportSelect(report)}
              className="glass-card p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer card-hover"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-medical-darkGray">{report.title}</h3>
                    {report.status && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-medical-text mt-1">By: {report.creator?.name || report.author}</p>
                  
                  {report.approved_by && report.approved_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Approved by: {report.creator?.name || 'Unknown'} on {new Date(report.approved_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-medical-lightBlue text-medical-blue rounded-full">
                  {new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              <p className="mt-3 text-sm text-medical-text line-clamp-2">
                {report.content.replace(regex, "")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-medical-lightGray flex items-center justify-center mb-4">
            <File size={24} className="text-medical-text" />
          </div>
          <h3 className="text-lg font-medium text-medical-darkGray mb-1">No Reports Found</h3>
          <p className="text-sm text-medical-text">
            There are no {reportTypeName?.toLowerCase()} available.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportList;


