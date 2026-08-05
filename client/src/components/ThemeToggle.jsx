import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative p-2 rounded-xl border transition-all duration-300 flex items-center justify-center group ${
        isDark
          ? 'bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-slate-700 shadow-lg shadow-amber-500/5'
          : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200/80 hover:border-slate-300 shadow-md'
      } ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun
          className={`w-5 h-5 absolute transition-all duration-500 transform ${
            isDark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100 text-amber-500'
          }`}
        />
        <Moon
          className={`w-5 h-5 absolute transition-all duration-500 transform ${
            isDark ? 'scale-100 rotate-0 opacity-100 text-indigo-400' : 'scale-0 -rotate-90 opacity-0'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
