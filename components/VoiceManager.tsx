import React from 'react';
import { SparklesIcon, UploadIcon } from './Icons';
import Button from './Button';

interface VoiceManagerProps {
  voiceSampleBase64: string | undefined;
  isAiLoading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => void;
  handleGenerateVocalDescription: () => void;
}

const VoiceManager: React.FC<VoiceManagerProps> = ({
  voiceSampleBase64,
  isAiLoading,
  handleFileChange,
  handleGenerateVocalDescription,
}) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-medium text-white mb-2">Voice Sample</h3>
      {voiceSampleBase64 && (
        <audio controls src={voiceSampleBase64} className="w-full mb-4" />
      )}
      <div className="flex space-x-2">
        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 transition flex items-center">
          <UploadIcon className="mr-2 h-5 w-5" />
          Upload Audio
          <input
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={(e) => handleFileChange(e, 'audio')}
          />
        </label>
        <Button
          onClick={handleGenerateVocalDescription}
          variant="secondary"
          disabled={isAiLoading || !voiceSampleBase64}
        >
          <SparklesIcon className={`mr-2 h-5 w-5 ${isAiLoading ? 'animate-spin' : ''}`} />
          {isAiLoading ? 'Analyzing...' : 'AI Analyze Voice'}
        </Button>
      </div>
    </div>
  );
};

export default VoiceManager;
