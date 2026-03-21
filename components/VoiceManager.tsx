import React, { memo } from 'react';
import { SparklesIcon } from './Icons';
import Button from './Button';
import UploadButton from './UploadButton';

interface VoiceManagerProps {
  voiceSampleBase64: string | undefined;
  voiceSampleTranscript: string | null | undefined;
  isAiLoading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => void;
  handleGenerateVocalDescription: () => void;
  handleTranscriptChange: (text: string) => void;
}

const VoiceManager: React.FC<VoiceManagerProps> = memo(({
  voiceSampleBase64,
  voiceSampleTranscript,
  isAiLoading,
  handleFileChange,
  handleGenerateVocalDescription,
  handleTranscriptChange,
}) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-medium text-white mb-2">Voice Sample</h3>
      {voiceSampleBase64 && (
        <audio controls src={voiceSampleBase64} className="w-full mb-4" />
      )}
      <div className="flex space-x-2">
        <UploadButton
          label="Upload Audio"
          accept="audio/*"
          onChange={(e) => handleFileChange(e, 'audio')}
        />
        <Button
          onClick={handleGenerateVocalDescription}
          variant="secondary"
          disabled={isAiLoading || !voiceSampleBase64}
        >
          <SparklesIcon className={`mr-2 h-5 w-5 ${isAiLoading ? 'animate-spin' : ''}`} />
          {isAiLoading ? 'Analyzing...' : 'AI Analyze Voice'}
        </Button>
      </div>

      {voiceSampleBase64 && (
        <div className="mt-4">
          <label htmlFor="voiceSampleTranscript" className="block text-sm font-medium text-gray-300 mb-1">
            Reference Transcript (Required for Cloning)
          </label>
          <textarea
            id="voiceSampleTranscript"
            rows={2}
            className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Exactly what is being said in the audio clip..."
            value={voiceSampleTranscript || ''}
            onChange={(e) => handleTranscriptChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
});

export default VoiceManager;
