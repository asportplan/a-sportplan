import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

const HeroSection = ({ onStart }) => {
  const { lang } = useLanguage();

  return (
    <section className="relative overflow-hidden py-4 sm:py-6 px-4 sm:px-6 max-w-container-max mx-auto w-full">
      {/* Outer Banner Card with Premium Gradient & Curved Corners */}
      <div className="relative rounded-3xl overflow-hidden hero-gradient p-8 sm:p-14 text-center text-white shadow-xl shadow-red-500/10">
        
        {/* Background Decorative Ambient Circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Floating Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30 shadow-xs">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>
              {lang === 'en' ? 'Smart & Safe Workout Generator' : 'Program Latihan Beban Cerdas & Aman'}
            </span>
          </div>

          {/* High Impact Bold Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-xs">
            {lang === 'en' 
              ? 'Build Your Custom Workout Plan Around Your Gym' 
              : 'Buat Program Latihan Beban Sesuai Alat & Target Anda'
            }
          </h1>

          {/* Readable Normal Subtitle */}
          <p className="text-sm sm:text-base font-normal text-white/95 max-w-2xl mx-auto leading-relaxed">
            {lang === 'en'
              ? 'Set your weekly schedule, calculate target weights automatically, and pick the best exercises for the equipment you physically have.'
              : 'Atur jadwal latihan mingguan, hitung target beban otomatis, dan dapatkan urutan latihan terbaik sesuai alat gym yang Anda miliki.'
            }
          </p>

          {/* CTA Button */}
          <div className="pt-2">
            <button 
              onClick={onStart}
              className="px-8 py-3.5 bg-white text-[#E63946] font-extrabold text-sm sm:text-base rounded-full shadow-lg shadow-black/10 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
            >
              <span>{lang === 'en' ? 'Create My Workout Plan' : '🚀 Buat Program Latihan Sekarang'}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
