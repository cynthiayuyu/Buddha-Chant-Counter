import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, RotateCcw } from 'lucide-react';
import { ChantRecord, UserSettings } from '../types';

interface ZenCounterProps {
  records: ChantRecord[];
  settings: UserSettings;
  onAddRecord: (record: ChantRecord) => void;
}

function ZenCounter({ records, settings, onAddRecord }: ZenCounterProps) {
  const [selectedChant, setSelectedChant] = useState(settings.availableChants[0] || '');
  const [sessionCount, setSessionCount] = useState(0);

  // Sync selectedChant with available chants when settings change
  useEffect(() => {
    // If current selected chant is not in the available chants list, reset it
    if (settings.availableChants.length > 0 && !settings.availableChants.includes(selectedChant)) {
      setSelectedChant(settings.availableChants[0]);
      setSessionCount(0);
    }
  }, [settings.availableChants, selectedChant]);

  const handleIncrement = () => {
    const newCount = sessionCount + 1;
    setSessionCount(newCount);

    const now = new Date();
    const record: ChantRecord = {
      id: `${Date.now()}-${Math.random()}`,
      chantName: selectedChant,
      count: 1,
      timestamp: now.getTime(),
      date: now.toISOString().split('T')[0],
    };

    onAddRecord(record);
  };

  const handleReset = () => {
    setSessionCount(0);
  };

  // Get today's total for selected chant
  const today = new Date().toISOString().split('T')[0];
  const todayTotal = records
    .filter((r) => r.chantName === selectedChant && r.date === today)
    .reduce((sum, r) => sum + r.count, 0);

  // Get lifetime total for selected chant
  const lifetimeTotal = records
    .filter((r) => r.chantName === selectedChant)
    .reduce((sum, r) => sum + r.count, 0);

  // Handle empty chants list
  if (settings.availableChants.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-zen-gold/20">
          <p className="text-zen-sage text-lg mb-4">尚無念佛項目</p>
          <p className="text-zen-sage/70 text-sm">請前往「設定」頁面新增念佛項目</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chant Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-zen-gold/20">
        <label className="block text-sm font-medium text-zen-sage mb-3">
          選擇念佛
        </label>
        <select
          value={selectedChant}
          onChange={(e) => {
            setSelectedChant(e.target.value);
            setSessionCount(0);
          }}
          className="w-full px-4 py-3 bg-zen-cream border-2 border-zen-gold/30 rounded-xl text-lg font-medium text-zen-dark focus:outline-none focus:border-zen-gold transition-colors"
        >
          {settings.availableChants.map((chant) => (
            <option key={chant} value={chant}>
              {chant}
            </option>
          ))}
        </select>
      </div>

      {/* Counter Display */}
      <motion.div
        className="bg-gradient-to-br from-zen-gold/10 to-zen-sage/10 rounded-2xl shadow-xl p-12 border-2 border-zen-gold/30"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-medium text-zen-sage">{selectedChant}</h2>
          <motion.div
            key={sessionCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-8xl font-bold text-zen-gold"
          >
            {sessionCount}
          </motion.div>
          <p className="text-sm text-zen-sage/70">本次計數</p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          onClick={handleIncrement}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-zen-gold text-white py-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-zen-gold/90 transition-colors"
        >
          <Plus size={24} />
          計數
        </motion.button>

        <motion.button
          onClick={handleReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-zen-sage text-white py-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-zen-sage/90 transition-colors"
        >
          <RotateCcw size={24} />
          重置
        </motion.button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border border-zen-gold/20">
          <p className="text-sm text-zen-sage/70 mb-1">今日總計</p>
          <p className="text-3xl font-bold text-zen-gold">{todayTotal}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-zen-gold/20">
          <p className="text-sm text-zen-sage/70 mb-1">累計總數</p>
          <p className="text-3xl font-bold text-zen-sage">{lifetimeTotal}</p>
        </div>
      </div>
    </div>
  );
}

export default ZenCounter;
