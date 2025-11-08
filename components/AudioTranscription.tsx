import React, { useState, useRef, useCallback } from 'react';
import Card from './shared/Card';
import { GeminiComponentProps } from '../types';
import { encode } from '../utils/audioUtils';
// Fix: Removed LiveSession from import as it is not an exported member.
// Imported LiveServerMessage for proper type-checking of messages from the server.
import { Modality, Blob as GenAiBlob, LiveServerMessage } from '@google/genai';
import ErrorMessage from './shared/ErrorMessage';

// Fix: Defined a local LiveSession interface for type safety as it's not exported from the library.
interface LiveSession {
  close: () => void;
  sendRealtimeInput: (input: { media: GenAiBlob }) => void;
}

const AudioTranscription: React.FC<GeminiComponentProps> = ({ getGenAiClient, handleApiError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const currentTranscriptionRef = useRef<string>('');

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

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    setError('');
    setTranscription('');
    currentTranscriptionRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = getGenAiClient();
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Live session opened.');
            // FIX: Cast window to `any` to access the prefixed `webkitAudioContext` for broader browser compatibility without causing a TypeScript error.
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
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
              currentTranscriptionRef.current += text;
              setTranscription(currentTranscriptionRef.current);
            }
            // Fix: Per documentation, audio data may be sent alongside transcriptions
            // and must be handled. Here we acknowledge it without playing it back.
            const base64EncodedAudioString =
              message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              console.log("Received audio data, but playback is not implemented in this component.");
            }
            if (message.serverContent?.turnComplete) {
              console.log('Turn complete.');
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            setError('A session error occurred. Please try stopping and starting the recording again.');
            handleApiError(e);
            stopRecording();
          },
          onclose: (e: CloseEvent) => {
            console.log('Live session closed.');
            stopRecording();
          },
        },
        config: {
          // Fix: Per documentation, responseModalities must be set to AUDIO for Live API.
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Microphone access denied. Please enable microphone permissions for this site in your browser settings.');
      setIsRecording(false);
      handleApiError(err);
    }
  }, [getGenAiClient, handleApiError]);

  const stopRecording = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
        mediaStreamSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
  }, []);

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex-grow text-center">
          <h2 className="text-2xl font-bold text-sky-400">Real-time Audio Transcription</h2>
          <p className="text-slate-400 mb-4">Click "Start Recording" and speak. Your words will be transcribed live.</p>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-40 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 ${
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
          {error && <ErrorMessage title="Transcription Error" message={error} />}
          <p className="text-slate-300 whitespace-pre-wrap text-lg">
            {transcription || (!error && <span className="text-slate-500">Transcription will appear here...</span>)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default AudioTranscription;
