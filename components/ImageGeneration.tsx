import React, { useState, useCallback } from 'react';
import Card from './shared/Card';
import Loader from './shared/Loader';
import { GeminiComponentProps } from '../types';
import ErrorMessage from './shared/ErrorMessage';
import { Modality } from '@google/genai';

const ImageGeneration: React.FC<GeminiComponentProps> = ({ getGenAiClient, handleApiError }) => {
  const [prompt, setPrompt] = useState<string>('A photorealistic image of a futuristic city skyline at dusk, with flying cars.');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<React.ReactNode | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt to generate an image.');
      setErrorDetails(null);
      return;
    }
    setIsLoading(true);
    setError('');
    setErrorDetails(null);
    setGeneratedImage(null);

    try {
      const ai = getGenAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      let foundImage = false;
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            setGeneratedImage(imageUrl);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        setError('Image generation failed. The model did not return any images.');
      }
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Failed to generate the image. Please try again.';
      let details: React.ReactNode | null = null;
      const errStr = err?.message || JSON.stringify(err);

      if (errStr.includes("billed users")) {
        errorMessage = 'This feature requires an API key associated with a billed project.';
        details = (
          <p>
            While we're using a free-tier model, some projects may still require billing to be enabled. See the{' '}
            <a
              href="https://ai.google.dev/gemini-api/docs/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline font-semibold"
            >
              billing documentation
            </a>.
          </p>
        );
      }

      setError(errorMessage);
      setErrorDetails(details);
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, getGenAiClient, handleApiError]);
  
  const handleDownload = () => {
    if (!generatedImage) return;

    // Create a filename from the prompt
    const fileName = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // remove special chars
      .replace(/\s+/g, '_') // replace spaces with underscores
      .slice(0, 50) || 'generated_image';

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Card>
      <div className="flex flex-col gap-8">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 text-center">
          <h2 className="text-2xl font-bold text-sky-400">Image Generation</h2>
           <p className="text-slate-400">Describe the image you want to create and let Gemini bring your vision to life.</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A blue robot holding a red skateboard."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-300 h-28"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-indigo-800 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        <div className="bg-slate-900 rounded-lg p-4 min-h-[500px] flex items-center justify-center flex-col">
          {isLoading ? (
            <Loader text="Creating image..." />
          ) : error ? (
            <ErrorMessage title="Generation Failed" message={error} details={errorDetails} />
          ) : generatedImage ? (
             <div className="relative group">
              <img src={generatedImage} alt="Generated" className="max-h-[450px] w-auto rounded-md object-contain" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-md">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition hover:bg-white/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Your generated image will appear here.</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImageGeneration;