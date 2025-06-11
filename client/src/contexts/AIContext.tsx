import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface AIContextType {
  isListening: boolean;
  isLoading: boolean;
  transcript: string;
  resetTranscript: () => void;
  startListening: () => void;
  stopListening: () => void;
  sendMessage: (message: string, context?: string) => Promise<AIResponse>;
  speak: (text: string) => void;
  isSpeaking: boolean;
}

interface AIResponse {
  response: string;
  suggestedAction?: {
    action: string;
    path?: string;
  };
  timestamp: Date;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const {
    transcript,
    listening: isListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const startListening = () => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const sendMessage = async (message: string, context = 'general'): Promise<AIResponse> => {
    setIsLoading(true);
    try {
      const response = await axios.post('/ai/lassy', { 
        message, 
        context 
      });
      return response.data;
    } catch (error) {
      console.error('AI request error:', error);
      return {
        response: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      // Configure voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      speechSynthesis.speak(utterance);
    }
  };

  const value = {
    isListening,
    isLoading,
    transcript,
    resetTranscript,
    startListening,
    stopListening,
    sendMessage,
    speak,
    isSpeaking
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};