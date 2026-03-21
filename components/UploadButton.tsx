import React, { memo } from 'react';
import { UploadIcon } from './Icons';

interface UploadButtonProps {
  label: string;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadButton: React.FC<UploadButtonProps> = memo(({ label, accept, onChange }) => (
  <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 transition flex items-center">
    <UploadIcon className="mr-2 h-5 w-5" />
    {label}
    <input
      type="file"
      className="hidden"
      accept={accept}
      onChange={onChange}
    />
  </label>
));

export default UploadButton;
