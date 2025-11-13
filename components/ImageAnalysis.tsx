
import React, { useState, useRef, useCallback, DragEvent } from 'react';
import Card from './shared/Card';
import SkeletonLoader from './shared/SkeletonLoader';
import { fileToBase64 } from '../utils/fileUtils';
import { GeminiComponentProps } from '../types';
import MarkdownRenderer from './shared/MarkdownRenderer';
import ErrorMessage from './shared/ErrorMessage';
import { parseGeminiError } from '../utils/errorUtils';

const ImageAnalysis: React.FC<GeminiComponentProps> = ({ getGenAiClient }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<React.ReactNode>(null);
  const [errorTitle, setErrorTitle] = useState<string>('Analysis Failed');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setAnalysis('');
      setError('');
      setErrorDetails(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setErrorTitle('Invalid File');
      setError('The selected file is not a valid image. Please select a PNG, JPG, GIF, or WEBP file.');
      setErrorDetails(null);
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

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }
    setIsLoading(true);
    setError('');
    setErrorDetails(null);
    setAnalysis('');

    try {
      const base64Image = await fileToBase64(imageFile);
      const ai = getGenAiClient();
      if (!ai) return;

      const imagePart = { inlineData: { mimeType: imageFile.type, data: base64Image } };
      const textPart = { text: "Analyze this image and format the response in Markdown. Start with a short, catchy title using a main heading (e.g., '# Title'). Then, provide a concise one-paragraph summary. Finally, list the key elements in a bulleted list under a subheading (e.g., '## Key Elements')." };
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });

      setAnalysis(response.text);
    } catch (err: any) {
      console.error(err);
      const parsedError = parseGeminiError(err, 'analyze the image');
      setErrorTitle(parsedError.title);
      setError(parsedError.message);
      setErrorDetails(parsedError.details);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, getGenAiClient]);

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysis('');
    setError('');
    setErrorDetails(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-2xl font-bold text-sky-400">Image Understanding</h2>
        <p className="text-slate-400 mb-4 max-w-2xl mx-auto">Upload or drop an image and let Gemini describe what it sees.</p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
          <div 
            className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${isDragging ? 'border-sky-500 bg-sky-500/10 shadow-inner shadow-sky-500/20' : 'border-slate-600 hover:border-slate-500'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-96 object-contain rounded-lg" />
                <button
                    onClick={resetState}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/80 transition"
                    aria-label="Remove image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-500 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" /></svg>
                    <p className="font-semibold text-slate-300">Drop an image here or <span className="text-sky-400">click to browse</span></p>
                    <p className="text-sm text-slate-500 mt-1">PNG, JPG, GIF, WEBP</p>
                </div>
            )}
             <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
            />
          </div>

          {imagePreview && (
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30"
            >
              {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyzing...
                  </>
              ) : 'Analyze Image'}
            </button>
          )}
        </div>

        {(isLoading || error || analysis) && (
            <div>
              <hr className="border-slate-700/50" />
              <div className="mt-8 bg-slate-900/70 backdrop-blur-sm ring-1 ring-white/10 rounded-xl p-6 min-h-[400px] relative flex flex-col justify-center">
                {isLoading ? (
                  <SkeletonLoader />
                ) : error ? (
                  <ErrorMessage title={errorTitle} message={error} details={errorDetails} />
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
                ) : (
                  <p className="text-slate-500 text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Your image analysis will appear here.</p>
                )}
              </div>
            </div>
        )}
      </div>
    </Card>
  );
};

export default ImageAnalysis;