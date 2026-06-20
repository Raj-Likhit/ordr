import { useState, useEffect } from 'react';
import { ONBOARDING_STEPS } from '../../lib/onboarding/steps.config';
import { updateOnboardingStatus } from '../../app/actions/onboarding';
import { useRouter, usePathname } from 'next/navigation';

export function useOnboarding() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  // If the user navigates, make sure the step matches the page, or advance to the first step of that page.
  useEffect(() => {
    if (isActive && currentStep && currentStep.page !== pathname) {
      // Find the first step on the new page
      const nextPageIndex = ONBOARDING_STEPS.findIndex(s => s.page === pathname && ONBOARDING_STEPS.indexOf(s) >= currentStepIndex);
      if (nextPageIndex !== -1) {
        setCurrentStepIndex(nextPageIndex);
      }
    }
  }, [pathname, isActive, currentStep, currentStepIndex]);

  const nextStep = async () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      const next = ONBOARDING_STEPS[currentStepIndex + 1];
      if (next.page !== pathname) {
        // We need to navigate to the next page
        router.push(next.page);
        // The useEffect will catch the path change and update the index
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        setCurrentStepIndex(prev => prev + 1);
      }
    } else {
      // Finished
      setIsActive(false);
      await updateOnboardingStatus('completed');
    }
  };

  const skipTour = async () => {
    setIsActive(false);
    await updateOnboardingStatus('skipped');
  };

  const startTour = () => setIsActive(true);

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: ONBOARDING_STEPS.length,
    nextStep,
    skipTour,
    startTour
  };
}
