import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader } from 'lucide-react';

export default function VoiceInput({ onTextExtracted }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentTranscript += text + ' ';
          }
        }
        
        if (currentTranscript.trim()) {
          setTranscript(prev => prev + currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        // Only restart if deliberately listening (not stopped)
        // For simplicity, we'll just stop here
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (onTextExtracted && transcript) {
        onTextExtracted(transcript);
        setTranscript(''); // Clear after sending
      }
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!recognitionRef.current) {
    return <p className="text-xs text-slate-400">Voice input not supported in this browser.</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center justify-center p-3 rounded-full transition-all ${
          isListening 
            ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
            : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
        }`}
        title={isListening ? "Stop Listening" : "Start Voice Input"}
      >
        {isListening ? (
          <Square className="w-5 h-5 fill-current" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      
      {isListening && (
        <div className="flex-1 flex items-center gap-2">
          <Loader className="w-4 h-4 animate-spin text-brand-500" />
          <span className="text-sm text-slate-500 italic">Listening... Speak now</span>
        </div>
      )}
    </div>
  );
}
