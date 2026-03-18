import React, { useEffect, useRef, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

interface AudioClipModalProps {
  file: File;
  onClipped: (base64: string) => void;
  onClose: () => void;
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const btwLength = buffer.length * numOfChan * 2 + 44;
  const btwArrBuff = new ArrayBuffer(btwLength);
  const btwView = new DataView(btwArrBuff);
  let btwOffset = 0;

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }

  writeString(btwView, btwOffset, 'RIFF'); btwOffset += 4;
  btwView.setUint32(btwOffset, btwLength - 8, true); btwOffset += 4;
  writeString(btwView, btwOffset, 'WAVE'); btwOffset += 4;
  btwView.setUint32(btwOffset, 16, true); btwOffset += 4;
  btwView.setUint16(btwOffset, 1, true); btwOffset += 2;
  btwView.setUint16(btwOffset, numOfChan, true); btwOffset += 2;
  btwView.setUint32(btwOffset, buffer.sampleRate, true); btwOffset += 4;
  btwView.setUint32(btwOffset, buffer.sampleRate * numOfChan * 2, true); btwOffset += 4;
  btwView.setUint16(btwOffset, numOfChan * 2, true); btwOffset += 2;
  btwView.setUint16(btwOffset, 16, true); btwOffset += 2;
  writeString(btwView, btwOffset, 'data'); btwOffset += 4;
  btwView.setUint32(btwOffset, btwLength - btwOffset - 4, true); btwOffset += 4;

  floatTo16BitPCM(btwView, btwOffset, buffer.getChannelData(0));

  return new Blob([btwArrBuff], { type: 'audio/wav' });
}

const AudioClipModal: React.FC<AudioClipModalProps> = ({ file, onClipped, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const regions = RegionsPlugin.create();

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'violet',
      progressColor: 'purple',
      height: 128,
      plugins: [regions],
    });

    ws.load(URL.createObjectURL(file));

    // Create default region once audio is ready
    ws.on('ready', () => {
      regions.addRegion({
        start: 1,
        end: 3,
        color: 'rgba(0, 255, 0, 0.1)',
        drag: true,
        resize: true,
      });
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [file]);

  const handleSaveClip = useCallback(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    const decodedData = ws.getDecodedData();
    if (!decodedData) return;

    const regionsPlugin = ws.getActivePlugins().find(
      (p): p is RegionsPlugin => p instanceof RegionsPlugin
    );
    if (!regionsPlugin) return;

    const regionsList = regionsPlugin.getRegions();
    const region = regionsList[0];
    if (!region) return;

    const start = region.start;
    const end = region.end;
    const duration = end - start;

    const originalBuffer = decodedData;
    const clippedBuffer = new AudioBuffer({
      length: Math.floor(originalBuffer.sampleRate * duration),
      numberOfChannels: originalBuffer.numberOfChannels,
      sampleRate: originalBuffer.sampleRate,
    });

    for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
      const channelData = originalBuffer.getChannelData(i);
      const clippedChannelData = clippedBuffer.getChannelData(i);
      const startSample = Math.floor(start * originalBuffer.sampleRate);

      for (let j = 0; j < clippedChannelData.length; j++) {
        clippedChannelData[j] = channelData[startSample + j];
      }
    }

    const wavBlob = audioBufferToWav(clippedBuffer);
    const reader = new FileReader();
    reader.onloadend = () => {
      onClipped(reader.result as string);
    };
    reader.readAsDataURL(wavBlob);
  }, [onClipped]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-11/12 max-w-3xl">
        <h2 className="text-xl font-bold text-white mb-4">Clip Audio</h2>
        <div ref={containerRef} className="mb-4 bg-gray-900 rounded" />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClip}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded transition"
          >
            Save Clip
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioClipModal;
