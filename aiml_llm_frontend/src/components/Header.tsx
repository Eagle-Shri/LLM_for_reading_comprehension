import { BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-coral-500 via-peach-500 to-yellow-400 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-white rounded-2xl p-4 shadow-2xl animate-bounce-slow">
            <BookOpen className="w-10 h-10 text-coral-500" />
          </div>
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight animate-fadeIn" style={{ fontFamily: 'Poppins' }}>
              ReadSmart
            </h1>
            <p className="text-lg md:text-xl font-bold opacity-95 animate-slideUp mt-2" style={{ fontFamily: 'Nunito' }}>AI-Powered Reading Comprehension System</p>
          </div>
        </div>
      </div>
    </header>
  );
}
