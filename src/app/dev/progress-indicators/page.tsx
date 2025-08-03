'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress, StepIndicator } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';

export default function ProgressIndicatorsDemo() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Demo steps for the step indicator
  const steps = [
    {
      label: 'Step 1',
      description: 'Select repository',
      status: currentStep >= 0 ? (currentStep > 0 ? 'completed' : 'current') : 'upcoming',
    },
    {
      label: 'Step 2',
      description: 'Configure settings',
      status: currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'current') : 'upcoming',
    },
    {
      label: 'Step 3',
      description: 'Review changes',
      status: currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'current') : 'upcoming',
    },
    {
      label: 'Step 4',
      description: 'Confirm and deploy',
      status: currentStep >= 3 ? 'current' : 'upcoming',
    },
  ];

  // Simulate progress for demo
  const simulateProgress = () => {
    setProgress(0);
    setIsLoading(true);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    
    return () => clearInterval(interval);
  };

  // Move to next step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Move to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Progress Indicators</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Progress Bars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Standard Progress Bar</h3>
            <div className="space-y-6">
              <div>
                <Progress value={progress} max={100} showValue />
              </div>
              
              <div className="flex gap-4">
                <Button onClick={simulateProgress} disabled={isLoading}>
                  {isLoading ? 'Simulating...' : 'Simulate Progress'}
                </Button>
                <Button variant="outline" onClick={() => setProgress(0)} disabled={isLoading || progress === 0}>
                  Reset
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Progress Bar Variants</h3>
            <div className="space-y-6">
              <div>
                <Progress value={75} max={100} size="sm" label="Small" showValue />
              </div>
              <div>
                <Progress value={50} max={100} size="md" label="Medium" showValue />
              </div>
              <div>
                <Progress value={25} max={100} size="lg" label="Large" showValue />
              </div>
              <div>
                <Progress value={60} max={100} indicatorColor="bg-green-500" label="Custom Color" showValue />
              </div>
            </div>
          </Card>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Step Indicators</h2>
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Horizontal Step Indicator</h3>
            <div className="space-y-6">
              <StepIndicator steps={steps} orientation="horizontal" />
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                  Previous Step
                </Button>
                <Button onClick={nextStep} disabled={currentStep === steps.length - 1}>
                  Next Step
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Vertical Step Indicator</h3>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2">
                <StepIndicator steps={steps} orientation="vertical" />
              </div>
              
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <div className="p-4 bg-secondary/10 rounded-md">
                  <h4 className="font-medium mb-2">Current Step: {steps[currentStep].label}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{steps[currentStep].description}</p>
                  
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} size="sm">
                      Back
                    </Button>
                    <Button onClick={nextStep} disabled={currentStep === steps.length - 1} size="sm">
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Loading Spinners</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-4">Spinner Sizes</h3>
            <div className="flex gap-8 items-center">
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
          </Card>
          
          <Card className="p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-4">Spinner Colors</h3>
            <div className="flex gap-8 items-center">
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
          
          <Card className="p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-4">Button with Spinner</h3>
            <div className="space-y-4 w-full">
              <Button isLoading className="w-full">
                Loading...
              </Button>
              <Button isLoading variant="secondary" className="w-full">
                Processing...
              </Button>
              <Button isLoading variant="outline" className="w-full">
                Saving...
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}