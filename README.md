# 靜心念佛 - Zen Chanting Counter

一個優雅的念佛計數網頁應用程式，幫助您追蹤每日修行進度。

## 功能特色

### 📿 念佛計數
- 即時計數功能
- 支援多種念佛選項
- 本次計數與累計統計
- 優雅的動畫效果

### 📊 統計分析
- 趨勢圖表 (最近30天)
- 可自訂標籤排序
- 全部/分項統計切換
- 階段目標達成率追蹤
  - 每日定課
  - 每月定課
  - 年度計畫
  - 終生大願

### 📖 經文收藏
- 儲存常用經文
- 可自訂排序
- 展開/收合閱讀
- 新增/編輯/刪除功能

### ⚙️ 設定管理
- 自動注音排序念佛項目
- 設定各階段目標
- 資料持久化儲存 (localStorage)

## 技術棧

- **前端框架**: React 18 + TypeScript
- **建置工具**: Vite
- **樣式**: Tailwind CSS
- **動畫**: Framer Motion
- **圖表**: Recharts
- **圖示**: Lucide React

## 安裝與執行

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```

應用程式將在 `http://localhost:5173` 啟動

### 建置生產版本
```bash
npm run build
```

### 預覽生產版本
```bash
npm run preview
```

## 專案結構

```
Buddha-Chant-Counter/
├── src/
│   ├── components/
│   │   ├── ZenCounter.tsx   # 主計數頁面
│   │   ├── Stats.tsx         # 統計頁面
│   │   ├── Sutras.tsx        # 經文頁面
│   │   └── Settings.tsx      # 設定頁面
│   ├── types.ts              # TypeScript 型別定義
│   ├── App.tsx               # 主應用程式組件
│   ├── main.tsx              # 應用程式入口點
│   └── index.css             # 全域樣式
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 設計特色

### 高雅禪意風格
- 配色方案:
  - 金色 (#d4a373)
  - 鼠尾草綠 (#6b705c)
  - 米白色 (#fdfbf7)
- 圓潤邊角與柔和陰影
- 流暢的動畫過渡

### 響應式設計
- 適配各種螢幕尺寸
- 移動端友善的觸控介面
- 固定式底部導航列

## 使用說明

1. **念佛**: 選擇念佛項目，點擊「計數」按鈕開始記錄
2. **統計**: 查看趨勢圖表和目標達成進度，可自訂標籤順序
3. **經文**: 收藏常用經文，方便隨時閱讀
4. **設定**: 管理念佛項目和設定各階段目標

## 資料儲存

所有資料儲存在瀏覽器的 localStorage 中，包括:
- 念佛記錄
- 使用者設定
- 經文內容
- 自訂排序

## 授權

MIT License

## 作者

Created with ❤️ for meditation and mindfulness practice
