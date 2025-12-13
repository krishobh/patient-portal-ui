import React from 'react';
import { Download, Paperclip } from 'lucide-react';
import FileUploadSection from './FileUploadSection';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';

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
  status: 'PENDING' | 'COMPLETED';
  consultant?: string;
}

interface HomeworkModalProps {
  isOpen: boolean;
  modalHomework: HomeworkItem | null;
  onClose: () => void;
  onSubmit: () => void;
  isTherapist: boolean;
  formatDate: (date: string) => string;
  newHomeworkTitle: string;
  setNewHomeworkTitle: (title: string) => void;
  newHomeworkDescription: string;
  setNewHomeworkDescription: (description: string) => void;
  selectedFiles: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  isSubmitting?: boolean;
  onDelete?: () => void;
  onStatusUpdate?: () => void;
}

const HomeworkModal: React.FC<HomeworkModalProps> = ({
  isOpen,
  modalHomework,
  onClose,
  onSubmit,
  isTherapist,
  formatDate,
  newHomeworkTitle,
  setNewHomeworkTitle,
  newHomeworkDescription,
  setNewHomeworkDescription,
  selectedFiles,
  onFileSelect,
  onRemoveFile,
  isSubmitting = false,
  onDelete,
  onStatusUpdate,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const { execute } = useApi();
  const { user } = useUser();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleStatusUpdate = async () => {
    if (!modalHomework || !user?.token) return;
    setIsUpdatingStatus(true);
    const newStatus = modalHomework.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await execute(
        'put',
        `/v1/patients/homework/${modalHomework.id}`,
        {
          status: newStatus
        },
        {
          showSuccessToast: true,
          successMessage: `Homework marked as ${newStatus.toLowerCase()}`,
          onSuccess: () => {
            setIsUpdatingStatus(false);
            onClose();
            if (onStatusUpdate) onStatusUpdate();
          },
          onError: (err) => {
            setIsUpdatingStatus(false);
            toast({ title: 'Error', description: err?.message || 'Failed to update homework status', variant: 'destructive' });
          },
        },
        { Authorization: `Bearer ${user.token}` }
      );
    } catch (err: any) {
      setIsUpdatingStatus(false);
      toast({ title: 'Error', description: err?.message || 'Failed to update homework status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!modalHomework) return;
    setIsDeleting(true);
    // Mock delete - in real app this would call API
    setTimeout(() => {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      onClose();
      if (onDelete) onDelete();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-medical-darkGray">
            {modalHomework ? 'Homework Details' : 'Add New Homework'}
          </h3>
          <button 
            onClick={onClose}
            className="text-medical-text hover:text-medical-darkGray"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          {modalHomework ? (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-medical-darkGray">{modalHomework.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${modalHomework.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {modalHomework.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-medical-text">
                  Assigned: {formatDate(modalHomework.date)}
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-medical-text">{modalHomework.description}</p>
              </div>
              
              {modalHomework.files.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-medical-darkGray mb-2">Attached Files</h5>
                  <div className="space-y-2">
                    {modalHomework.files.map((file: HomeworkFile, index: number) => (
                      <div key={index} className="flex items-center p-2 bg-medical-lightGray rounded-md">
                        <Paperclip size={14} className="text-medical-text mr-2" />
                        <span className="text-sm flex-1 truncate">{file.name}</span>
                        <a 
                          href={file.url} 
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-medical-blue hover:text-medical-teal transition-colors ml-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={onClose}
                  className="secondary-button"
                >
                  Close
                </button>
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={handleStatusUpdate}
                    className="primary-button"
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus 
                      ? 'Updating...' 
                      : modalHomework.status === 'COMPLETED' 
                        ? 'Mark as Incomplete' 
                        : 'Mark as Complete'
                    }
                  </button>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="homework-title" className="block text-sm font-medium text-medical-darkGray mb-1">
                    Title
                  </label>
                  <input
                    id="homework-title"
                    type="text"
                    value={newHomeworkTitle}
                    onChange={(e) => setNewHomeworkTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-medical-teal focus:border-medical-teal"
                    placeholder="Enter homework title"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="homework-description" className="block text-sm font-medium text-medical-darkGray mb-1">
                    Description
                  </label>
                  <textarea
                    id="homework-description"
                    value={newHomeworkDescription}
                    onChange={(e) => setNewHomeworkDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-medical-teal focus:border-medical-teal"
                    placeholder="Enter detailed instructions"
                    rows={4}
                    required
                  ></textarea>
                </div>
                
                <FileUploadSection
                  selectedFiles={selectedFiles}
                  onFileSelect={onFileSelect}
                  onRemoveFile={onRemoveFile}
                />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Homework'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkModal;


