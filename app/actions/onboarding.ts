'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { OnboardingStatus } from '@/src/modules/onboarding/types';

export async function updateOnboardingStatus(status: OnboardingStatus) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const updates: any = { onboarding_status: status };
  if (status === 'completed' || status === 'skipped') {
    updates.onboarding_completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('Failed to update onboarding status', error);
    return { error: 'Database error' };
  }

  // Revalidate current pages so the layout conditionally hides the provider
  revalidatePath('/', 'layout');

  return { success: true };
}

export async function completeNameStep(formData: FormData) {
  const name = formData.get('full_name') as string;
  if (!name || name.trim() === '') {
    return { error: 'Name is required' };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('profiles')
    .update({ 
      full_name: name.trim(),
      onboarding_status: 'tour_started' 
    })
    .eq('id', user.id);

  if (error) {
    return { error: 'Failed to update name' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
