import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function GlassCard({ 
  children, 
  className, 
  hoverEffect = true,
  ...props 
}) {
  return (
    <motion.div
      initial={hoverEffect ? { y: 0 } : undefined}
      whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "glass-panel rounded-2xl p-6",
        "relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
