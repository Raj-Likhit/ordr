export type OnboardingStatus = 'pending' | 'name_added' | 'tour_started' | 'completed' | 'skipped';

export interface StepConfig {
  id: string;
  page: string;
  selector: string;
  title: string;
  description: string;
  actionLabel?: string;
}
