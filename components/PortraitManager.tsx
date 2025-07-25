import React from 'react';
import { SparklesIcon, UserIcon, UploadIcon }e from './Icons';
import Button from './Button';

interface PortraitManagerProps {
  portraitBase64: string | undefined;
  isPortraitLoading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => void;
  handleGeneratePortrait: () => void;
}

const PortraitManager: React.FC<PortraitManagerProps> = ({
  portraitBase64,
  isPortraitLoading,
  handleFileChange,
  handleGeneratePortrait,
}) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center">
      {portraitBase64 ? (
        <img
          src={portraitBase64}
          alt="Character portrait"
          className="rounded-lg w-48 h-48 object-cover mb-4"
        />
      ) : (
        <div className="bg-gray-600 border-2 border-dashed border-gray-400 rounded-lg w-48 h-48 flex items-center justify-center mb-4">
          <UserIcon className="h-16 w-16 text-gray-400" />
        </div>
      )}
      <div className="flex space-x-2">
        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 transition flex items-center">
          <UploadIcon className="mr-2 h-5 w-5" />
          Upload Image
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'image')}
          />
        </label>
        <Button
          onClick={handleGeneratePortrait}
          variant="secondary"
          disabled={isPortraitLoading}
        >
          <SparklesIcon className={`mr-2 h-5 w-5 ${isPortraitLoading ? 'animate-spin' : ''}`} />
          {isPortraitLoading ? 'Generating...' : 'AI Generate'}
        </Button>
      </div>
    </div>
  );
};

export default PortraitManager;
