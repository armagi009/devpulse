'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { InteractionFeedback } from '@/components/ui/visual-feedback';
import { Card } from '@/components/ui/card';

export default function VisualFeedbackDemo() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [focusActive, setFocusActive] = useState(false);

  const simulateLoading = (key: string) => {
    setIsLoading(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setIsLoading(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Visual Feedback System</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Button States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Default Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Loading Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button 
                isLoading={isLoading['default']} 
                onClick={() => simulateLoading('default')}
              >
                {isLoading['default'] ? 'Loading...' : 'Click me'}
              </Button>
              
              <Button 
                variant="secondary" 
                isLoading={isLoading['secondary']} 
                onClick={() => simulateLoading('secondary')}
              >
                {isLoading['secondary'] ? 'Loading...' : 'Click me'}
              </Button>
              
              <Button 
                variant="destructive" 
                isLoading={isLoading['destructive']} 
                onClick={() => simulateLoading('destructive')}
              >
                {isLoading['destructive'] ? 'Loading...' : 'Click me'}
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Button Sizes</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </Button>
            </div>
          </Card>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Loading Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Spinners</h3>
            <div className="flex flex-wrap gap-8 items-center">
              <div className="flex flex-col items-center gap-2">
                <Spinner size="sm" />
                <span className="text-sm text-muted-foreground">Small</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="md" />
                <span className="text-sm text-muted-foreground">Medium</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="lg" />
                <span className="text-sm text-muted-foreground">Large</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-8 items-center mt-6">
              <div className="flex flex-col items-center gap-2">
                <Spinner color="primary" />
                <span className="text-sm text-muted-foreground">Primary</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner color="secondary" />
                <span className="text-sm text-muted-foreground">Secondary</span>
              </div>
              <div className="p-2 bg-primary rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <Spinner color="white" />
                  <span className="text-sm text-white">White</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Interactive Elements</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium mb-2">Ripple Effect</h4>
                <div className="relative h-20 bg-secondary/20 rounded-md flex items-center justify-center cursor-pointer">
                  <span>Click anywhere to see ripple effect</span>
                  <InteractionFeedback.Ripple />
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-2">Focus Ring</h4>
                <div className="relative p-4 border rounded-md">
                  <button 
                    className="relative w-full p-2 bg-secondary/10 rounded-md"
                    onFocus={() => setFocusActive(true)}
                    onBlur={() => setFocusActive(false)}
                  >
                    Focus me (Tab key)
                    <InteractionFeedback.FocusRing active={focusActive} />
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-2">Hover Effects</h4>
                <div className="flex flex-wrap gap-4">
                  <InteractionFeedback.HoverEffect effect="scale">
                    <div className="p-4 bg-primary/10 rounded-md">Scale</div>
                  </InteractionFeedback.HoverEffect>
                  
                  <InteractionFeedback.HoverEffect effect="glow">
                    <div className="p-4 bg-primary/10 rounded-md">Glow</div>
                  </InteractionFeedback.HoverEffect>
                  
                  <InteractionFeedback.HoverEffect effect="lift">
                    <div className="p-4 bg-primary/10 rounded-md">Lift</div>
                  </InteractionFeedback.HoverEffect>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}