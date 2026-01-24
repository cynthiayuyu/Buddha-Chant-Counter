import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart3, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import ZenCounter from './components/ZenCounter';
import Stats from './components/Stats';
import Sutras from './components/Sutras';
import Settings from './components/Settings';
import { Page, ChantRecord, UserSettings, Sutra } from './types';
import {
  signInAnonymouslyUser,
  onAuthStateChange,
  syncRecords,
  syncSettings,
  syncSutras,
  loadRecords,
  loadSettings,
  loadSutras,
} from './firebase/services';

const STORAGE_KEYS = {
  RECORDS: 'zen-chant-records',
  SETTINGS: 'zen-chant-settings',
  SUTRAS: 'zen-chant-sutras',
};

const DEFAULT_CHANTS = ['阿彌陀佛', '觀世音菩薩', '南無本師釋迦牟尼佛'];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('counter');
  const [records, setRecords] = useState<ChantRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    availableChants: DEFAULT_CHANTS,
    goals: [],
  });
  const [sutras, setSutras] = useState<Sutra[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Firebase Authentication and load data
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to sign in anonymously
        await signInAnonymouslyUser();
      } catch (error) {
        console.error('Auth error:', error);
      }
    };

    // Listen to auth state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        setIsAuthenticated(true);

        // Load data from Firebase
        try {
          const [firebaseRecords, firebaseSettings, firebaseSutras] = await Promise.all([
            loadRecords(),
            loadSettings(),
            loadSutras(),
          ]);

          // Use Firebase data if available, otherwise use localStorage
          if (firebaseRecords) {
            setRecords(firebaseRecords);
          } else {
            // Load from localStorage as fallback
            const savedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
            if (savedRecords) {
              const parsed = JSON.parse(savedRecords);
              setRecords(parsed);
              // Sync to Firebase
              await syncRecords(parsed);
            }
          }

          if (firebaseSettings) {
            setSettings({
              ...firebaseSettings,
              availableChants: sortByPhonetic(firebaseSettings.availableChants || DEFAULT_CHANTS),
            });
          } else {
            // Load from localStorage as fallback
            const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (savedSettings) {
              const parsed = JSON.parse(savedSettings);
              const settingsData = {
                ...parsed,
                availableChants: sortByPhonetic(parsed.availableChants || DEFAULT_CHANTS),
              };
              setSettings(settingsData);
              // Sync to Firebase
              await syncSettings(settingsData);
            } else {
              const defaultSettings = {
                availableChants: sortByPhonetic(DEFAULT_CHANTS),
                goals: [],
              };
              setSettings(defaultSettings);
              await syncSettings(defaultSettings);
            }
          }

          if (firebaseSutras) {
            setSutras(firebaseSutras);
          } else {
            // Load from localStorage as fallback
            const savedSutras = localStorage.getItem(STORAGE_KEYS.SUTRAS);
            if (savedSutras) {
              const parsed = JSON.parse(savedSutras);
              setSutras(parsed);
              // Sync to Firebase
              await syncSutras(parsed);
            }
          }
        } catch (error) {
          console.error('Error loading data:', error);
          // Fallback to localStorage if Firebase fails
          loadFromLocalStorage();
        }

        setIsLoading(false);
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    });

    initAuth();

    return () => unsubscribe();
  }, []);

  // Helper function to load from localStorage
  const loadFromLocalStorage = () => {
    const savedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const savedSutras = localStorage.getItem(STORAGE_KEYS.SUTRAS);

    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        ...parsed,
        availableChants: sortByPhonetic(parsed.availableChants || DEFAULT_CHANTS),
      });
    } else {
      setSettings({
        availableChants: sortByPhonetic(DEFAULT_CHANTS),
        goals: [],
      });
    }
    if (savedSutras) {
      setSutras(JSON.parse(savedSutras));
    }
  };

  // Save data to localStorage and Firebase whenever it changes
  useEffect(() => {
    if (!isLoading && records.length >= 0) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
      if (isAuthenticated) {
        syncRecords(records).catch((error) => {
          console.error('Error syncing records:', error);
        });
      }
    }
  }, [records, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && settings.availableChants.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      if (isAuthenticated) {
        syncSettings(settings).catch((error) => {
          console.error('Error syncing settings:', error);
        });
      }
    }
  }, [settings, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && sutras.length >= 0) {
      localStorage.setItem(STORAGE_KEYS.SUTRAS, JSON.stringify(sutras));
      if (isAuthenticated) {
        syncSutras(sutras).catch((error) => {
          console.error('Error syncing sutras:', error);
        });
      }
    }
  }, [sutras, isAuthenticated, isLoading]);

  // Helper function to sort by phonetic order (Zhuyin/Bopomofo)
  const sortByPhonetic = (chants: string[]): string[] => {
    return [...chants].sort((a, b) => a.localeCompare(b, 'zh-Hant-TW'));
  };

  const addRecord = (record: ChantRecord) => {
    setRecords((prev) => [...prev, record]);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // Always sort availableChants phonetically
      if (newSettings.availableChants) {
        updated.availableChants = sortByPhonetic(newSettings.availableChants);
      }
      return updated;
    });
  };

  const addSutra = (sutra: Sutra) => {
    setSutras((prev) => [...prev, sutra]);
  };

  const updateSutra = (id: string, updates: Partial<Sutra>) => {
    setSutras((prev) =>
      prev.map((sutra) => (sutra.id === id ? { ...sutra, ...updates } : sutra))
    );
  };

  const deleteSutra = (id: string) => {
    setSutras((prev) => prev.filter((sutra) => sutra.id !== id));
  };

  const reorderSutras = (newOrder: string[]) => {
    updateSettings({ sutrasOrder: newOrder });
  };

  const navItems = [
    { id: 'counter' as Page, icon: Home, label: '念佛' },
    { id: 'stats' as Page, icon: BarChart3, label: '統計' },
    { id: 'sutras' as Page, icon: BookOpen, label: '經文' },
    { id: 'settings' as Page, icon: SettingsIcon, label: '設定' },
  ];

  // Show loading screen while authenticating
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zen-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-zen-gold border-t-transparent mx-auto mb-4"></div>
          <p className="text-zen-sage text-lg">正在載入數據...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zen-cream pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-zen-gold to-zen-sage text-white py-6 px-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center">靜心念佛</h1>
        <p className="text-center text-sm mt-1 opacity-90">Zen Chanting</p>
        {isAuthenticated && (
          <p className="text-center text-xs mt-2 opacity-75">☁️ 雲端備份已啟用</p>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentPage === 'counter' && (
              <ZenCounter
                records={records}
                settings={settings}
                onAddRecord={addRecord}
              />
            )}
            {currentPage === 'stats' && (
              <Stats records={records} settings={settings} updateSettings={updateSettings} />
            )}
            {currentPage === 'sutras' && (
              <Sutras
                sutras={sutras}
                settings={settings}
                onAddSutra={addSutra}
                onUpdateSutra={updateSutra}
                onDeleteSutra={deleteSutra}
                onReorderSutras={reorderSutras}
              />
            )}
            {currentPage === 'settings' && (
              <Settings settings={settings} onUpdateSettings={updateSettings} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zen-gold/20 shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-around items-center py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-zen-gold bg-zen-gold/10'
                      : 'text-zen-sage hover:text-zen-gold hover:bg-zen-gold/5'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
