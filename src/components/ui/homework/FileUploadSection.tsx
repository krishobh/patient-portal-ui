import React from 'react';
import { Paperclip, X } from 'lucide-react';

interface FileUploadSectionProps {
  selectedFiles: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  selectedFiles,
  onFileSelect,
  onRemoveFile,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-medical-darkGray mb-1">
          Attach Files
        </label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Paperclip size={20} className="text-medical-text mb-2" />
              <p className="text-xs text-medical-text">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-medical-text">PDF, DOC, DOCX, XLS, XLSX, PNG, JPG</p>
            </div>
            <input id="file-upload" type="file" className="hidden" onChange={onFileSelect} multiple />
          </label>
        </div>
      </div>
      
      {selectedFiles.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-medical-darkGray mb-2">Selected Files</h5>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                <Paperclip size={14} className="text-medical-text mr-2" />
                <span className="text-sm flex-1 truncate">{file.name}</span>
                <button 
                  type="button"
                  onClick={() => onRemoveFile(index)} 
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;


