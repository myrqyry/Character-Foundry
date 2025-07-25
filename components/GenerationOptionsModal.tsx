import React, { useState, useEffect } from 'react';
import Button from './Button';
import { XIcon } from './Icons';
import { useCharacterStore } from '../store';

// Microsoft Edge TTS voice options
const edgeVoices = [
  // English (US)
  'en-US-GuyNeural', 'en-US-JennyNeural', 'en-US-AriaNeural', 'en-US-DavisNeural', 'en-US-JaneNeural',
  'en-US-JasonNeural', 'en-US-SaraNeural', 'en-US-TonyNeural', 'en-US-NancyNeural', 'en-US-AmberNeural',
  // English (UK)
  'en-GB-LibbyNeural', 'en-GB-RyanNeural', 'en-GB-SoniaNeural', 'en-GB-ThomasNeural',
  // Other languages
  'es-ES-ElviraNeural', 'fr-FR-DeniseNeural', 'de-DE-KatjaNeural', 'it-IT-ElsaNeural',
  'ja-JP-NanamiNeural', 'ko-KR-SunHiNeural', 'pt-BR-FranciscaNeural', 'ru-RU-DariyaNeural',
  'zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural', 'hi-IN-SwaraNeural', 'ar-EG-SalmaNeural'
];

// Google TTS voice options with supported languages
const googleVoices = [
  { name: 'Gemini 2.5 Flash TTS', value: 'gemini-2.5-flash-preview-tts', language: 'en-US' },
  { name: 'Gemini 2.5 Pro TTS', value: 'gemini-2.5-pro-preview-tts', language: 'en-US' },
  { name: 'Neural2-J (US English)', value: 'en-US-Neural2-J', language: 'en-US' },
  { name: 'Wavenet-D (US English)', value: 'en-US-Wavenet-D', language: 'en-US' },
  { name: 'Neural2-A (UK English)', value: 'en-GB-Neural2-A', language: 'en-GB' },
  { name: 'Wavenet-B (UK English)', value: 'en-GB-Wavenet-B', language: 'en-GB' },
  { name: 'Neural2-C (Spanish)', value: 'es-ES-Neural2-C', language: 'es-ES' },
  { name: 'Wavenet-B (French)', value: 'fr-FR-Wavenet-B', language: 'fr-FR' },
  { name: 'Neural2-D (German)', value: 'de-DE-Neural2-D', language: 'de-DE' },
  { name: 'Wavenet-A (Italian)', value: 'it-IT-Wavenet-A', language: 'it-IT' },
  { name: 'Neural2-B (Japanese)', value: 'ja-JP-Neural2-B', language: 'ja-JP' },
  { name: 'Wavenet-A (Korean)', value: 'ko-KR-Wavenet-A', language: 'ko-KR' },
  { name: 'Neural2-B (Portuguese)', value: 'pt-BR-Neural2-B', language: 'pt-BR' },
  { name: 'Wavenet-B (Russian)', value: 'ru-RU-Wavenet-B', language: 'ru-RU' }
];

// Voice styles and roles for Edge TTS
const voiceStyles = [
  { value: 'default', label: 'Default' },
  { value: 'cheerful', label: 'Cheerful' },
  { value: 'sad', label: 'Sad' },
  { value: 'angry', label: 'Angry' },
  { value: 'fearful', label: 'Fearful' },
  { value: 'disgruntled', label: 'Disgruntled' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'excited', label: 'Excited' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'hopeful', label: 'Hopeful' },
  { value: 'shouting', label: 'Shouting' },
  { value: 'terrified', label: 'Terrified' },
  { value: 'unfriendly', label: 'Unfriendly' },
  { value: 'whispering', label: 'Whispering' },
  { value: 'newscast', label: 'Newscast' },
  { value: 'customerservice', label: 'Customer Service' },
  { value: 'chat', label: 'Chat' }
];

// Voice roles for Edge TTS
const voiceRoles = [
  { value: 'default', label: 'Default' },
  { value: 'Boy', label: 'Boy' },
  { value: 'Girl', label: 'Girl' },
  { value: 'YoungAdultMale', label: 'Young Adult Male' },
  { value: 'YoungAdultFemale', label: 'Young Adult Female' },
  { value: 'OlderAdultMale', label: 'Older Adult Male' },
  { value: 'OlderAdultFemale', label: 'Older Adult Female' },
  { value: 'SeniorMale', label: 'Senior Male' },
  { value: 'SeniorFemale', label: 'Senior Female' },
  { value: 'Narrator', label: 'Narrator' }
];

