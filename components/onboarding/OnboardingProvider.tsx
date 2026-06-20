'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { OnboardingStatus } from '../../lib/onboarding/types';
import { useOnboarding } from './useOnboarding';
import { NameCaptureModal } from './NameCaptureModal';

// Dynamically import the spotlight so we don't ship this heavy JS to returning users
const TourSpotlight = dynamic(() => import('./TourSpotlight'), { ssr: false });

interface OnboardingProviderProps {
  initialStatus: OnboardingStatus;
  hasName: boolean;
  children: React.ReactNode;
}

export function OnboardingProvider({ initialStatus, hasName, children }: OnboardingProviderProps) {
  const { isActive, currentStep, currentStepIndex, totalSteps, nextStep, skipTour, startTour } = useOnboarding();

  useEffect(() => {
    // If the user's status is 'pending' but they have a name, transition them to the tour start automatically.
    // The server handles the name check, but if we end up here as 'tour_started' or we need to start it:
    if (initialStatus === 'tour_started' || (initialStatus === 'pending' && hasName)) {
      startTour();
    }
  }, [initialStatus, hasName]); // eslint-disable-line

  // If completed or skipped, we render absolutely nothing extra.
  if (initialStatus === 'completed' || initialStatus === 'skipped') {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {initialStatus === 'pending' && !hasName && (
        <NameCaptureModal />
      )}

      {isActive && currentStep && (
        <TourSpotlight 
          step={currentStep}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onNext={nextStep}
          onSkip={skipTour}
        />
      )}
    </>
  );
}
