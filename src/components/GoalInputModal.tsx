// src/components/GoalInputModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type GoalType = 'qualitative' | 'revenue' | 'grossProfit' | 'operatingProfit';

interface GoalInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: string, goalType: GoalType) => void;
  initialValue?: string;
  title?: string;
  cellType?: 'center' | 'major' | 'middle' | 'minor';
}

const GoalInputModal: React.FC<GoalInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValue = '',
  title = 'どんな目標にする？',
  cellType
}) => {
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);
  const [goalText, setGoalText] = useState('');
  const [yearNumber, setYearNumber] = useState<string>('10');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setGoalText(initialValue);
      setSelectedType(null);
      setYearNumber('10');
      setAmount('');
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleTypeSelect = (type: GoalType) => {
    setSelectedType(type);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleSubmit = () => {
    if (selectedType === 'qualitative') {
      if (goalText.trim()) {
        onSubmit(goalText.trim(), selectedType);
        onClose();
      }
    } else if (selectedType) {
      if (amount && yearNumber) {
        const typeLabel = 
          selectedType === 'revenue' ? '売上' :
          selectedType === 'grossProfit' ? '粗利益' :
          '営業利益';
        
        // 小目標（minor）の場合
        if (cellType === 'minor') {
          const formattedGoal = `${yearNumber}年目に${typeLabel}${amount}万円`;
          onSubmit(formattedGoal, selectedType);
        } else {
          // center, major, middle の場合
          // 営業利益のみ「年目に」の後でも改行
          const formattedGoal = selectedType === 'operatingProfit'
            ? `${yearNumber}年目に\n${typeLabel}\n${amount}万円`
            : `${yearNumber}年目に${typeLabel}\n${amount}万円`;
          
          onSubmit(formattedGoal, selectedType);
        }
        onClose();
      }
    }
  };

  const isSubmitDisabled = () => {
    if (!selectedType) return true;
    if (selectedType === 'qualitative') {
      return !goalText.trim();
    }
    return !amount || !yearNumber;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-3xl shadow-xl"
        style={{
          width: '480px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2
            style={{
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '20px',
              color: '#13AE67'
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {!selectedType ? (
            // ステップ1: 目標タイプ選択
            <div className="space-y-4">
              <p
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#6B7280',
                  textAlign: 'center',
                  marginBottom: '24px'
                }}
              >
                目標のタイプを選択してください
              </p>

              <button
                onClick={() => handleTypeSelect('qualitative')}
                className="w-full p-4 rounded-2xl border-2 transition-all hover:border-primary hover:bg-green-50"
                style={{
                  borderColor: '#E5E7EB',
                  background: '#FFFFFF'
                }}
              >
                <div className="text-left">
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#13AE67',
                      marginBottom: '4px'
                    }}
                  >
                    定性的な目標
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#9CA3AF'
                    }}
                  >
                    例: 新規顧客を100社獲得、社員満足度向上
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('revenue')}
                className="w-full p-4 rounded-2xl border-2 transition-all hover:border-primary hover:bg-green-50"
                style={{
                  borderColor: '#E5E7EB',
                  background: '#FFFFFF'
                }}
              >
                <div className="text-left">
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#13AE67',
                      marginBottom: '4px'
                    }}
                  >
                    売上目標
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#9CA3AF'
                    }}
                  >
                    年次PLと連動します
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('grossProfit')}
                className="w-full p-4 rounded-2xl border-2 transition-all hover:border-primary hover:bg-green-50"
                style={{
                  borderColor: '#E5E7EB',
                  background: '#FFFFFF'
                }}
              >
                <div className="text-left">
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#13AE67',
                      marginBottom: '4px'
                    }}
                  >
                    粗利益目標
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#9CA3AF'
                    }}
                  >
                    年次PLと連動します
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('operatingProfit')}
                className="w-full p-4 rounded-2xl border-2 transition-all hover:border-primary hover:bg-green-50"
                style={{
                  borderColor: '#E5E7EB',
                  background: '#FFFFFF'
                }}
              >
                <div className="text-left">
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#13AE67',
                      marginBottom: '4px'
                    }}
                  >
                    営業利益目標
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#9CA3AF'
                    }}
                  >
                    年次PLと連動します
                  </p>
                </div>
              </button>
            </div>
          ) : selectedType === 'qualitative' ? (
            // ステップ2-A: 定性的目標の入力
            <div className="space-y-4">
              <button
                onClick={handleBack}
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#13AE67',
                  marginBottom: '12px'
                }}
              >
                ← 目標タイプを変更
              </button>

              <div>
                <label
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#1E1F1F',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  目標を入力
                </label>
                <textarea
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="例: 新規顧客を100社獲得する"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-200"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    minHeight: '120px'
                  }}
                  maxLength={22}
                />
                <p
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '12px',
                    color: '#9CA3AF',
                    textAlign: 'right',
                    marginTop: '4px'
                  }}
                >
                  {goalText.length} / 22文字
                </p>
              </div>
            </div>
          ) : (
            // ステップ2-B: PL連動目標の入力
            <div className="space-y-4">
              <button
                onClick={handleBack}
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#13AE67',
                  marginBottom: '12px'
                }}
              >
                ← 目標タイプを変更
              </button>

              <div className="bg-green-50 p-4 rounded-xl">
                <p
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#13AE67',
                    marginBottom: '4px'
                  }}
                >
                  {selectedType === 'revenue' ? '売上目標' :
                   selectedType === 'grossProfit' ? '粗利益目標' :
                   '営業利益目標'}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fontSize: '12px',
                    color: '#6B7280'
                  }}
                >
                  年次PL画面に自動で反映されます
                </p>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#1E1F1F',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  達成年度
                </label>
                <select
                  value={yearNumber}
                  onChange={(e) => setYearNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '14px'
                  }}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((year) => (
                    <option key={year} value={year}>
                      {year}年目
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#1E1F1F',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  目標金額（万円）
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="例:1000"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-200"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '14px'
                  }}
                  min="0"
                />
              </div>

              {amount && yearNumber && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#6B7280',
                      marginBottom: '4px'
                    }}
                  >
                    プレビュー
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#13AE67'
                    }}
                  >
                    {yearNumber}年目に
                    {selectedType === 'revenue' ? '売上' :
                     selectedType === 'grossProfit' ? '粗利益' :
                     '営業利益'}
                    {amount}万円
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        {selectedType && (
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full border-2 border-gray-300 font-medium transition-colors hover:bg-gray-50"
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                color: '#6B7280'
              }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
              className="flex-1 py-3 rounded-full font-medium transition-all"
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                background: isSubmitDisabled() ? '#E5E7EB' : '#13AE67',
                color: isSubmitDisabled() ? '#9CA3AF' : '#FFFFFF',
                cursor: isSubmitDisabled() ? 'not-allowed' : 'pointer'
              }}
            >
              設定する
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalInputModal;