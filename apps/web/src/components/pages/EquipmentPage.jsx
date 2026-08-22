import React, { useState, useEffect } from 'react';
import { MST_EXERCISES } from '../../core/db/master-data.js';
import { getUserEquipment, saveUserEquipment, toggleEquipment, updateEquipment1RM } from '../../core/db/user-store.js';
import { useLanguage } from '../../hooks/useLanguage.js';

const EquipmentPage = ({ onGenerate }) => {
  const { lang } = useLanguage();
  const [equipmentList, setEquipmentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  useEffect(() => {
    setEquipmentList(getUserEquipment());
  }, []);

  const isSelected = (slug) => equipmentList.some(e => e.exercise_slug === slug);
  const get1RM = (slug) => {
    const item = equipmentList.find(e => e.exercise_slug === slug);
    return item ? (item.user_1rm_kg || '') : '';
  };

  const handleToggle = (slug, checked) => {
    toggleEquipment(slug, checked);
    setEquipmentList(getUserEquipment());
  };

  const handle1RMChange = (slug, val) => {
    const num = val === '' ? null : parseFloat(val);
    updateEquipment1RM(slug, num);
    setEquipmentList(getUserEquipment());
  };

  const selectAll = () => {
    const all = MST_EXERCISES.map(e => ({ exercise_slug: e.exercise_slug, user_1rm_kg: null }));
    saveUserEquipment(all);
    setEquipmentList(all);
  };

  const clearAll = () => {
    saveUserEquipment([]);
    setEquipmentList([]);
  };

  const filteredExercises = MST_EXERCISES.filter(ex => {
    const matchesSearch = ex.exercise_slug.replace(/_/g, ' ').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || String(ex.safety_category_level) === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md bg-surface rounded-xl p-md shadow-sm border border-surface-variant">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-primary">
            {lang === 'en' ? 'Gym Equipment & 1RM Values' : 'Peralatan Gym & Input 1RM'}
          </h2>
          <p className="text-on-surface-variant font-body-md text-body-md">
            {equipmentList.length} {lang === 'en' ? `of ${MST_EXERCISES.length} equipment selected. Enter 1RM (kg) if known.` : `dari ${MST_EXERCISES.length} alat gym dipilih. Input nilai 1RM (kg) jika diketahui.`}
          </p>
        </div>
        <div className="flex gap-sm">
          <button onClick={selectAll} className="px-md py-xs border border-secondary text-secondary rounded-lg font-label-lg hover:bg-secondary-container transition-colors">
            {lang === 'en' ? 'Select All' : 'Pilih Semua'}
          </button>
          <button onClick={clearAll} className="px-md py-xs border border-error text-error rounded-lg font-label-lg hover:bg-error-container transition-colors">
            {lang === 'en' ? 'Clear All' : 'Hapus Semua'}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-sm">
        <input
          type="text"
          placeholder={lang === 'en' ? 'Search equipment...' : 'Cari alat gym...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-sm border border-outline-variant rounded-lg bg-surface text-on-surface"
        />
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="p-sm border border-outline-variant rounded-lg bg-surface text-on-surface font-bold"
        >
          <option value="ALL">{lang === 'en' ? 'All Categories (43 Items)' : 'Semua Kategori (43 Alat)'}</option>
          <option value="1">{lang === 'en' ? 'Category 1 (Heavy Compound)' : 'Kategori 1 (Compound Utama)'}</option>
          <option value="2">{lang === 'en' ? 'Category 2 (Secondary/Machine)' : 'Kategori 2 (Sekunder/Mesin)'}</option>
          <option value="3">{lang === 'en' ? 'Category 3 (Isolation/Cable)' : 'Kategori 3 (Isolasi/Kabel)'}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sm max-h-[60vh] overflow-y-auto pr-xs">
        {filteredExercises.map(ex => {
          const checked = isSelected(ex.exercise_slug);
          const current1RM = get1RM(ex.exercise_slug);
          return (
            <div 
              key={ex.exercise_slug} 
              className={`p-sm rounded-lg border transition-all space-y-xs ${checked ? 'bg-primary-container/20 border-primary' : 'bg-surface border-outline-variant'}`}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-xs cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => handleToggle(ex.exercise_slug, e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="font-title-md font-bold text-on-surface capitalize truncate" title={ex.exercise_slug.replace(/_/g, ' ')}>
                    {ex.exercise_slug.replace(/_/g, ' ')}
                  </span>
                </label>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${ex.safety_category_level === 1 ? 'bg-error-container text-on-error-container' : ex.safety_category_level === 2 ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-container text-on-tertiary-container'}`}>
                  Cat {ex.safety_category_level}
                </span>
              </div>

              {checked && (
                <div className="pt-xs flex items-center justify-between gap-xs">
                  <span className="text-xs font-label-md text-on-surface-variant">1RM (kg):</span>
                  <input
                    type="number"
                    placeholder="Auto / kg"
                    value={current1RM}
                    onChange={(e) => handle1RMChange(ex.exercise_slug, e.target.value)}
                    className="w-24 p-xs text-sm border border-outline-variant rounded bg-surface text-on-surface font-mono text-center font-bold"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquipmentPage;
