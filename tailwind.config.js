/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hiragino Sans"', '"Hiragino Kaku Gothic ProN"', 'Inter', 'Roboto', '"Noto Sans JP"', "sans-serif"],
        heading: ['"Hiragino Sans"', '"Hiragino Kaku Gothic ProN"', 'Inter', "sans-serif"],
        body: ['"Hiragino Sans"', '"Hiragino Kaku Gothic ProN"', 'Roboto', '"Noto Sans JP"', "sans-serif"],
      },
      fontSize: {
        // 3種類のフォントサイズに限定
        'heading': ['24px', { lineHeight: '1.4', fontWeight: '700' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'note': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      colors: {
        // 新カラーシステム
        primary: "#13AE67", // rgb(103 186 202)から変更
        accent: "#FE0000",
        gray: {
          main: "#1E1F1F", // 統一グレー
          50: "#F5F8F9", // 背景白
          100: "#E5E7EB",
          200: "#D1D5DB",
          300: "#9CA3AF",
          400: "#6B7280",
          500: "#4B5563",
          600: "#374151",
          700: "#1F2937",
          800: "#1E1F1F", // 統一グレー
          900: "#111827",
        },
        //background: "#F5F8F9", // 背景白
        background: "#F6FAFC", // 背景グレー
        text: "#1E1F1F", // 統一グレー
        border: "#E0E0E0",
        success: "#13AE67", // primaryと統一
        achieved: "#EC4899", // 達成後ピンク（柔らかく）
        warning: "#FFA726",
        info: "#2196F3",
        error: "#D32F2F",
      },
      borderRadius: {
        'card': '12px',
        'card-lg': '16px',
        'card-xl': '20px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
