import { toast } from 'react-hot-toast';

/**
 * Show a brief toast notification.
 * @param message The text to display.
 * @param type Optional style: 'success' | 'error' | 'loading' | 'blank'
 */
export function showToast(
  message: string,
  type: 'success' | 'error' | 'loading' | 'blank' = 'blank'
) {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'loading':
      toast.loading(message);
      break;
    default:
      toast(message);
  }
}
