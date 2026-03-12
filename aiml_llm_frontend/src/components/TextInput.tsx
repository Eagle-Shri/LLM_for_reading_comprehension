import { useState } from 'react';
import { FileText } from 'lucide-react';

interface TextInputProps {
  onTextSubmitted: (text: string) => void;
}

export function TextInput({ onTextSubmitted }: TextInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onTextSubmitted(text.trim());
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your story here and let's read it together! ✨"
        className="w-full h-64 p-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-teal-400 focus:outline-none resize-none"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      />
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <FileText className="w-5 h-5" />
          <span>Start Reading This!</span>
        </button>
      </div>
    </div>
  );
}
