import React from 'react';
import { Character, CharacterVersion } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

interface VersionHistoryProps {
  character: Character;
  onRestore: (version: CharacterVersion) => void;
  currentVersion: number;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ 
  character, 
  onRestore,
  currentVersion
}) => {
  if (!character.versions || character.versions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <ClockIcon className="mx-auto h-8 w-8 mb-2" />
        <p>No version history available yet.</p>
        <p className="text-sm">Changes will be saved automatically as you edit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">Version History</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {character.versions.map((version) => (
          <div 
            key={version.version} 
            className={`p-3 rounded-lg border ${
              version.version === currentVersion 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-gray-700 hover:bg-gray-700/50'
            } transition-colors`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                    v{version.version}
                  </span>
                  {version.version === currentVersion && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(version.updatedAt), { addSuffix: true })}
                </p>
              </div>
              {version.version !== currentVersion && (
                <button
                  onClick={() => onRestore(version)}
                  className="text-indigo-400 hover:text-indigo-300 p-1 -mr-1"
                  title="Restore this version"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {version.changes && version.changes.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-300 mb-1">Changes:</p>
                <ul className="space-y-1">
                  {version.changes.map((change, idx) => (
                    <li key={idx} className="text-xs text-gray-400 flex items-start">
                      <span className="text-indigo-400 mr-1">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionHistory;
