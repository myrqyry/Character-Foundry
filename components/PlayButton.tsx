import React from 'react';
import { PlayIcon, StopIcon } from './Icons';

interface PlayButtonProps {
  onClick: () => void;
  isPlaying: boolean;
}

const PlayButton: React.FC<PlayButtonProps> = ({ onClick, isPlaying }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
      aria-label={isPlaying ? 'Stop' : 'Play'}
    >
      {isPlaying ? (
        <StopIcon className="w-5 h-5" />
      ) : (
        <PlayIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default PlayButton;
