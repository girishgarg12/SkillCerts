import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Alert = ({ 
  children, 
  variant = 'info', 
  onClose, 
  className,
  ...props 
}) => {
  const variants = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-200',
    success: 'bg-green-500/10 border-green-500/20 text-green-200',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200',
    error: 'bg-red-500/10 border-red-500/20 text-red-200',
  };

  return (
    <div
      className={cn(
        'relative p-4 rounded-xl border backdrop-blur-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
