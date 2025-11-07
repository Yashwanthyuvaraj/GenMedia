import React, { useState, useRef, useCallback } from 'react';
import Card from './shared/Card';
import Loader from './shared/Loader';
import { fileToBase64 } from '../utils/fileUtils';
import { GeminiComponentProps } from '../types';

const ImageAnalysis: React.FC<GeminiComponentProps> = ({ getGenAiClient, handleApiError }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setAnalysis('');
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysis('');

    try {
      const base64Image = await fileToBase64(imageFile);
      const ai = getGenAiClient();

      const imagePart = {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      };
      const textPart = { text: "Describe this image in detail." };
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });

      setAnalysis(response.text);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the image. Please try again.');
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, getGenAiClient, handleApiError]);

  return (
    <Card>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-sky-400">Image Understanding</h2>
          <p className="text-slate-400">Upload a photo and let Gemini describe what it sees.</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            {imageFile ? 'Change Image' : 'Select Image'}
          </button>
          {imagePreview && (
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-indigo-800 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          )}
        </div>

        <div className="bg-slate-900 rounded-lg p-4 min-h-[250px] flex items-center justify-center flex-col">
          {isLoading ? (
            <Loader text="Analyzing image..." />
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : analysis ? (
            <p className="text-slate-300 whitespace-pre-wrap">{analysis}</p>
          ) : imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-h-80 rounded-md object-contain" />
          ) : (
            <p className="text-slate-500">Your image analysis will appear here.</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImageAnalysis;