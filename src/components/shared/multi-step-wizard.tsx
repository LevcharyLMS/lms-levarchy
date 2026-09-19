"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "../ui/button";

export interface WizardStep {
  id: string | number;
  title: string;
  description?: string;
}

export type Step = WizardStep;

interface MultiStepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  canNavigateBack?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  isNextDisabled?: boolean;
  nextLabel?: string;
  submitLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function MultiStepWizard({
  steps,
  currentStep,
  onStepClick,
  canNavigateBack = true,
  onBack,
  onNext,
  onSubmit,
  isSubmitting = false,
  isNextDisabled = false,
  nextLabel = "Continue",
  submitLabel = "Submit & Publish",
  children,
  className = "",
}: MultiStepWizardProps) {
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Progress Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => onStepClick && isCompleted && onStepClick(idx)}
                  className={`flex items-center gap-2.5 ${
                    isCompleted && onStepClick ? "cursor-pointer" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-primary text-white ring-4 ring-primary/10"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? "text-navy-950"
                          : isCompleted
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-colors ${
                      idx < currentStep ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Wizard Content Body */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        {children}

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          <div>
            {currentStep > 0 && canNavigateBack && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBack}
                disabled={isSubmitting}
                className="text-xs"
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLastStep && onNext && (
              <Button
                type="button"
                size="sm"
                onClick={onNext}
                disabled={isNextDisabled || isSubmitting}
                className="text-xs bg-primary hover:bg-primary/90 text-white"
              >
                {nextLabel}
              </Button>
            )}

            {isLastStep && onSubmit && (
              <Button
                type="button"
                size="sm"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="text-xs bg-primary hover:bg-primary/90 text-white"
              >
                {isSubmitting ? "Processing..." : submitLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
