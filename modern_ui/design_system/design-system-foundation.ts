// styles/globals.css - Extended Tailwind configuration
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Brand Colors */
    --primary-50: 239 246 255;
    --primary-100: 219 234 254;
    --primary-500: 59 130 246;
    --primary-600: 37 99 235;
    --primary-700: 29 78 216;
    
    /* Glassmorphism */
    --glass-bg: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
    --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    
    /* Gradients */
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --gradient-success: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  [data-theme="dark"] {
    --glass-bg: rgba(0, 0, 0, 0.2);
    --glass-border: rgba(255, 255, 255, 0.1);
  }
}

@layer components {
  /* Glass morphism utility classes */
  .glass {
    @apply bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10;
  }
  
  .glass-card {
    @apply glass rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300;
  }
  
  /* Gradient utilities */
  .gradient-primary {
    @apply bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600;
  }
  
  .gradient-text {
    @apply bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent;
  }
  
  /* Modern button styles */
  .btn-primary {
    @apply gradient-primary text-white px-6 py-3 rounded-xl font-semibold 
           shadow-lg hover:shadow-xl transform hover:scale-105 
           transition-all duration-300 border-0;
  }
  
  .btn-secondary {
    @apply glass-card px-6 py-3 font-semibold 
           hover:bg-white/20 dark:hover:bg-black/20 
           transition-all duration-300;
  }
  
  /* Dashboard specific components */
  .dashboard-card {
    @apply glass-card p-6 hover:transform hover:scale-[1.02];
  }
  
  .metric-card {
    @apply dashboard-card relative overflow-hidden;
  }
  
  .sidebar-item {
    @apply flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300
           hover:bg-white/10 dark:hover:bg-black/10 hover:text-blue-600 dark:hover:text-blue-400
           transition-all duration-200 cursor-pointer;
  }
  
  .sidebar-item.active {
    @apply bg-blue-500/10 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500;
  }
}