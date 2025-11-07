import React, { useState, useRef, useCallback } from 'react';
import Card from './shared/Card';
import Loader from './shared/Loader';
import { fileToBase64 } from '../utils/fileUtils';
import { GeminiComponentProps } from '../types';

const VideoAnalysis: React.FC<GeminiComponentProps> = ({ getGenAiClient, handleApiError }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setAnalysis('');
      setError('');
      setProgress('');
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const captureFrame = useCallback(async (videoElement: HTMLVideoElement, time: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve('');

      const onSeeked = () => {
        videoElement.removeEventListener('seeked', onSeeked);
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(dataUrl.split(',')[1]);
      };

      videoElement.addEventListener('seeked', onSeeked);
      videoElement.currentTime = time;
    });
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!videoFile || !videoRef.current) {
      setError('Please upload a video first.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysis('');
    
    try {
      const videoElement = videoRef.current;
      await new Promise<void>(resolve => {
        videoElement.addEventListener('loadeddata', () => resolve(), { once: true });
        if (videoElement.readyState >= 3) resolve();
      });

      const duration = videoElement.duration;
      const frameCount = Math.min(Math.floor(duration), 8); // Capture up to 8 frames, one per second
      const frames = [];

      for (let i = 0; i < frameCount; i++) {
        const time = (i * duration) / frameCount;
        setProgress(`Capturing frame ${i + 1} of ${frameCount}...`);
        const frameData = await captureFrame(videoElement, time);
        if (frameData) {
          frames.push({
            inlineData: { mimeType: 'image/jpeg', data: frameData },
          });
        }
      }

      setProgress('Sending frames to Gemini for analysis...');
      
      const ai = getGenAiClient();
      const prompt = "Analyze this sequence of video frames and describe what is happening. Provide a summary of the events.";
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [{text: prompt}, ...frames] },
      });

      setAnalysis(response.text);

    } catch (err) {
      console.error(err);
      setError('Failed to analyze the video. Please try again.');
      handleApiError(err);
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  }, [videoFile, captureFrame, getGenAiClient, handleApiError]);

  return (
    <Card>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-sky-400">Video Understanding</h2>
          <p className="text-slate-400">Upload a short video. The app will extract key frames and use Gemini to understand the content.</p>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <input type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            {videoFile ? 'Change Video' : 'Select Video'}
          </button>
          {videoPreview && (
            <button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-indigo-800 disabled:cursor-not-allowed">
              {isLoading ? 'Analyzing...' : 'Analyze Video'}
            </button>
          )}
        </div>

        <div className="bg-slate-900 rounded-lg p-4 min-h-[300px] flex items-center justify-center flex-col">
          {isLoading ? (
            <Loader text={progress || "Analyzing video..."} />
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : analysis ? (
            <p className="text-slate-300 whitespace-pre-wrap">{analysis}</p>
          ) : videoPreview ? (
            <video ref={videoRef} src={videoPreview} controls className="max-h-80 w-full rounded-md" />
          ) : (
            <p className="text-slate-500">Your video analysis will appear here.</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VideoAnalysis;