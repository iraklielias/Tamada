export interface GeneratedToast {
  title_ka: string;
  body_ka: string;
  title_en?: string;
  body_en?: string;
  metadata?: {
    toast_type?: string;
    region_style?: string;
    tone?: string;
    complexity?: string;
    generation_type?: string;
  };
  delivery_guidance?: {
    recommended_pace?: string;
    emotional_peak_location?: string;
    pause_suggestions?: string[];
    glass_raise_moment?: string;
    estimated_duration_minutes?: number;
  };
}