interface GenerationOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GenerationOptionsModal: React.FC<GenerationOptionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    ttsProvider, 
    googleTtsVoice, 
    edgeTtsVoice, 
    textModel, 
    imageModel, 
    setTtsProvider, 
    setGoogleTtsVoice, 
    setEdgeTtsVoice, 
    setTextModel, 
    setImageModel 
  } = useCharacterStore();

  const [currentTtsProvider, setCurrentTtsProvider] = useState(ttsProvider);
  const [currentGoogleTtsVoice, setCurrentGoogleTtsVoice] = useState(googleTtsVoice);
  const [currentEdgeTtsVoice, setCurrentEdgeTtsVoice] = useState(edgeTtsVoice);
  const [currentTextModel, setCurrentTextModel] = useState(textModel);
  const [currentImageModel, setCurrentImageModel] = useState(imageModel);
  const [currentEdgeStyle, setCurrentEdgeStyle] = useState('default');
  const [currentEdgeRole, setCurrentEdgeRole] = useState('default');
  const [currentEdgeRate, setCurrentEdgeRate] = useState('+0%');
  const [currentEdgePitch, setCurrentEdgePitch] = useState('+0Hz');
  const [currentEdgeVolume, setCurrentEdgeVolume] = useState('+0%');

  useEffect(() => {
    setCurrentTtsProvider(ttsProvider);
    setCurrentGoogleTtsVoice(googleTtsVoice);
    setCurrentEdgeTtsVoice(edgeTtsVoice);
    setCurrentTextModel(textModel);
    setCurrentImageModel(imageModel);
    // Load additional settings from localStorage if available
    const savedEdgeStyle = localStorage.getItem('edgeTtsStyle') || 'default';
    const savedEdgeRole = localStorage.getItem('edgeTtsRole') || 'default';
    const savedEdgeRate = localStorage.getItem('edgeTtsRate') || '+0%';
    const savedEdgePitch = localStorage.getItem('edgeTtsPitch') || '+0Hz';
    const savedEdgeVolume = localStorage.getItem('edgeTtsVolume') || '+0%';
    
    setCurrentEdgeStyle(savedEdgeStyle);
    setCurrentEdgeRole(savedEdgeRole);
    setCurrentEdgeRate(savedEdgeRate);
    setCurrentEdgePitch(savedEdgePitch);
    setCurrentEdgeVolume(savedEdgeVolume);
  }, [ttsProvider, googleTtsVoice, edgeTtsVoice, textModel, imageModel]);

  const handleSave = () => {
    setTtsProvider(currentTtsProvider);
    setGoogleTtsVoice(currentGoogleTtsVoice);
    setEdgeTtsVoice(currentEdgeTtsVoice);
    setTextModel(currentTextModel);
    setImageModel(currentImageModel);
    
    // Save Edge TTS settings to localStorage
    if (currentTtsProvider === 'edge') {
      localStorage.setItem('edgeTtsStyle', currentEdgeStyle);
      localStorage.setItem('edgeTtsRole', currentEdgeRole);
      localStorage.setItem('edgeTtsRate', currentEdgeRate);
      localStorage.setItem('edgeTtsPitch', currentEdgePitch);
      localStorage.setItem('edgeTtsVolume', currentEdgeVolume);
    }
    
    onClose();
  };
  
  // Group Google voices by language for better organization
  const googleVoicesByLanguage = googleVoices.reduce((acc, voice) => {
    if (!acc[voice.language]) {
      acc[voice.language] = [];
    }
    acc[voice.language].push(voice);
    return acc;
  }, {} as Record<string, typeof googleVoces>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">Generation Options</h2>

        <div className="mb-4">
          <label htmlFor="ttsProvider" className="block text-sm font-medium text-indigo-300 mb-1">TTS Provider</label>
          <select
            id="ttsProvider"
            name="ttsProvider"
            value={currentTtsProvider}
            onChange={(e) => setCurrentTtsProvider(e.target.value as 'google' | 'edge')}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            <option value="google">Google TTS</option>
            <option value="edge">MS Edge TTS</option>
          </select>
        </div>

        {currentTtsProvider === 'google' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="googleTtsVoice" className="block text-sm font-medium text-indigo-300 mb-1">Google TTS Voice</label>
              <select
                id="googleTtsVoice"
                value={currentGoogleTtsVoice}
                onChange={(e) => setCurrentGoogleTtsVoice(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                {Object.entries(googleVoicesByLanguage).map(([language, voices]) => (
                  <optgroup key={language} label={language}>
                    {voices.map((voice) => (
                      <option key={voice.value} value={voice.value}>
                        {voice.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-300 mb-1">Custom Voice (if not listed)</label>
              <input
                type="text"
                value={currentGoogleTtsVoice}
                onChange={(e) => setCurrentGoogleTtsVoice(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="e.g., gemini-2.5-flash-preview-tts"
              />
            </div>
          </div>
        )}

        {currentTtsProvider === 'edge' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="edgeTtsVoice" className="block text-sm font-medium text-indigo-300 mb-1">Voice</label>
              <select
                id="edgeTtsVoice"
                value={currentEdgeTtsVoice}
                onChange={(e) => setCurrentEdgeTtsVoice(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <optgroup label="English (US)">
                  {edgeVoices.filter(v => v.startsWith('en-US')).map(voice => (
                    <option key={voice} value={voice}>
                      {voice.replace('en-US-', '')} (US)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="English (UK)">
                  {edgeVoices.filter(v => v.startsWith('en-GB')).map(voice => (
                    <option key={voice} value={voice}>
                      {voice.replace('en-GB-', '')} (UK)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Languages">
                  {edgeVoices.filter(v => !v.startsWith('en-')).map(voice => {
                    const [lang, , name] = voice.split('-');
                    return (
                      <option key={voice} value={voice}>
                        {name} ({lang.toUpperCase()})
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edgeTtsStyle" className="block text-sm font-medium text-indigo-300 mb-1">Style</label>
                <select
                  id="edgeTtsStyle"
                  value={currentEdgeStyle}
                  onChange={(e) => setCurrentEdgeStyle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {voiceStyles.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edgeTtsRole" className="block text-sm font-medium text-indigo-300 mb-1">Role</label>
                <select
                  id="edgeTtsRole"
                  value={currentEdgeRole}
                  onChange={(e) => setCurrentEdgeRole(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {voiceRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="edgeTtsRate" className="block text-sm font-medium text-indigo-300 mb-1">Rate</label>
                <select
                  id="edgeTtsRate"
                  value={currentEdgeRate}
                  onChange={(e) => setCurrentEdgeRate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {['-50%', '-25%', '+0%', '+25%', '+50%'].map(rate => (
                    <option key={rate} value={rate}>
                      {rate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edgeTtsPitch" className="block text-sm font-medium text-indigo-300 mb-1">Pitch</label>
                <select
                  id="edgeTtsPitch"
                  value={currentEdgePitch}
                  onChange={(e) => setCurrentEdgePitch(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {['-50Hz', '-25Hz', '+0Hz', '+25Hz', '+50Hz'].map(pitch => (
                    <option key={pitch} value={pitch}>
                      {pitch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edgeTtsVolume" className="block text-sm font-medium text-indigo-300 mb-1">Volume</label>
                <select
                  id="edgeTtsVolume"
                  value={currentEdgeVolume}
                  onChange={(e) => setCurrentEdgeVolume(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {['-50%', '-25%', '+0%', '+25%', '+50%'].map(vol => (
                    <option key={vol} value={vol}>
                      {vol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-2">
              <p>Note: Some voices may not support all styles and roles. The voice will use the closest match.</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="textModel" className="block text-sm font-medium text-indigo-300 mb-1">Text Generation Model</label>
          <input
            id="textModel"
            name="textModel"
            type="text"
            value={currentTextModel}
            onChange={(e) => setCurrentTextModel(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="e.g., gemini-2.5-flash"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="imageModel" className="block text-sm font-medium text-indigo-300 mb-1">Image Generation Model</label>
          <input
            id="imageModel"
            name="imageModel"
            type="text"
            value={currentImageModel}
            onChange={(e) => setCurrentImageModel(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="e.g., gemini-2.0-flash-preview-image-generation"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default GenerationOptionsModal;
