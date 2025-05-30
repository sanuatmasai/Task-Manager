import { toast as hotToast } from 'react-hot-toast';

export const toast = {
  success: (message) => {
    hotToast.success(message, {
      icon: '✅',
      style: {
        borderLeft: '4px solid #10b981',
      },
    });
  },
  error: (message) => {
    hotToast.error(message, {
      icon: '❌',
      style: {
        borderLeft: '4px solid #ef4444',
      },
    });
  },
  info: (message) => {
    hotToast(message, {
      icon: 'ℹ️',
      style: {
        borderLeft: '4px solid #3b82f6',
      },
    });
  },
  warning: (message) => {
    hotToast(message, {
      icon: '⚠️',
      style: {
        borderLeft: '4px solid #f59e0b',
      },
    });
  },
};
