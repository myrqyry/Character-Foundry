import React, { useCallback, useRef } from 'react';
import { Character } from '../types';
import Button from './Button';
import { DownloadIcon, UploadIcon } from './Icons';
import { useCharacterActions } from '../store';
import { CharacterSchema } from '../schemas/validation';
import { z } from 'zod';
import toast from 'react-hot-toast';

interface ImportExportMenuProps {
  character: Partial<Character>;
}

const ImportExportMenu: React.FC<ImportExportMenuProps> = ({ character }) => {
  const { importCharacters } = useCharacterActions();
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
            const json = JSON.parse(text);
            const charactersArray = Array.isArray(json) ? json : [json];
            
            // Validate items
            const validCharacters: Character[] = [];
            let errors = 0;

            charactersArray.forEach(char => {
               // Use schema.safeParse or partial validation depending on strictness
               // Assuming full Character objects on import:
               const result = CharacterSchema.safeParse(char);
               if (result.success) {
                 validCharacters.push(result.data);
               } else {
                 errors++;
               }
            });

            if (validCharacters.length > 0) {
              importCharacters(validCharacters);
              toast.success(`${validCharacters.length} character(s) imported!`);
            } 
            
            if (errors > 0) {
              toast.error(`${errors} character(s) failed validation and were skipped.`);
            }
          }
        } catch (error) {
          console.error("Failed to parse imported JSON:", error);
          toast.error("Failed to import. Invalid JSON file.");
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
