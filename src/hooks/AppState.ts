import { useState, useCallback } from 'react';
import { useUserSettings } from './useAppState';
import { useTheme } from './useAppState';
import { useLoadingState } from './useAppState';
import { useNotificationSettings } from './useAppState';
import { usePredictionHistory } from './useAppState';
import { useTradingSignalHistory } from './useAppState';
import { TradingSignal, UserSettings, NotificationSettings, PredictionHistoryItem, Notification } from '../types';

export interface AppState {
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;

  selectedTimeFrame: string;
  setSelectedTimeFrame: (timeframe: string) => void;

  isDarkMode: boolean;
  toggleTheme: () => void;

  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;

  predictionHistory: PredictionHistoryItem[];
  addPredictionToHistory: (
    symbol: string,
    predictionDays: number,
    predictions: number[]
  ) => void;

  tradingSignalHistory: TradingSignal[];
  addTradingSignalToHistory: (signal: TradingSignal) => void;

  isLoading: boolean;
  error: string | null;
  success: boolean;
  executeWithLoading: <T>(
    operation: () => Promise<T>,
    successMessage?: string
  ) => Promise<T | null>;
  resetLoadingState: () => void;

  userSettings: UserSettings;
  updateUserSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => void;
  toggleFavoriteAsset: (symbol: string) => void;

  notificationSettings: NotificationSettings;
  updateNotificationSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => void;
  toggleNotificationMethod: (method: 'app' | 'email' | 'push') => void;
}

const defaultAsset = 'BTC/USDT';
const defaultTimeFrame = '1d';

export const useAppState = (): AppState => {
  // Estados básicos
  const [selectedAsset, setSelectedAsset] = useState(defaultAsset);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(defaultTimeFrame);

  // Hooks personalizados
  const { theme, toggleTheme } = useTheme();
  const {
    notifications,
    addNotification,
    removeNotification,
    markNotificationAsRead,
  } = useNotificationSystem();
  const { predictionHistory, addPrediction } = usePredictionHistory();
  const { signalHistory, addSignal } = useTradingSignalHistory();
  const {
    isLoading,
    error,
    success,
    executeWithLoading,
    resetState,
  } = useLoadingState();
  const {
    settings: userSettings,
    updateSetting: updateUserSetting,
    toggleFavoriteAsset,
  } = useUserSettings();
  const {
    notificationSettings,
    updateNotificationSetting,
    toggleNotificationMethod,
  } = useNotificationSettings();

  return {
    selectedAsset,
    setSelectedAsset,

    selectedTimeFrame,
    setSelectedTimeFrame,

    isDarkMode: theme === 'dark',
    toggleTheme,

    notifications,
    addNotification,
    removeNotification,
    markNotificationAsRead,

    predictionHistory,
    addPredictionToHistory: addPrediction,

    tradingSignalHistory: signalHistory,
    addTradingSignalToHistory: addSignal,

    isLoading,
    error,
    success,
    executeWithLoading,
    resetLoadingState: resetState,

    userSettings,
    updateUserSetting,
    toggleFavoriteAsset,

    notificationSettings,
    updateNotificationSetting,
    toggleNotificationMethod,
  };
};

// Hook auxiliar para manejar notificaciones
function useNotificationSystem() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
  
    const addNotification = useCallback((notification: Notification) => {
      setNotifications((prev) => [...prev, notification]);
    }, []);
  
    const removeNotification = useCallback((id: string) => {
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== id)
      );
    }, []);
  
    const markNotificationAsRead = useCallback((id: string) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    }, []);
  
    return {
      notifications,
      addNotification,
      removeNotification,
      markNotificationAsRead,
    };
  }
  
  export default useNotificationSystem;