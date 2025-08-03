import React from 'react';
import { cn } from '@/lib/utils';

interface RippleEffectProps {
  className?: string;
  color?: string;
  duration?: number;
}

export const RippleEffect = ({ 
  className, 
  color = 'rgba(255, 255, 255, 0.7)', 
  duration = 500 
}: RippleEffectProps) => {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; size: number; id: number }>>([]);
  const nextId = React.useRef(0);

  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: nextId.current
    };
    
    nextId.current += 1;
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prevRipples => prevRipples.filter(ripple => ripple.id !== newRipple.id));
    }, duration);
  };

  return (
    <div 
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      onClick={addRipple}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            backgroundColor: color,
            transform: 'scale(0)',
            animation: `ripple ${duration}ms linear`,
            opacity: 0.7,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

interface FocusRingProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const FocusRing = ({ 
  className, 
  color = 'ring-primary/50', 
  size = 'md',
  active = false
}: FocusRingProps) => {
  const sizeClasses = {
    sm: 'ring-1',
    md: 'ring-2',
    lg: 'ring-4',
  };

  return (
    <div 
      className={cn(
        'absolute inset-0 rounded-md transition-all duration-200',
        active ? `${sizeClasses[size]} ${color}` : 'ring-0',
        className
      )}
      aria-hidden="true"
    />
  );
};

interface HoverEffectProps {
  className?: string;
  children: React.ReactNode;
  effect?: 'scale' | 'glow' | 'lift' | 'none';
}

export const HoverEffect = ({ 
  className, 
  children,
  effect = 'scale'
}: HoverEffectProps) => {
  const effectClasses = {
    scale: 'hover:scale-[1.02] active:scale-[0.98]',
    glow: 'hover:shadow-lg hover:shadow-primary/20',
    lift: 'hover:-translate-y-1 hover:shadow-md',
    none: '',
  };

  return (
    <div 
      className={cn(
        'transition-all duration-200',
        effectClasses[effect],
        className
      )}
    >
      {children}
    </div>
  );
};

export const InteractionFeedback = {
  Ripple: RippleEffect,
  FocusRing,
  HoverEffect,
};