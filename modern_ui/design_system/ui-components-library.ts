// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = "", 
  hover = true,
  gradient = false 
}) => {
  return (
    <div className={`
      ${gradient ? 'gradient-primary p-[1px]' : ''}
      ${hover ? 'hover:transform hover:scale-[1.02]' : ''}
      transition-all duration-300
    `}>
      <div className={`
        glass-card ${className}
        ${gradient ? 'bg-white dark:bg-gray-900 m-0' : ''}
      `}>
        {children}
      </div>
    </div>
  );
};

// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = "",
  onClick,
  disabled = false
}) => {
  const baseClasses = "font-semibold rounded-xl transition-all duration-300 disabled:opacity-50";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// components/ui/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  gradient?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  gradient = "from-blue-500 to-purple-500"
}) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };
  
  const trendIcons = {
    up: '↗',
    down: '↙',
    neutral: '→'
  };
  
  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-xl`} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </h3>
          {icon && (
            <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} text-white`}>
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          {change && (
            <div className={`flex items-center text-sm font-medium ${trendColors[trend]}`}>
              <span className="mr-1">{trendIcons[trend]}</span>
              {change}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// components/ui/GradientBackground.tsx
interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'dashboard' | 'purple' | 'blue';
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  variant = 'default'
}) => {
  const variants = {
    default: 'from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900',
    dashboard: 'from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    purple: 'from-purple-50 via-white to-pink-50 dark:from-purple-900 dark:via-gray-800 dark:to-pink-900',
    blue: 'from-blue-50 via-white to-cyan-50 dark:from-blue-900 dark:via-gray-800 dark:to-cyan-900'
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${variants[variant]} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      {children}
    </div>
  );
};