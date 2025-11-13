
import React, { useState, useRef, useCallback, DragEvent } from 'react';
import Card from './shared/Card';
import SkeletonLoader from './shared/SkeletonLoader';
import { GeminiComponentProps } from '../types';
import MarkdownRenderer from './shared/MarkdownRenderer';
import ErrorMessage from './shared/ErrorMessage';

const VideoAnalysis: React.FC<GeminiComponentProps> = ({ getGenAiClient }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (file: File | null) => {
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setAnalysis('');
      setError('');
      setProgress('');
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    } else if (file) {
      setError('Please select a valid video file (e.g., MP4, MOV, WEBM).');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0] || null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0] || null);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  
  const resetState = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setAnalysis('');
    setError('');
    setProgress('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      await new Promise<void>((resolve, reject) => {
        videoElement.addEventListener('loadeddata', () => resolve(), { once: true });
        videoElement.addEventListener('error', () => reject(new Error("Error loading video data.")), { once: true });
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
      if (!ai) return;

      const prompt = "Analyze this sequence of video frames and format the response in Markdown. Start with a short, catchy title using a main heading (e.g., '# Title'). Then, provide a concise one-paragraph summary. Finally, list the key events or elements in a bulleted list under a subheading (e.g., '## Key Events').";
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{text: prompt}, ...frames] },
      });

      setAnalysis(response.text);

    } catch (err: any) {
      console.error(err);
      setError('Failed to analyze the video. The file might be corrupted, or there could be a network issue. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  }, [videoFile, captureFrame, getGenAiClient]);

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Card>
      <div className="flex flex-col text-center">
        <h2 className="text-2xl font-bold text-sky-400">Video Understanding</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Upload or drop a short video. The app will extract key frames and use Gemini to understand the content.</p>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>

      <div className="mt-8 flex flex-col items-center gap-8">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
          {videoPreview ? (
            <div className="relative">
              <video ref={videoRef} src={videoPreview} controls className="w-full rounded-md" />
              <button
                onClick={resetState}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/80 transition"
                aria-label="Remove video"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ) : (
            <div 
              className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${isDragging ? 'border-sky-500 bg-sky-500/10 shadow-inner shadow-sky-500/20' : 'border-slate-600 hover:border-slate-500'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center justify-center p-12 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-500 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" /></svg>
                <p className="font-semibold text-slate-300">Drop a video here or <span className="text-sky-400">click to browse</span></p>
                <p className="text-sm text-slate-500 mt-1">MP4, MOV, WEBM</p>
              </div>
              <input type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            </div>
          )}

          {videoPreview && (
            <div className="w-full flex flex-col items-center gap-2">
              <button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyzing...
                  </>
                ) : 'Analyze Video'}
              </button>
              {isLoading && progress && (
                  <p className="text-center text-slate-400 text-sm">{progress}</p>
              )}
            </div>
          )}
        </div>

        {(isLoading || error || analysis) && (
          <div className="mt-8 w-full">
            <hr className="border-slate-700/50" />
            <div className="mt-8 bg-slate-900/70 backdrop-blur-sm ring-1 ring-white/10 rounded-xl p-6 min-h-[400px] relative flex flex-col justify-center">
            {isLoading ? (
                <SkeletonLoader />
            ) : error ? (
                <ErrorMessage title="Analysis Failed" message={error} />
            ) : analysis ? (
                <div className="w-full h-full flex flex-col">
                <div className="relative flex-shrink-0">
                    <button onClick={handleCopy} className="absolute -top-2 -right-2 text-sm z-10 flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md transition">
                        {isCopied ? (
                                <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                Copied!
                                </>
                            ) : (
                                <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25H9.75A2.25 2.25 0 0 1 7.5 4.5v0a2.25 2.25 0 0 1 2.25-2.25h3.834c.39 0 .74.157.998.416M1.5 12h16.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 19.5v-7.5A2.25 2.25 0 0 1 3.75 9.75h1.5" /></svg>
                                Copy
                                </>
                            )}
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow pr-4 -mr-4">
                    <MarkdownRenderer content={analysis} />
                </div>
                </div>
            ) : null}
            </div>
        </div>
      )}
      </div>
    </Card>
  );
};

export default VideoAnalysis;
