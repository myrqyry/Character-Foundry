import React, { useCallback, useRef } from 'react';
import { Character } from '../types';
import Button from './Button';
import { DownloadIcon, UploadIcon } from './Icons';
import { useCharacterStore } from '../store';

interface ImportExportMenuProps {
  character: Partial<Character>;
}

const ImportExportMenu: React.FC<ImportExportMenuProps> = ({ character }) => {
  const importCharacters = useCharacterStore((state) => state.actions.importCharacters);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify([character], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${character.name?.replace(/\s+/g, '_') || 'character'}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [character]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const importedCharacters: Character[] = JSON.parse(text);
            importCharacters(importedCharacters);
            alert(`${importedCharacters.length} character(s) imported successfully!`);
          }
        } catch (error) {
          console.error("Failed to parse imported JSON:", error);
          alert("Failed to import characters. Please ensure the file is a valid JSON export.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleExport} variant="secondary">
        <DownloadIcon className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button onClick={handleImportClick} variant="secondary">
        <UploadIcon className="mr-2 h-4 w-4" />
        Import
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileImport}
      />
    </div>
  );
};

export default ImportExportMenu;
