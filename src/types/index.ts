// ── USER ──
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  createdAt: string;
  streakDaily: number;
  streakWeekly: number;
  streakBest: number;
}

// ── MISSION ──
export interface Mission {
  id: string;
  userId: string;
  text: string;
  updatedAt: string;
}

// ── ROLES ──
export interface Role {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  order: number;
  isActive: boolean;
}

// ── WEEKLY PLAN ──
export interface WeeklyPlan {
  id: string;
  userId: string;
  weekNumber: number;
  year: number;
  theme: string;
  themeWord: string;
  reviewWins: string;
  reviewLessons: string;
  completedAt: string | null;
  createdAt: string;
}

// ── ROLE GOAL (within a weekly plan) ──
export interface RoleGoal {
  id: string;
  weeklyPlanId: string;
  roleId: string;
  goal: string;
  goalSecondary: string;
  progressPct: number;
  status: 'not_started' | 'in_progress' | 'complete' | 'missed';
}

// ── DAILY PLAN ──
export interface DailyPlan {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  winStatement: string;
  obstacle: string;
  intentions: string[];
  completedAt: string | null;
  createdAt: string;
}

// ── DAILY PRIORITY ──
export interface DailyPriority {
  id: string;
  dailyPlanId: string;
  text: string;
  roleId: string;
  status: 'pending' | 'done' | 'partial' | 'missed';
  carriedForward: boolean;
  order: number;
}

// ── EVENING REFLECTION ──
export interface EveningReflection {
  id: string;
  userId: string;
  date: string;
  dayWord: string;
  scoreOverall: number;
  scorePresence: number;
  scoreHardThings: number;
  wouldDodifferently: string;
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  letGo: string;
  tomorrowNotes: string;
  completedAt: string;
}

// ── ELI MESSAGE ──
export interface EliMessage {
  id: string;
  role: 'eli' | 'user';
  content: string;
  timestamp: string;
  context?: 'daily' | 'weekly' | 'reflection' | 'dashboard';
}

// ── DASHBOARD SUMMARY ──
export interface DashboardSummary {
  user: User;
  mission: Mission;
  roles: Role[];
  currentWeekPlan: WeeklyPlan | null;
  roleGoals: RoleGoal[];
  todayPlan: DailyPlan | null;
  todayPriorities: DailyPriority[];
  streakDaily: number;
  streakWeekly: number;
  weekProgressPct: number;
}

// ── ONBOARDING STATE ──
export interface OnboardingState {
  step: number;
  name: string;
  email: string;
  password: string;
  missionAnswers: {
    q1: string;
    q2: string;
    q3: string;
  };
  missionFinal: string;
  selectedRoles: string[];
  customRoles: string[];
  wakeTime: string;
  morningPlanEnabled: boolean;
  eveningReflectionEnabled: boolean;
  weeklyReminderEnabled: boolean;
  eliCheckInsEnabled: boolean;
}
