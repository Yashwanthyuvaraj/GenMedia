export enum Tab {
  ImageAnalysis,
  AudioTranscription,
  VideoAnalysis,
  ImageGeneration,
}

export interface GeminiComponentProps {
  getGenAiClient: () => any; // Return type is GoogleGenAI, but using 'any' to avoid type dependency here
}
