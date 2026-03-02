// ============================================
// TAMADA — Core TypeScript Types
// ============================================

export type Language = 'ka' | 'en';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'experienced' | 'master';

export type FormalityLevel = 'formal' | 'semi_formal' | 'casual';

export type FeastStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';

export type FeastToastStatus = 'pending' | 'active' | 'completed' | 'skipped';

export type GuestRole = 'guest' | 'mejavare' | 'honored_guest' | 'family';

export type CollaboratorRole = 'mejavare' | 'viewer';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export type OccasionType =
  | 'wedding'
  | 'birthday'
  | 'memorial'
  | 'christening'
  | 'guest_reception'
  | 'holiday'
  | 'corporate'
  | 'friendly_gathering'
  | 'other';

export type GeorgianRegion =
  | 'kakheti'
  | 'imereti'
  | 'kartli'
  | 'racha'
  | 'samegrelo'
  | 'guria'
  | 'adjara'
  | 'svaneti'
  | 'meskheti';

export type ToastType =
  | 'god'
  | 'homeland'
  | 'parents'
  | 'deceased'
  | 'host'
  | 'guest_of_honor'
  | 'love'
  | 'children'
  | 'friendship'
  | 'future'
  | 'mother'
  | 'father'
  | 'women'
  | 'brotherhood'
  | 'peace'
  | 'georgia'
  | 'custom';

export type ProFeature =
  | 'ai_generation'
  | 'favorites'
  | 'custom_toasts'
  | 'active_feasts'
  | 'alaverdi'
  | 'co_tamada'
  | 'export_pdf'
  | 'feast_stats'
  | 'tone_control';

// ============================================
// Database Models
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  region: GeorgianRegion | null;
  experience_level: ExperienceLevel | null;
  preferred_language: Language;
  typical_occasions: OccasionType[] | null;
  is_pro: boolean;
  pro_expires_at: string | null;
  stripe_customer_id: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Toast {
  id: string;
  title_ka: string;
  title_en: string | null;
  body_ka: string;
  body_en: string | null;
  occasion_type: OccasionType;
  region: GeorgianRegion | null;
  toast_order_position: number | null;
  formality_level: FormalityLevel | null;
  tags: string[] | null;
  is_system: boolean;
  created_by: string | null;
  popularity_score: number;
  created_at: string;
  updated_at: string;
}

export interface ToastTemplateItem {
  position: number;
  toast_type: ToastType;
  is_required: boolean;
  description_ka: string;
  description_en: string;
  duration_minutes?: number;
}

export interface ToastTemplate {
  id: string;
  name_ka: string;
  name_en: string | null;
  occasion_type: OccasionType;
  region: GeorgianRegion | null;
  formality_level: FormalityLevel | null;
  toast_sequence: ToastTemplateItem[];
  estimated_duration_minutes: number | null;
  is_system: boolean;
  created_by: string | null;
  created_at: string;
}

export interface CustomToast {
  id: string;
  user_id: string;
  title_ka: string | null;
  title_en: string | null;
  body_ka: string;
  body_en: string | null;
  occasion_type: OccasionType | null;
  tags: string[] | null;
  is_ai_generated: boolean;
  ai_generation_params: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  toast_id: string | null;
  custom_toast_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Feast {
  id: string;
  host_id: string;
  title: string;
  occasion_type: OccasionType;
  formality_level: FormalityLevel;
  guest_count: number | null;
  estimated_duration_minutes: number;
  actual_start_time: string | null;
  actual_end_time: string | null;
  status: FeastStatus;
  share_code: string | null;
  region: GeorgianRegion | null;
  notes: string | null;
  template_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeastToast {
  id: string;
  feast_id: string;
  position: number;
  toast_type: ToastType;
  title_ka: string;
  title_en: string | null;
  description_ka: string | null;
  description_en: string | null;
  scheduled_time_offset_minutes: number | null;
  actual_time: string | null;
  duration_minutes: number;
  status: FeastToastStatus;
  assigned_toast_id: string | null;
  assigned_custom_toast_id: string | null;
  alaverdi_assigned_to: string | null;
  notes: string | null;
  created_at: string;
}

export interface FeastGuest {
  id: string;
  feast_id: string;
  name: string;
  role: GuestRole;
  seat_position: number | null;
  alaverdi_count: number;
  notes: string | null;
  created_at: string;
}

export interface FeastCollaborator {
  id: string;
  feast_id: string;
  user_id: string;
  role: CollaboratorRole;
  joined_at: string;
}

export interface AIGenerationLog {
  id: string;
  user_id: string;
  generation_type: string;
  input_params: Record<string, unknown>;
  output_text: string | null;
  model_used: string | null;
  tokens_used: number | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}
