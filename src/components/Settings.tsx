import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Target, Cloud, Copy, Check } from 'lucide-react';
import { UserSettings } from '../types';
import { getUserBackupCode } from '../firebase/services';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

function Settings({ settings, onUpdateSettings }: SettingsProps) {
  const [newChantName, setNewChantName] = useState('');
  const [showAddChant, setShowAddChant] = useState(false);
  const [backupCode, setBackupCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const code = getUserBackupCode();
    setBackupCode(code);
  }, []);

  const handleAddChant = () => {
    if (newChantName.trim() && !settings.availableChants.includes(newChantName.trim())) {
      onUpdateSettings({
        availableChants: [...settings.availableChants, newChantName.trim()],
      });
      setNewChantName('');
      setShowAddChant(false);
    }
  };

  const handleDeleteChant = (chantName: string) => {
    onUpdateSettings({
      availableChants: settings.availableChants.filter((c) => c !== chantName),
      goals: settings.goals.filter((g) => g.chantName !== chantName),
    });
  };

  const handleUpdateGoal = (
    chantName: string,
    type: 'daily' | 'monthly' | 'yearly' | 'lifetime',
    value: string
  ) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    const existingGoal = settings.goals.find((g) => g.chantName === chantName);

    if (existingGoal) {
      onUpdateSettings({
        goals: settings.goals.map((g) =>
          g.chantName === chantName ? { ...g, [type]: numValue } : g
        ),
      });
    } else {
      onUpdateSettings({
        goals: [...settings.goals, { chantName, [type]: numValue }],
      });
    }
  };

  const getGoalValue = (chantName: string, type: 'daily' | 'monthly' | 'yearly' | 'lifetime') => {
    const goal = settings.goals.find((g) => g.chantName === chantName);
    return goal?.[type] || '';
  };

  const handleCopyBackupCode = async () => {
    if (backupCode) {
      try {
        await navigator.clipboard.writeText(backupCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Cloud Backup Status */}
      {backupCode && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-zen-gold/20">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="text-zen-gold" size={24} />
            <h2 className="text-xl font-bold text-zen-sage">雲端備份</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-zen-sage">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>自動備份已啟用</span>
            </div>

            <div className="bg-zen-cream p-4 rounded-lg">
              <p className="text-sm text-zen-sage mb-2 font-medium">您的備份代碼：</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-zen-gold/30 text-xs font-mono text-zen-dark break-all">
                  {backupCode}
                </code>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyBackupCode}
                  className="p-2 bg-zen-gold text-white rounded-lg hover:bg-zen-gold/90 transition-colors"
                  title="複製代碼"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </motion.button>
              </div>
              <p className="text-xs text-zen-sage/70 mt-2">
                ⚠️ 請妥善保存此代碼！若需在其他設備上恢復數據，請聯繫技術支援。
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                💡 <strong>自動備份說明：</strong>您的所有念佛記錄、設定和經文都會自動備份到雲端，
                即使清除瀏覽器數據也不會丟失。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Chants */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-zen-gold/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zen-sage flex items-center gap-2">
            <Target size={24} />
            可選念佛項目
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddChant(!showAddChant)}
            className="bg-zen-gold text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-zen-gold/90 transition-colors"
          >
            <Plus size={20} />
            新增
          </motion.button>
        </div>

        <AnimatePresence>
          {showAddChant && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChantName}
                  onChange={(e) => setNewChantName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddChant()}
                  placeholder="輸入念佛名稱..."
                  className="flex-1 px-4 py-2 border-2 border-zen-gold/30 rounded-lg focus:outline-none focus:border-zen-gold"
                />
                <button
                  onClick={handleAddChant}
                  className="bg-zen-sage text-white px-6 py-2 rounded-lg font-medium hover:bg-zen-sage/90 transition-colors"
                >
                  確定
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {settings.availableChants.map((chant) => (
            <motion.div
              key={chant}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between bg-zen-cream px-4 py-3 rounded-lg"
            >
              <span className="font-medium text-zen-dark">{chant}</span>
              <button
                onClick={() => handleDeleteChant(chant)}
                className="text-red-500 hover:text-red-700 transition-colors p-1"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </div>

        {settings.availableChants.length === 0 && (
          <p className="text-center text-zen-sage/50 py-8">尚無念佛項目，請新增</p>
        )}
      </div>

      {/* Goals Settings */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-zen-gold/20">
        <h2 className="text-xl font-bold text-zen-sage mb-4">目標設定</h2>

        <div className="space-y-6">
          {settings.availableChants.map((chant) => (
            <div key={chant} className="border-b border-zen-gold/10 pb-4 last:border-b-0">
              <h3 className="font-medium text-zen-dark mb-3">{chant}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zen-sage/70 mb-1">每日定課</label>
                  <input
                    type="number"
                    value={getGoalValue(chant, 'daily')}
                    onChange={(e) => handleUpdateGoal(chant, 'daily', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-zen-gold/30 rounded-lg focus:outline-none focus:border-zen-gold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zen-sage/70 mb-1">每月定課</label>
                  <input
                    type="number"
                    value={getGoalValue(chant, 'monthly')}
                    onChange={(e) => handleUpdateGoal(chant, 'monthly', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-zen-gold/30 rounded-lg focus:outline-none focus:border-zen-gold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zen-sage/70 mb-1">年度計畫</label>
                  <input
                    type="number"
                    value={getGoalValue(chant, 'yearly')}
                    onChange={(e) => handleUpdateGoal(chant, 'yearly', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-zen-gold/30 rounded-lg focus:outline-none focus:border-zen-gold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zen-sage/70 mb-1">終生大願</label>
                  <input
                    type="number"
                    value={getGoalValue(chant, 'lifetime')}
                    onChange={(e) => handleUpdateGoal(chant, 'lifetime', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-zen-gold/30 rounded-lg focus:outline-none focus:border-zen-gold text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {settings.availableChants.length === 0 && (
          <p className="text-center text-zen-sage/50 py-8">請先新增念佛項目</p>
        )}
      </div>
    </div>
  );
}

export default Settings;
