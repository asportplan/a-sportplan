import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

const FeaturesGrid = () => {
  const { lang } = useLanguage();

  const featuresID = [
    {
      icon: 'swap_horiz',
      color: 'bg-[#E63946]/10 text-[#E63946]',
      title: 'Sesuai Alat Gym Anda',
      desc: 'Program otomatis menyesuaikan variasi gerakan berdasarkan alat gym yang benar-benar tersedia di lokasi latihan Anda.'
    },
    {
      icon: 'shield',
      color: 'bg-[#F3722C]/10 text-[#F3722C]',
      title: 'Beban Aman & Cegah Cedera',
      desc: 'Menghitung batas beban maksimal yang aman agar otot dan sendi tidak mengalami cedera atau kelelahan berlebih.'
    },
    {
      icon: 'calendar_month',
      color: 'bg-[#F9A826]/10 text-[#B45309]',
      title: 'Jadwal & Progres Beban Teratur',
      desc: 'Mengatur kenaikan beban secara bertahap dan jadwal istirahat pemulihan mingguan agar hasil otot lebih cepat dan konsisten.'
    }
  ];

  const featuresEN = [
    {
      icon: 'swap_horiz',
      color: 'bg-[#E63946]/10 text-[#E63946]',
      title: 'Adapted to Your Gym',
      desc: 'Exercises are automatically chosen based on the equipment physically available in your workout location.'
    },
    {
      icon: 'shield',
      color: 'bg-[#F3722C]/10 text-[#F3722C]',
      title: 'Safe Weight & Injury Prevention',
      desc: 'Calculates safe maximum load caps so your muscles and joints stay protected from overtraining.'
    },
    {
      icon: 'calendar_month',
      color: 'bg-[#F9A826]/10 text-[#B45309]',
      title: 'Structured Progression & Recovery',
      desc: 'Guides progressive weight increases with planned recovery weeks to maximize muscle growth and strength.'
    }
  ];

  const features = lang === 'en' ? featuresEN : featuresID;

  return (
    <section className="pb-16 px-4 sm:px-8 max-w-container-max mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-[#EBE5E2] dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className={`w-11 h-11 ${feat.color} rounded-xl flex items-center justify-center mb-4`}>
              <span className="material-symbols-outlined text-xl">{feat.icon}</span>
            </div>
            {/* Bold Title */}
            <h3 className="text-base font-bold text-[#2B2B2B] dark:text-white mb-2">{feat.title}</h3>
            {/* Regular Readable Body Text */}
            <p className="text-xs font-normal text-slate-600 dark:text-slate-400 leading-relaxed">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesGrid;
