"use client";

import { Check, Camera, Watch, DollarSign, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard } from "./wizard-context";

const STEPS = [
  { id: 0, title: "Fotografije", shortTitle: "Foto", icon: Camera },
  { id: 1, title: "Osnovni podaci", shortTitle: "Sat", icon: Watch },
  { id: 2, title: "Cena i stanje", shortTitle: "Cena", icon: DollarSign },
  { id: 3, title: "Detalji", shortTitle: "Detalji", icon: Settings },
] as const;

export function WizardProgress() {
  const { currentStep, goToStep } = useWizard();

  return (
    <div className="w-full">
      {/* Desktop progress bar */}
      <nav aria-label="Napredak" className="hidden sm:block">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            const StepIcon = step.icon;

            return (
              <li key={step.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => isComplete && goToStep(step.id)}
                  disabled={!isComplete}
                  className={cn(
                    "group flex w-full flex-col items-center",
                    isComplete && "cursor-pointer"
                  )}
                >
                  {/* Step connector line + circle */}
                  <div className="flex w-full items-center">
                    {/* Left line */}
                    {index > 0 && (
                      <div
                        className={cn(
                          "h-0.5 flex-1 transition-colors",
                          isComplete ? "bg-primary" : "bg-border"
                        )}
                      />
                    )}

                    {/* Circle */}
                    <div
                      className={cn(
                        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        isComplete && "border-primary bg-primary text-primary-foreground",
                        isCurrent && "border-primary bg-background",
                        !isComplete && !isCurrent && "border-border bg-background"
                      )}
                    >
                      {isComplete ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon
                          className={cn(
                            "h-5 w-5",
                            isCurrent ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      )}
                    </div>

                    {/* Right line */}
                    {index < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 flex-1 transition-colors",
                          index < currentStep ? "bg-primary" : "bg-border"
                        )}
                      />
                    )}
                  </div>

                  {/* Step title */}
                  <span
                    className={cn(
                      "mt-2 text-sm font-medium transition-colors",
                      isCurrent ? "text-foreground" : "text-muted-foreground",
                      isComplete && "group-hover:text-primary"
                    )}
                  >
                    {step.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {STEPS[currentStep].title}
          </span>
          <span className="text-sm text-muted-foreground">
            Korak {currentStep + 1} od {STEPS.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                index <= currentStep ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
