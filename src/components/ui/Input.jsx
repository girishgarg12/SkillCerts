import { cn } from '../../lib/utils';

export const Input = ({ className, error, label, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all',
          error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 hover:border-white/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
