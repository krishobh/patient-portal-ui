import React from 'react';
import { Paperclip } from 'lucide-react';

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

interface HomeworkListItemProps {
  item: HomeworkItem;
  onClick: (item: HomeworkItem) => void;
  formatDate: (date: string) => string;
}

const HomeworkListItem: React.FC<HomeworkListItemProps> = ({ item, onClick, formatDate }) => {
  return (
    <div
      onClick={() => onClick(item)}
      className="p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-medical-darkGray">{item.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
          {item.status === 'COMPLETED' ? 'Completed' : 'Pending'}
        </span>
      </div>
      <p className="text-xs text-medical-text mt-1">{formatDate(item.date)}</p>
      
      {item.files.length > 0 && (
        <div className="mt-2 flex items-center">
          <Paperclip size={12} className="text-medical-text mr-1" />
          <span className="text-xs text-medical-text">{item.files.length} file(s)</span>
        </div>
      )}
    </div>
  );
};

export default HomeworkListItem;


