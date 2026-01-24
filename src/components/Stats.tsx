import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronUp, ChevronDown, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChantRecord, UserSettings } from '../types';

interface StatsProps {
  records: ChantRecord[];
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

function Stats({ records, settings, updateSettings }: StatsProps) {
  const [selectedTab, setSelectedTab] = useState('全部');
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [tempTabOrder, setTempTabOrder] = useState<string[]>([]);

  // Calculate ordered tabs
  const orderedTabs = useMemo(() => {
    const tabs = ['全部'];
    const customOrder = settings.statsTabOrder || [];
    const allChants = settings.availableChants;

    // Add chants in custom order
    customOrder.forEach((chant) => {
      if (allChants.includes(chant)) {
        tabs.push(chant);
      }
    });

    // Add remaining chants (not in custom order) sorted phonetically
    const remainingChants = allChants
      .filter((chant) => !customOrder.includes(chant))
      .sort((a, b) => a.localeCompare(b, 'zh-Hant-TW'));

    tabs.push(...remainingChants);

    return tabs;
  }, [settings.availableChants, settings.statsTabOrder]);

  // Reset selectedTab to '全部' if current tab is removed
  useEffect(() => {
    if (!orderedTabs.includes(selectedTab)) {
      setSelectedTab('全部');
    }
  }, [orderedTabs, selectedTab]);

  const handleOpenReorder = () => {
    // Initialize temp order with current chants (excluding "全部")
    const currentChants = orderedTabs.filter((t) => t !== '全部');
    setTempTabOrder(currentChants);
    setShowReorderModal(true);
  };

  const handleSaveOrder = () => {
    updateSettings({ statsTabOrder: tempTabOrder });
    setShowReorderModal(false);
  };

  const moveChant = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...tempTabOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setTempTabOrder(newOrder);
  };

  // Calculate stats for selected chant
  const calculateStats = () => {
    const filteredRecords =
      selectedTab === '全部'
        ? records
        : records.filter((r) => r.chantName === selectedTab);

    // Group by date
    const dateMap = new Map<string, number>();
    filteredRecords.forEach((record) => {
      const current = dateMap.get(record.date) || 0;
      dateMap.set(record.date, current + record.count);
    });

    // Convert to array and sort by date
    const chartData = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    const total = filteredRecords.reduce((sum, r) => sum + r.count, 0);

    const today = new Date().toISOString().split('T')[0];
    const todayCount = filteredRecords
      .filter((r) => r.date === today)
      .reduce((sum, r) => sum + r.count, 0);

    const thisMonth = new Date().toISOString().substring(0, 7);
    const monthCount = filteredRecords
      .filter((r) => r.date.startsWith(thisMonth))
      .reduce((sum, r) => sum + r.count, 0);

    const thisYear = new Date().getFullYear().toString();
    const yearCount = filteredRecords
      .filter((r) => r.date.startsWith(thisYear))
      .reduce((sum, r) => sum + r.count, 0);

    return { total, todayCount, monthCount, yearCount, chartData };
  };

  const stats = calculateStats();

  // Get goals for selected chant
  const getGoal = (type: 'daily' | 'monthly' | 'yearly' | 'lifetime') => {
    if (selectedTab === '全部') return null;
    const goal = settings.goals.find((g) => g.chantName === selectedTab);
    return goal?.[type] || null;
  };

  const calculateProgress = (current: number, goal: number | null) => {
    if (!goal || goal === 0) return 0;
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-zen-gold/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-zen-sage">選擇項目</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenReorder}
            className="text-zen-gold hover:text-zen-sage transition-colors p-2"
            title="重新排序"
          >
            <SlidersHorizontal size={20} />
          </motion.button>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {orderedTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedTab === tab
                  ? 'bg-zen-gold text-white shadow-md'
                  : 'bg-zen-cream text-zen-sage hover:bg-zen-gold/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-zen-gold/20">
        <h3 className="text-lg font-bold text-zen-sage mb-4">念佛趨勢</h3>
        {stats.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4a373" opacity={0.2} />
              <XAxis
                dataKey="date"
                stroke="#6b705c"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.substring(5)}
              />
              <YAxis stroke="#6b705c" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fdfbf7',
                  border: '1px solid #d4a373',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#d4a373"
                strokeWidth={3}
                dot={{ fill: '#d4a373', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-zen-sage/50 py-12">尚無數據</p>
        )}
      </div>

      {/* Goal Progress - Only show if NOT "全部" */}
      {selectedTab !== '全部' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-zen-gold/20">
          <h3 className="text-lg font-bold text-zen-sage mb-4">階段目標達成率</h3>
          <div className="space-y-4">
            {/* Daily */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zen-sage font-medium">每日定課</span>
                <span className="text-zen-gold font-bold">
                  {stats.todayCount} / {getGoal('daily') || '未設定'}
                </span>
              </div>
              <div className="w-full bg-zen-cream rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${calculateProgress(stats.todayCount, getGoal('daily'))}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-zen-gold to-zen-sage"
                />
              </div>
            </div>

            {/* Monthly */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zen-sage font-medium">每月定課</span>
                <span className="text-zen-gold font-bold">
                  {stats.monthCount} / {getGoal('monthly') || '未設定'}
                </span>
              </div>
              <div className="w-full bg-zen-cream rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${calculateProgress(stats.monthCount, getGoal('monthly'))}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-zen-gold to-zen-sage"
                />
              </div>
            </div>

            {/* Yearly */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zen-sage font-medium">年度計畫</span>
                <span className="text-zen-gold font-bold">
                  {stats.yearCount} / {getGoal('yearly') || '未設定'}
                </span>
              </div>
              <div className="w-full bg-zen-cream rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${calculateProgress(stats.yearCount, getGoal('yearly'))}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-zen-gold to-zen-sage"
                />
              </div>
            </div>

            {/* Lifetime */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zen-sage font-medium">終生大願</span>
                <span className="text-zen-gold font-bold">
                  {stats.total} / {getGoal('lifetime') || '未設定'}
                </span>
              </div>
              <div className="w-full bg-zen-cream rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${calculateProgress(stats.total, getGoal('lifetime'))}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-zen-gold to-zen-sage"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Modal */}
      <AnimatePresence>
        {showReorderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowReorderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-zen-sage">重新排序標籤</h3>
                <button
                  onClick={() => setShowReorderModal(false)}
                  className="text-zen-sage hover:text-zen-gold transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {tempTabOrder.map((chant, index) => (
                  <div
                    key={chant}
                    className="flex items-center justify-between bg-zen-cream p-3 rounded-lg"
                  >
                    <span className="font-medium text-zen-dark">{chant}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveChant(index, 'up')}
                        disabled={index === 0}
                        className="text-zen-gold disabled:text-zen-sage/30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp size={20} />
                      </button>
                      <button
                        onClick={() => moveChant(index, 'down')}
                        disabled={index === tempTabOrder.length - 1}
                        className="text-zen-gold disabled:text-zen-sage/30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReorderModal(false)}
                  className="flex-1 px-4 py-3 bg-zen-sage/10 text-zen-sage rounded-lg font-medium hover:bg-zen-sage/20 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveOrder}
                  className="flex-1 px-4 py-3 bg-zen-gold text-white rounded-lg font-medium hover:bg-zen-gold/90 transition-colors"
                >
                  儲存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Stats;
