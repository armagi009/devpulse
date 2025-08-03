'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-sm',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.02] active:scale-[0.98] shadow-sm',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground hover:border-accent active:scale-[0.98]',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.02] active:scale-[0.98] shadow-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
        link: 'underline-offset-4 hover:underline text-primary hover:text-primary/80',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

// Import the Spinner component
import { Spinner } from './spinner';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, loadingText, children, ...props }, ref) => {
    if (asChild) {
      return <React.Fragment {...props} />;
    }
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          isLoading && 'relative cursor-not-allowed'
        )}
        disabled={isLoading || props.disabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Spinner size={size === 'sm' ? 'sm' : 'md'} color={variant === 'default' ? 'white' : 'primary'} />
          </span>
        )}
        <span className={cn(isLoading && 'invisible')}>
          {isLoading && loadingText ? loadingText : children}
        </span>
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
