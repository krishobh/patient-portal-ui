import React from 'react';

type LoginType = 'admin' | 'staff';

interface LoginTypeSelectorProps {
  selectedType: LoginType;
  onTypeChange: (type: LoginType) => void;
}

const LoginTypeSelector: React.FC<LoginTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="flex rounded-md mb-8 p-1 bg-medical-lightGray">
      <button 
        onClick={() => onTypeChange('admin')}
        className={`flex-1 py-2 rounded-md text-center transition-all ${
          selectedType === 'admin' 
            ? 'bg-white shadow-sm text-medical-darkGray font-medium' 
            : 'text-medical-text'
        }`}
      >
        Admin
      </button>
      <button 
        onClick={() => onTypeChange('staff')}
        className={`flex-1 py-2 rounded-md text-center transition-all ${
          selectedType === 'staff' 
            ? 'bg-white shadow-sm text-medical-darkGray font-medium' 
            : 'text-medical-text'
        }`}
      >
        Consultant
      </button>
    </div>
  );
};

export default LoginTypeSelector;


