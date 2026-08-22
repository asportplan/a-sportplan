import React from 'react';
import ProfileStep from './ProfileStep';
import EquipmentStep from './EquipmentStep';
import OneRMStep from './OneRMStep';
import GoalsStep from './GoalsStep';
import ScreeningStep from './ScreeningStep';
import { useLanguage } from '../../hooks/useLanguage';

const stepLabelsID = [
  'Data Diri & Kesehatan',
  'Pilih Alat Gym',
  'Input Beban 1RM',
  'Target & Durasi',
  'Cek Ringkasan & Buat'
];

const stepLabelsEN = [
  'Profile & Health',
  'Select Equipment',
  '1RM Weight Input',
  'Target & Duration',
  'Review & Generate'
];

const WizardContainer = ({ currentStep, setCurrentStep, nextStep, prevStep, generate }) => {
  const { lang } = useLanguage();
  const stepLabels = lang === 'en' ? stepLabelsEN : stepLabelsID;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans">
      {/* Top Header Navigation Bar with Steps & Quick Action Buttons */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-[#EBE5E2] dark:border-slate-800 mb-6 w-full space-y-4">
        
        {/* ROW 1: Navigation Actions (Back button on Left, Dynamic Step Label in Center, Next/Generate on Right) */}
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Back Button */}
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              currentStep === 1
                ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>{lang === 'en' ? 'Back' : 'Kembali'}</span>
          </button>

          {/* Dynamic Step Label (Centered & Prominent) */}
          <div className="text-xs sm:text-sm md:text-base font-extrabold text-slate-700 dark:text-slate-200 text-center px-2 min-w-0 flex-1 leading-snug">
            <span className="text-slate-400 dark:text-slate-500 text-[11px] sm:text-xs font-bold block sm:inline mr-1 uppercase tracking-wider">
              {lang === 'en' ? 'Step' : 'Langkah'} {currentStep} {lang === 'en' ? 'of 5' : 'dari 5'}:
            </span>
            <span className="text-[#E63946] dark:text-red-400 font-black tracking-tight">
              {stepLabels[currentStep - 1]}
            </span>
          </div>

          {/* Next / Generate Button */}
          <button
            type="button"
            onClick={currentStep === 5 ? generate : nextStep}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95 cursor-pointer text-white shrink-0 ${
              currentStep === 5
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                : 'bg-[#E63946] hover:bg-[#D62839] shadow-red-500/20'
            }`}
          >
            <span>
              {currentStep === 5 
                ? (lang === 'en' ? 'Generate' : 'Buat Program')
                : (lang === 'en' ? 'Next' : 'Lanjut')
              }
            </span>
            <span className="material-symbols-outlined text-base">
              {currentStep === 5 ? 'bolt' : 'arrow_forward'}
            </span>
          </button>
        </div>

        {/* ROW 2: Interactive 5-Step Progress Tracker Bar (100% Separated from Buttons) */}
        <div className="pt-2 border-t border-[#EBE5E2]/60 dark:border-slate-800/80 flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4 w-full">
          {[1, 2, 3, 4, 5].map(step => {
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;

            return (
              <React.Fragment key={step}>
                <button
                  type="button"
                  onClick={() => setCurrentStep && setCurrentStep(step)}
                  className={`w-7 h-7 sm:w-9 sm:h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer border-0 ${
                    isActive
                      ? 'bg-[#E63946] text-white shadow-md shadow-red-500/25 scale-105 ring-2 ring-red-100 dark:ring-red-900/40'
                      : isCompleted
                      ? 'bg-[#E63946] text-white shadow-xs hover:scale-105'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 hover:scale-105'
                  }`}
                  title={`${lang === 'en' ? 'Go to Step' : 'Langkah'} ${step}: ${stepLabels[step - 1]}`}
                >
                  {step}
                </button>

                {step < 5 && (
                  <div 
                    onClick={() => setCurrentStep && setCurrentStep(step + 1)}
                    className={`flex-1 max-w-[48px] sm:max-w-[64px] h-1 rounded-full transition-all cursor-pointer ${
                      currentStep > step ? 'bg-[#E63946]' : 'bg-slate-200 dark:bg-slate-800'
                    }`} 
                    title={`${lang === 'en' ? 'Jump to Step' : 'Lompat ke Langkah'} ${step + 1}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

      </div>

      {/* Step Views */}
      {currentStep === 1 && <ProfileStep onNext={nextStep} />}
      {currentStep === 2 && <EquipmentStep onNext={nextStep} onPrev={prevStep} />}
      {currentStep === 3 && <OneRMStep onNext={nextStep} onPrev={prevStep} />}
      {currentStep === 4 && <GoalsStep onNext={nextStep} onPrev={prevStep} />}
      {currentStep === 5 && <ScreeningStep onNext={generate} onPrev={prevStep} onGoToStep={(s) => setCurrentStep(s)} />}
    </div>
  );
};

export default WizardContainer;
