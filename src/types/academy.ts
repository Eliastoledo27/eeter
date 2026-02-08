
export type AcademyCourse = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  modules?: AcademyModule[];
  progress?: number; // Calculated percentage
};

export type AcademyModule = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order: number;
  lessons?: AcademyLesson[];
};

export type AcademyLesson = {
  id: string;
  module_id: string | null;
  title: string;
  type: 'video' | 'pdf' | 'audio';
  url: string;
  description: string | null;
  is_vip: boolean;
  thumbnail_url: string | null;
  order: number;
  xp_reward: number;
  duration_minutes: number | null;
  is_preview: boolean;
  completed?: boolean; // For UI state
};

export type UserProgress = {
  user_id: string;
  content_id: string;
  completed_at: string;
};

export type GamificationLevel = {
  level: number;
  xp_required: number;
  title: string;
  icon_url: string | null;
};
