import React from 'react';
import { useAppStore } from '../store';
import { AppView, CareerDomain } from '../types';
import { Button } from '../components/Button';
import { Beaker, Briefcase, Palette, LogOut, User, Heart, HelpCircle, ArrowRight, Sun, Moon } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, setView, setDomain, savedCareers, theme, toggleTheme } = useAppStore();

  const handleStartQuiz = (domain: CareerDomain) => {
    setDomain(domain);
    setView(AppView.QUIZ);
  };

  const categories: {id: CareerDomain, title: string, icon: React.ReactNode, color: string, desc: string}[] = [
    { id: 'science', title: 'Science & Tech', icon: <Beaker size={32} />, color: 'from-cyan-500 to-blue-600', desc: 'Engineering, Medicine, Research' },
    { id: 'commerce', title: 'Commerce', icon: <Briefcase size={32} />, color: 'from-emerald-500 to-green-600', desc: 'Business, Finance, Law' },
    { id: 'arts', title: 'Arts & Creative', icon: <Palette size={32} />, color: 'from-pink-500 to-rose-600', desc: 'Design, Media, Humanities' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">CareerPath AI</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                 {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button 
                onClick={() => setView(AppView.SAVED_PATHS)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-500 transition-colors relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Saved Paths"
              >
                <Heart size={20} />
                {savedCareers.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
                )}
              </button>
              <button 
                onClick={() => setView(AppView.PROFILE)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-full hover:bg-green-50 dark:hover:bg-green-900/20"
                title="Edit Profile"
              >
                <User size={20} />
              </button>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
              <button onClick={() => setView(AppView.LANDING)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Start Your Discovery</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Select a domain to begin a specialized assessment, or use our General Assessment if you are unsure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 hover:shadow-xl dark:hover:bg-slate-750 transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-slate-500 shadow-sm"
              onClick={() => handleStartQuiz(cat.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-6 text-white shadow-lg`}>
                {cat.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{cat.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{cat.desc}</p>
              <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
                Start {cat.title.split(' ')[0]} Quiz <ArrowRight className="ml-1 w-4 h-4" />
              </span>
            </div>
          ))}
        </div>

        {/* Undecided / General Option */}
        <div 
            onClick={() => handleStartQuiz('general')}
            className="group relative w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-500 dark:hover:border-slate-500 hover:shadow-xl dark:hover:bg-slate-750 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-sm"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:text-white group-hover:bg-blue-600 transition-colors">
                    <HelpCircle size={28} />
                </div>
                <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Can't decide?</h3>
                    <p className="text-slate-600 dark:text-slate-400">Take our General Personality Quiz to find your direction.</p>
                </div>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center relative z-10">
                Start General Quiz <ArrowRight className="ml-1 w-4 h-4" />
            </span>
        </div>
      </main>
    </div>
  );
};