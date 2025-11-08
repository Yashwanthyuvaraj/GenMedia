import React, { useState, useCallback } from 'react';
import Card from './shared/Card';
import Loader from './shared/Loader';
import { GeminiComponentProps } from '../types';
import ErrorMessage from './shared/ErrorMessage';

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
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        setGeneratedImage(imageUrl);
      } else {
         setError('Image generation failed. The model did not return any images.');
      }
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Failed to generate the image. Please try again.';
      let details: React.ReactNode | null = null;
      const errStr = JSON.stringify(err);

      if (errStr.includes("only accessible to billed users")) {
        errorMessage = 'Image generation requires an API key associated with a billed project.';
        details = (
          <p>
            Please ensure your API key is associated with a project that has billing enabled. For more details, see the{' '}
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

  return (
    <Card>
      <div className="flex flex-col gap-8">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 text-center">
          <h2 className="text-2xl font-bold text-sky-400">Image Generation</h2>
           <p className="text-slate-400">Describe the image you want to create and let Imagen bring your vision to life.</p>
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
            <img src={generatedImage} alt="Generated" className="max-h-[450px] w-auto rounded-md object-contain" />
          ) : (
            <p className="text-slate-500">Your generated image will appear here.</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImageGeneration;
