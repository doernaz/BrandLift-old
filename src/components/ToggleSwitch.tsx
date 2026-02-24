
import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange }) => {
  const handleChange = () => {
    onChange(!checked);
  };

  return (
    <label htmlFor="toggle-switch" className="flex items-center cursor-pointer">
      <span className="mr-3 text-sm font-medium text-slate-300">{label}</span>
      <div className="relative">
        <input
          id="toggle-switch"
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={handleChange}
        />
        <div className={`block w-14 h-8 rounded-full transition ${checked ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${checked ? 'translate-x-6' : ''}`}></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
