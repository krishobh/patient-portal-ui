import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ClipboardList, ChevronDown, ChevronUp, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeworkListItem from './homework/HomeworkListItem';
import HomeworkModal from './homework/HomeworkModal';

interface HomeworkItem {
  id: number;
  date: string;
  title: string;
  description: string;
  files: { name: string; url: string }[];
  status: 'PENDING' | 'COMPLETED';
  consultant?: string;
}

interface HomeworkSectionProps {
  homework: HomeworkItem[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isTherapist?: boolean;
  homeworkLoading?: boolean;
  homeworkError?: string | null;
  onRefresh?: () => void;
}

const HomeworkSection: React.FC<HomeworkSectionProps> = ({ 
  homework, 
  isOpen, 
  onOpenChange,
  isTherapist = false,
  homeworkLoading = false,
  homeworkError = null,
  onRefresh
}) => {
  const router = useRouter();
  const { patientId } = router.query;
  const [isExpanded, setIsExpanded] = useState(true);
  const [modalHomework, setModalHomework] = useState<HomeworkItem | null>(null);
  const [newHomeworkTitle, setNewHomeworkTitle] = useState('');
  const [newHomeworkDescription, setNewHomeworkDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHomeworkClick = (homework: HomeworkItem) => {
    setModalHomework(homework);
    onOpenChange(true);
  };

  const handleAddHomework = () => {
    setModalHomework(null);
    onOpenChange(true);
  };

  const handleCloseModal = () => {
    onOpenChange(false);
    setModalHomework(null);
    setNewHomeworkTitle('');
    setNewHomeworkDescription('');
    setSelectedFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmit = async () => {
    if (modalHomework) {
      handleCloseModal();
      return;
    }
    if (!newHomeworkTitle.trim() || !newHomeworkDescription.trim()) {
      return;
    }
    setIsSubmitting(true);
    // Mock submission - in real app this would call API
    setTimeout(() => {
      setIsSubmitting(false);
      handleCloseModal();
      if (onRefresh) onRefresh();
    }, 1000);
  };

  return (
    <>
      <div className="glass-card rounded-xl p-6 mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-lg font-bold text-medical-darkGray flex items-center">
            <ClipboardList size={18} className="mr-2 text-medical-teal" />
            Homework
          </h2>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs flex items-center justify-center mr-2 text-medical-teal hover:text-medical-blue transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const patientIdStr = Array.isArray(patientId) ? patientId[0] : patientId;
                if (patientIdStr) {
                  router.push(`/all-homework?patientId=${patientIdStr}`);
                }
              }}
            >
              Show All
              <ArrowRight size={14} className="ml-1" />
            </Button>
            {isExpanded ? (
              <ChevronUp size={18} className="text-medical-text" />
            ) : (
              <ChevronDown size={18} className="text-medical-text" />
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {homeworkLoading ? (
              <p className="text-sm text-center text-medical-text py-3">
                Loading homework...
              </p>
            ) : homeworkError ? (
              <p className="text-sm text-center text-medical-text py-3">
                Error: {homeworkError}
              </p>
            ) : homework.length === 0 ? (
              <p className="text-sm text-center text-medical-text py-3">
                No homework assigned
              </p>
            ) : (
              homework.map((item) => (
                <HomeworkListItem key={item.id} item={item} onClick={handleHomeworkClick} formatDate={formatDate} />
              ))
            )}
          </div>
        )}
      </div>
      <HomeworkModal
        isOpen={isOpen}
        modalHomework={modalHomework}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isTherapist={isTherapist}
        formatDate={formatDate}
        newHomeworkTitle={newHomeworkTitle}
        setNewHomeworkTitle={setNewHomeworkTitle}
        newHomeworkDescription={newHomeworkDescription}
        setNewHomeworkDescription={setNewHomeworkDescription}
        selectedFiles={selectedFiles}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeFile}
        isSubmitting={isSubmitting}
        onDelete={onRefresh}
        onStatusUpdate={onRefresh}
      />
    </>
  );
};

export default HomeworkSection;


