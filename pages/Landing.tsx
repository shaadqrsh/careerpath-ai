import React from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { Button } from '../components/Button';
import { ArrowRight, Compass, Map, Telescope } from 'lucide-react';

const MARQUEE = "TAKE A QUIZ  ·  GET CAREER MATCHES  ·  SEE A ROADMAP  ·  ";

const ENTRIES = [
  {
    no: '01',
    title: 'Take a short quiz',
    body: 'Answer a few questions about your interests, strengths, and what you enjoy. It takes about five minutes.',
    icon: Compass,
    ink: 'text-cobalt',
  },
  {
    no: '02',
    title: 'Get matched to careers',
    body: 'See careers that fit your answers, ranked by match, with salary ranges and how much each field is growing.',
    icon: Map,
    ink: 'text-vermillion',
  },
  {
    no: '03',
    title: 'Get a step-by-step plan',
    body: 'For any career, see the education steps to get there plus AI images showing a typical day in that job.',
    icon: Telescope,
    ink: 'text-pine',
  },
];

export const Landing: React.FC = () => {
  const { setView } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-[#14130f] text-ink dark:text-paper transition-colors duration-300 overflow-x-hidden">

      {/* Masthead */}
      <header className="border-b-2 border-ink dark:border-paper/70">
        <div className="max-w-6xl mx-auto w-full px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70 dark:text-paper/70">
            CareerPath AI
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70 dark:text-paper/70">
            Free career guidance
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex-1 tex-grid">
        <div className="max-w-6xl mx-auto w-full px-5 pt-16 pb-20 md:pt-24">

          <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
            <span className="inline-flex items-center gap-2 border-2 border-ink dark:border-paper/70 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-marigold text-ink">
              <span className="w-1.5 h-1.5 bg-ink rounded-full" />
              Career matches in 5 minutes
            </span>
          </div>

          <h1 className="mt-7 font-display text-[15vw] leading-[0.86] sm:text-7xl md:text-8xl lg:text-9xl tracking-tight animate-fade-in-up opacity-0" style={{ animationDelay: '120ms' }}>
            Find the
            <br />
            <span className="text-vermillion">work</span> you were
            <br />
            built for.
          </h1>

          <p className="mt-8 max-w-xl font-serif text-xl md:text-2xl leading-relaxed text-ink/75 dark:text-paper/75 animate-fade-in-up opacity-0" style={{ animationDelay: '260ms' }}>
            Take a short quiz and get career matches based on your interests and strengths,
            each with a salary range and a step-by-step plan to get there.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-start animate-fade-in-up opacity-0" style={{ animationDelay: '380ms' }}>
            <Button size="lg" onClick={() => setView(AppView.AUTH)} className="group">
              Sign up and start
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink/50 dark:text-paper/50 sm:py-4">
              Free · No resume needed
            </p>
          </div>
        </div>

        {/* Decorative oversized compass, bleeding off the right edge */}
        <Compass
          className="hidden lg:block absolute -right-24 top-24 w-[34rem] h-[34rem] text-ink/[0.06] dark:text-paper/[0.05] animate-spin-slow pointer-events-none"
          strokeWidth={0.5}
        />
      </section>

      {/* Ticker */}
      <div className="border-y-2 border-ink dark:border-paper/70 bg-ink dark:bg-paper text-paper dark:text-ink overflow-hidden py-3">
        <div className="flex whitespace-nowrap animate-marquee font-display text-lg tracking-wide">
          <span>{MARQUEE.repeat(6)}</span>
          <span aria-hidden="true">{MARQUEE.repeat(6)}</span>
        </div>
      </div>

      {/* Three entries */}
      <section className="max-w-6xl mx-auto w-full px-5 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-ink dark:border-paper/70 divide-y-2 md:divide-y-0 md:divide-x-2 divide-ink dark:divide-paper/70">
          {ENTRIES.map((entry, i) => {
            const Icon = entry.icon;
            return (
              <div
                key={entry.no}
                className="p-7 md:p-8 bg-paper dark:bg-[#1c1a17] animate-fade-in-up opacity-0 relative"
                style={{ animationDelay: `${500 + i * 120}ms` }}
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-6xl md:text-7xl leading-none text-ink/15 dark:text-paper/15">
                    {entry.no}
                  </span>
                  <Icon className={entry.ink} size={30} strokeWidth={2} />
                </div>
                <h3 className="mt-5 font-display text-2xl leading-tight">{entry.title}</h3>
                <p className="mt-3 font-serif text-lg leading-relaxed text-ink/70 dark:text-paper/70">
                  {entry.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t-2 border-ink dark:border-paper/70">
        <div className="max-w-6xl mx-auto w-full px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55 dark:text-paper/55">
            Powered by Google Gemini
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55 dark:text-paper/55">
            CareerPath AI
          </span>
        </div>
      </footer>
    </div>
  );
};
