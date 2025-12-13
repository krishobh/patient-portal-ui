import React from 'react';
import { Video, MapPin } from 'lucide-react';

interface Appointment {
  appointment_id: number;
  consultant_id: number;
  is_online: boolean;
  availability_date: string;
  slot_name: string;
  slot_end_time: string;
  patient_name?: string | null;
  patient_email?: string | null;
  patient_gender?: string | null;
  category_name?: string;
  category_code?: string;
  patient_code?: any;
  status?: string;
  zoom_join_url?: string;
  zoom_start_url?: string;
}

interface ScheduleTileProps {
  appointment: any;
  onClick?: () => void;
  therapistName?: string;
  therapistImage?: string;
}

const ScheduleTile: React.FC<ScheduleTileProps> = ({
  appointment,
  onClick,
  therapistName,
  therapistImage
}) => {
  const handleTileClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleJoinMeeting = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent tile click event
    const zoomUrl = appointment.zoom_start_url || appointment.zoom_join_url;
    if (zoomUrl) {
      window.open(zoomUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const statusClassMap: Record<string, string> = {
    'APPROVAL_PENDING': 'in-progress',
    'DONE': 'done',
    'APPROVED': 'approved',
    'CANCELLED': 'cancelled',
  };

  const status = appointment.status?.toUpperCase() || '';
  const statusClass = statusClassMap[status] || '';
  
  const baseClasses = "bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer";
  const className = statusClass ? `${baseClasses} ${statusClass}` : baseClasses;

  return (
    <div 
      className={className}
      onClick={handleTileClick}
    >
      {
        
        (appointment.group_id || appointment.department_id) &&
        <h3 className="font-medium text-medical-darkGray">GROUP SESSIONS</h3>
      }
      {
        appointment.consultant_id &&
        <h3 className="font-medium text-medical-darkGray">{appointment.patient_name || ''}</h3>
      }
      <p className="text-xs text-medical-text mt-1">ID: {appointment.patient_code || ''}</p>
      
      <div className="mt-3">
        <p className="text-sm text-medical-darkGray"> {appointment.category_name? `Category: ${appointment.category_name}` : ''}</p>
        <p className="text-xs text-medical-text mt-1">{`${appointment.slot_name} - ${appointment.slot_end_time}`}</p>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        {appointment.is_online ? (
          <div className="flex items-center">
            <Video size={15} className="text-medical-blue mr-1" />
            <span className="text-xs text-medical-text">Online Session</span>
          </div>
        ) : (
          <div className="flex items-center">
            <MapPin size={15} className="text-medical-teal mr-1" />
            <span className="text-xs text-medical-text">In-Person</span>
          </div>
        )}
        {appointment.is_online && (appointment.zoom_start_url || appointment.zoom_join_url) && (
          <button 
            onClick={handleJoinMeeting}
            className="text-xs text-white bg-medical-blue px-2 py-1 rounded hover:bg-medical-teal transition-colors"
          >
            Join Meeting
          </button>
        )}
      </div>
    </div>
  );
};

export default ScheduleTile;
