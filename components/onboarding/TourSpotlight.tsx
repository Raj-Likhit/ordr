'use client';

import { useEffect, useState } from 'react';
import { StepConfig } from '@/src/modules/onboarding/types';

interface TourSpotlightProps {
  step: StepConfig;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

export default function TourSpotlight({ step, currentStepIndex, totalSteps, onNext, onSkip }: TourSpotlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // We add a small delay to ensure the page has rendered the elements
    const timeoutId = setTimeout(() => {
      const el = document.querySelector(step.selector);
      if (el) {
        setRect(el.getBoundingClientRect());
        // Scroll element into view smoothly if it's not visible
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // If element is not found, fallback to center or auto-skip.
        // For simplicity, we just set rect to null which acts as a center modal.
        setRect(null);
      }
    }, 300);

    // Handle resize
    const handleResize = () => {
      const el = document.querySelector(step.selector);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [step.selector]);

  // CSS Box-shadow spotlight approach (performance friendly)
  const spotlightStyle = rect ? {
    top: rect.top - 8,
    left: rect.left - 8,
    width: rect.width + 16,
    height: rect.height + 16,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none' as any,
  } : {
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
    transition: 'all 0.3s ease',
  };

  // Determine tooltip placement based on screen position
  const isBottom = rect ? (rect.bottom > window.innerHeight - 200) : false;
  const tooltipStyle = rect ? {
    top: isBottom ? rect.top - 24 : rect.bottom + 24,
    left: Math.max(16, Math.min(rect.left, window.innerWidth - 320 - 16)), // Keep within screen bounds
  } : {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };

  return (
    <>
      {/* Spotlight Mask */}
      <div 
        className="fixed z-[100]" 
        style={{ ...spotlightStyle, position: 'fixed' }} 
      />

      {/* Tooltip Content */}
      <div 
        className="fixed z-[101] w-80 bg-[var(--color-bg)] rounded-xl shadow-2xl border border-[var(--color-border)] p-6 animate-in zoom-in-95 duration-200"
        style={{ ...tooltipStyle, position: 'fixed', ...(isBottom && { transform: 'translateY(-100%)' }) }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <button 
            onClick={onSkip}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Skip Tour
          </button>
        </div>
        
        <h3 className="text-lg font-display font-semibold text-[var(--color-text-primary)] mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
          {step.description}
        </p>

        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="px-5 py-2.5 bg-[var(--color-accent)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            {step.actionLabel || 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}
