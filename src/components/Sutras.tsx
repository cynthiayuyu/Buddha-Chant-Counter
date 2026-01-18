import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, SlidersHorizontal, ChevronUp, ChevronDown, X, BookOpen } from 'lucide-react';
import { Sutra, UserSettings } from '../types';

interface SutrasProps {
  sutras: Sutra[];
  settings: UserSettings;
  onAddSutra: (sutra: Sutra) => void;
  onUpdateSutra: (id: string, updates: Partial<Sutra>) => void;
  onDeleteSutra: (id: string) => void;
  onReorderSutras: (newOrder: string[]) => void;
}

function Sutras({
  sutras,
  settings,
  onAddSutra,
  onUpdateSutra,
  onDeleteSutra,
  onReorderSutras,
}: SutrasProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedSutra, setSelectedSutra] = useState<Sutra | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ title: '', content: '' });
  const [tempOrder, setTempOrder] = useState<string[]>([]);

  // Get ordered sutras
  const orderedSutras = useMemo(() => {
    const customOrder = settings.sutrasOrder || [];
    const ordered: Sutra[] = [];

    // Add sutras in custom order
    customOrder.forEach((id) => {
      const sutra = sutras.find((s) => s.id === id);
      if (sutra) ordered.push(sutra);
    });

    // Add remaining sutras not in custom order
    sutras.forEach((sutra) => {
      if (!customOrder.includes(sutra.id)) {
        ordered.push(sutra);
      }
    });

    return ordered;
  }, [sutras, settings.sutrasOrder]);

  const handleOpenAdd = () => {
    setFormData({ title: '', content: '' });
    setShowAddModal(true);
  };

  const handleOpenEdit = (sutra: Sutra) => {
    setSelectedSutra(sutra);
    setFormData({ title: sutra.title, content: sutra.content });
    setShowEditModal(true);
  };

  const handleAddSutra = () => {
    if (formData.title.trim() && formData.content.trim()) {
      const newSutra: Sutra = {
        id: `${Date.now()}-${Math.random()}`,
        title: formData.title.trim(),
        content: formData.content.trim(),
        createdAt: Date.now(),
      };
      onAddSutra(newSutra);
      setShowAddModal(false);
      setFormData({ title: '', content: '' });
    }
  };

  const handleUpdateSutra = () => {
    if (selectedSutra && formData.title.trim() && formData.content.trim()) {
      onUpdateSutra(selectedSutra.id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
      });
      setShowEditModal(false);
      setSelectedSutra(null);
      setFormData({ title: '', content: '' });
    }
  };

  const handleDeleteSutra = (id: string) => {
    if (confirm('確定要刪除此經文嗎？')) {
      onDeleteSutra(id);
      setExpandedId(null);
    }
  };

  const handleOpenReorder = () => {
    setTempOrder(orderedSutras.map((s) => s.id));
    setShowReorderModal(true);
  };

  const handleSaveOrder = () => {
    onReorderSutras(tempOrder);
    setShowReorderModal(false);
  };

  const moveSutra = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...tempOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setTempOrder(newOrder);
  };

  const getTempOrderedSutras = () => {
    return tempOrder.map((id) => sutras.find((s) => s.id === id)!).filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-zen-gold/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zen-sage flex items-center gap-2">
            <BookOpen size={24} />
            經文收藏
          </h2>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenReorder}
              className="text-zen-gold hover:text-zen-sage transition-colors p-2"
              title="重新排序"
            >
              <SlidersHorizontal size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenAdd}
              className="bg-zen-gold text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-zen-gold/90 transition-colors"
            >
              <Plus size={20} />
              新增
            </motion.button>
          </div>
        </div>
      </div>

      {/* Sutras List */}
      <div className="space-y-3">
        {orderedSutras.map((sutra) => (
          <motion.div
            key={sutra.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-zen-gold/20 overflow-hidden"
          >
            <div
              onClick={() => setExpandedId(expandedId === sutra.id ? null : sutra.id)}
              className="p-4 cursor-pointer hover:bg-zen-cream/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zen-dark">{sutra.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(sutra);
                    }}
                    className="text-zen-gold hover:text-zen-sage transition-colors p-1"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSutra(sutra.id);
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === sutra.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-zen-gold/10">
                    <p className="whitespace-pre-wrap text-zen-dark leading-relaxed">
                      {sutra.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {orderedSutras.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-zen-gold/20">
            <BookOpen size={48} className="mx-auto text-zen-sage/30 mb-4" />
            <p className="text-zen-sage/50">尚無經文，點擊「新增」開始收藏</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-zen-sage">
                  {showAddModal ? '新增經文' : '編輯經文'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="text-zen-sage hover:text-zen-gold transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-zen-sage mb-2">
                    標題
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="輸入經文標題..."
                    className="w-full px-4 py-3 border-2 border-zen-gold/30 rounded-lg focus:outline-none focus:border-zen-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zen-sage mb-2">
                    內容
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="輸入經文內容..."
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-zen-gold/30 rounded-lg focus:outline-none focus:border-zen-gold resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-zen-sage/10 text-zen-sage rounded-lg font-medium hover:bg-zen-sage/20 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={showAddModal ? handleAddSutra : handleUpdateSutra}
                  className="flex-1 px-4 py-3 bg-zen-gold text-white rounded-lg font-medium hover:bg-zen-gold/90 transition-colors"
                >
                  {showAddModal ? '新增' : '儲存'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <h3 className="text-xl font-bold text-zen-sage">重新排序經文</h3>
                <button
                  onClick={() => setShowReorderModal(false)}
                  className="text-zen-sage hover:text-zen-gold transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {getTempOrderedSutras().map((sutra, index) => (
                  <div
                    key={sutra.id}
                    className="flex items-center justify-between bg-zen-cream p-3 rounded-lg"
                  >
                    <span className="font-medium text-zen-dark flex-1 truncate">
                      {sutra.title}
                    </span>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => moveSutra(index, 'up')}
                        disabled={index === 0}
                        className="text-zen-gold disabled:text-zen-sage/30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp size={20} />
                      </button>
                      <button
                        onClick={() => moveSutra(index, 'down')}
                        disabled={index === tempOrder.length - 1}
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

export default Sutras;
