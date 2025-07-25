// app/hooks/useToast.ts
'use client';

import toast from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const success = (
    title: string,
    message?: string | null,
    options?: ToastOptions
  ) => {
    const toastMessage = message ? `${title}\n${message}` : title;
    return toast.success(toastMessage, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      style: {
        //background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--accent-green)',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(8px)',
        maxWidth: '400px',
        background:
          'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.05) 100%)',
      },
      iconTheme: {
        primary: 'var(--accent-green)',
        secondary: 'white',
      },
    });
  };

  const error = (
    title: string,
    message?: string | null,
    options?: ToastOptions
  ) => {
    const toastMessage = message ? `${title}\n${message}` : title;
    return toast.error(toastMessage, {
      duration: options?.duration || 6000,
      position: options?.position || 'top-right',
      style: {
        //background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--accent-red)',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(8px)',
        maxWidth: '400px',
        background:
          'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(239, 68, 68, 0.05) 100%)',
      },
      iconTheme: {
        primary: 'var(--accent-red)',
        secondary: 'white',
      },
    });
  };

  const warning = (
    title: string,
    message?: string | null,
    options?: ToastOptions
  ) => {
    const toastMessage = message ? `${title}\n${message}` : title;
    return toast(toastMessage, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
      icon: '⚠️',
      style: {
        //background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--accent-amber)',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(8px)',
        maxWidth: '400px',
        background:
          'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(245, 158, 11, 0.05) 100%)',
      },
    });
  };

  const info = (
    title: string,
    message?: string | null,
    options?: ToastOptions
  ) => {
    const toastMessage = message ? `${title}\n${message}` : title;
    return toast(toastMessage, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: 'ℹ️',
      style: {
        //background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--accent-blue)',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(8px)',
        maxWidth: '400px',
        background:
          'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(59, 130, 246, 0.05) 100%)',
      },
    });
  };

  const loading = (
    title: string,
    message?: string | null,
    options?: ToastOptions
  ) => {
    const toastMessage = message ? `${title}\n${message}` : title;
    return toast.loading(toastMessage, {
      position: options?.position || 'top-right',
      style: {
        //background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--brand-primary)',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(8px)',
        maxWidth: '400px',
        background:
          'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(99, 102, 241, 0.05) 100%)',
      },
      iconTheme: {
        primary: 'var(--brand-primary)',
        secondary: 'white',
      },
    });
  };

  const upload = (
    title: string,
    message?: string | null,
    options?: ToastOptions
  ) => {
    const toastMessage = message ? `${title}\n${message}` : title;
    return toast(toastMessage, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: '📤',
      style: {
        //background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--brand-primary)',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(8px)',
        maxWidth: '400px',
        background:
          'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(99, 102, 241, 0.05) 100%)',
      },
    });
  };

  const promise = <T>(
    promise: Promise<T>,
    {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: loadingMessage,
        success: successMessage,
        error: errorMessage,
      },
      {
        duration: options?.duration,
        position: options?.position || 'top-right',
        style: {
          //background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(8px)',
          maxWidth: '400px',
        },
        success: {
          style: {
            background:
              'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.05) 100%)',
            border: '1px solid var(--accent-green)',
          },
          iconTheme: {
            primary: 'var(--accent-green)',
            secondary: 'white',
          },
        },
        error: {
          style: {
            background:
              'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '1px solid var(--accent-red)',
          },
          iconTheme: {
            primary: 'var(--accent-red)',
            secondary: 'white',
          },
        },
        loading: {
          style: {
            background:
              'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(99, 102, 241, 0.05) 100%)',
            border: '1px solid var(--brand-primary)',
          },
          iconTheme: {
            primary: 'var(--brand-primary)',
            secondary: 'white',
          },
        },
      }
    );
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    upload,
  };
};
