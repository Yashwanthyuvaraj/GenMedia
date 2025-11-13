
import React, { useState, useRef, useCallback } from 'react';
import Card from './shared/Card';
import { GeminiComponentProps } from '../types';
import { encode } from '../utils/audioUtils';
import { Modality, Blob as GenAiBlob, LiveServerMessage } from '@google/genai';
import ErrorMessage from './shared/ErrorMessage';
import { parseGeminiError } from '../utils/errorUtils';

// Add a declaration for the vendor-prefixed AudioContext to avoid using `any`.
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

// Defined a local LiveSession interface for type safety as it's not exported from the library.
interface LiveSession {
  close: () => void;
  sendRealtimeInput: (input: { media: GenAiBlob }) => void;
}

const AudioTranscription: React.FC<GeminiComponentProps> = ({ getGenAiClient }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState('');
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string; details: React.ReactNode } | null>(null);
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const currentTurnTextRef = useRef<string>('');

  const createBlob = (data: Float32Array): GenAiBlob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const cleanupResources = useCallback(() => {
    // If there's any lingering text when stopping, commit it to history.
    if (currentTurnTextRef.current.trim()) {
      setHistory(prev => [...prev, currentTurnTextRef.current.trim()]);
    }
    currentTurnTextRef.current = '';
    setCurrentTurn('');

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    sessionPromiseRef.current = null;
    setIsRecording(false);
  }, []);

  const handleStopRecording = useCallback(() => {
    if (sessionPromiseRef.current) {
      // Closing the session will trigger the `onclose` callback, which handles cleanup.
      sessionPromiseRef.current.then(session => session.close());
    } else {
      // Fallback cleanup if session doesn't exist for some reason.
      cleanupResources();
    }
  }, [cleanupResources]);

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    setErrorInfo(null);
    setHistory([]);
    setCurrentTurn('');
    currentTurnTextRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = getGenAiClient();
      if (!ai) return;
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Live session opened.');
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
              setErrorInfo({
                  title: 'Browser Not Supported',
                  message: 'Your browser does not support the Web Audio API, which is required for this feature.',
                  details: null,
              });
              cleanupResources();
              return;
            }
            
            audioContextRef.current = new AudioContext({ sampleRate: 16000 });
            mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            
            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentTurnTextRef.current += text;
              setCurrentTurn(currentTurnTextRef.current);
            }
            if (message.serverContent?.turnComplete) {
              if (currentTurnTextRef.current.trim()) {
                setHistory(prev => [...prev, currentTurnTextRef.current.trim()]);
              }
              currentTurnTextRef.current = '';
              setCurrentTurn('');
            }
            const base64EncodedAudioString =
              message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              // Audio response from model is received but not played, as this is a transcription component.
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            const parsedError = parseGeminiError(e, 'maintain the audio session');
            setErrorInfo(parsedError);
            cleanupResources();
          },
          onclose: (e: CloseEvent) => {
            console.log('Live session closed.');
            cleanupResources();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });

    } catch (err: any) {
      console.error('Failed to start recording:', err);
      const parsedError = parseGeminiError(err, 'start recording');
      setErrorInfo(parsedError);
      setIsRecording(false);
    }
  }, [getGenAiClient, cleanupResources]);

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex-grow text-center">
          <h2 className="text-2xl font-bold text-sky-400">Real-time Audio Transcription</h2>
          <p className="text-slate-400 mb-4">Click "Start Recording" and speak. Your words will be transcribed live.</p>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={isRecording ? handleStopRecording : startRecording}
            className={`w-48 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-500' 
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {isRecording ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                Stop Recording
              </>
            ) : 'Start Recording'}
          </button>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 min-h-[250px] w-full">
          {errorInfo && <ErrorMessage title={errorInfo.title} message={errorInfo.message} details={errorInfo.details} />}
          {!errorInfo && (
            <div className="text-slate-300 whitespace-pre-wrap text-lg">
              {history.map((turn, i) => <p key={i}>{turn}</p>)}
              <p className="text-slate-400 opacity-90">{currentTurn}</p>
              {history.length === 0 && !currentTurn && <p className="text-slate-500">Transcription will appear here...</p>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AudioTranscription;