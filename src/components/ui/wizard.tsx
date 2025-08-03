'use client';

import React, { useState, createContext, useContext, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// Types
interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isStepComplete: (step: number) => boolean;
  markStepComplete: (step: number) => void;
  markStepIncomplete: (step: number) => void;
}

interface WizardProps {
  children: ReactNode;
  onComplete?: () => void;
  className?: string;
}

interface WizardStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  isOptional?: boolean;
  canSkip?: boolean;
  onNext?: () => Promise<boolean> | boolean;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
}

// Create context
const WizardContext = createContext<WizardContextType | undefined>(undefined);

// Hook to use wizard context
export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a Wizard component');
  }
  return context;
}

// Main Wizard component
export function Wizard({ children, onComplete, className = '' }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Count total steps
  const childrenArray = React.Children.toArray(children);
  const totalSteps = childrenArray.length;
  
  // Navigation functions
  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };
  
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (onComplete) {
      onComplete();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Step completion functions
  const isStepComplete = (step: number) => completedSteps.has(step);
  
  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };
  
  const markStepIncomplete = (step: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set([...prev]);
      newSet.delete(step);
      return newSet;
    });
  };
  
  // Context value
  const contextValue: WizardContextType = {
    currentStep,
    totalSteps,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    isStepComplete,
    markStepComplete,
    markStepIncomplete,
  };
  
  return (
    <WizardContext.Provider value={contextValue}>
      <div className={`wizard ${className}`}>
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <React.Fragment key={index}>
                {/* Step circle */}
                <div 
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    index < currentStep 
                      ? 'border-green-500 bg-green-500 text-white' 
                      : index === currentStep 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {/* Connector line */}
                {index < totalSteps - 1 && (
                  <div 
                    className={`flex-1 border-t-2 ${
                      index < currentStep 
                        ? 'border-green-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Current step content */}
        <div className="wizard-content">
          {React.Children.map(children, (child, index) => {
            if (index === currentStep) {
              return child;
            }
            return null;
          })}
        </div>
      </div>
    </WizardContext.Provider>
  );
}

// Wizard Step component
export function WizardStep({
  title,
  description,
  children,
  isOptional = false,
  canSkip = false,
  onNext,
  onPrev,
  nextLabel = "Next",
  prevLabel = "Back",
  completeLabel = "Complete"
}: WizardStepProps) {
  const { 
    nextStep, 
    prevStep, 
    isFirstStep, 
    isLastStep,
    currentStep,
    markStepComplete
  } = useWizard();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleNext = async () => {
    if (onNext) {
      setIsProcessing(true);
      try {
        const canProceed = await onNext();
        if (canProceed) {
          markStepComplete(currentStep);
          nextStep();
        }
      } catch (error) {
        console.error('Error in step validation:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      markStepComplete(currentStep);
      nextStep();
    }
  };
  
  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    }
    prevStep();
  };
  
  const handleSkip = () => {
    nextStep();
  };
  
  return (
    <Card className="wizard-step">
      <CardHeader>
        <CardTitle className="flex items-center">
          {title}
          {isOptional && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              (Optional)
            </span>
          )}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </CardHeader>
      
      <CardContent>
        {children}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={isFirstStep || isProcessing}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {prevLabel}
        </Button>
        
        <div className="flex space-x-2">
          {isOptional && canSkip && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isProcessing}
            >
              Skip
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                {isLastStep ? completeLabel : nextLabel}
                {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}