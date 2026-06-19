import { supabase } from './supabase';
import {
  Mission, Role, WeeklyPlan, RoleGoal,
  DailyPlan, DailyPriority, EveningReflection, DashboardSummary
} from '../types';

// ── MISSION ──
export const getMission = async (userId: string): Promise<Mission | null> => {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
};

export const upsertMission = async (userId: string, text: string) => {
  const { data, error } = await supabase
    .from('missions')
    .upsert({ user_id: userId, text, updated_at: new Date().toISOString() })
    .select()
    .single();
  return { data, error };
};

// ── ROLES ──
export const getRoles = async (userId: string): Promise<Role[]> => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('order');
  if (error) return [];
  return data;
};

export const createRole = async (userId: string, name: string, emoji: string, order: number) => {
  const { data, error } = await supabase
    .from('roles')
    .insert({ user_id: userId, name, emoji, order, is_active: true })
    .select()
    .single();
  return { data, error };
};

// ── WEEKLY PLAN ──
export const getCurrentWeeklyPlan = async (userId: string): Promise<WeeklyPlan | null> => {
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();

  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
    .eq('year', year)
    .single();

  if (error) return null;
  return data;
};

export const createWeeklyPlan = async (
  userId: string,
  weekNumber: number,
  year: number,
  themeWord: string,
  theme: string,
  reviewWins: string,
  reviewLessons: string
) => {
  const { data, error } = await supabase
    .from('weekly_plans')
    .insert({
      user_id: userId, week_number: weekNumber, year,
      theme_word: themeWord, theme, review_wins: reviewWins,
      review_lessons: reviewLessons
    })
    .select()
    .single();
  return { data, error };
};

// ── ROLE GOALS ──
export const getRoleGoals = async (weeklyPlanId: string): Promise<RoleGoal[]> => {
  const { data, error } = await supabase
    .from('role_goals')
    .select('*')
    .eq('weekly_plan_id', weeklyPlanId);
  if (error) return [];
  return data;
};

export const upsertRoleGoal = async (
  weeklyPlanId: string,
  roleId: string,
  goal: string,
  goalSecondary: string
) => {
  const { data, error } = await supabase
    .from('role_goals')
    .upsert({
      weekly_plan_id: weeklyPlanId, role_id: roleId,
      goal, goal_secondary: goalSecondary,
      progress_pct: 0, status: 'not_started'
    })
    .select()
    .single();
  return { data, error };
};

// ── DAILY PLAN ──
export const getTodaysPlan = async (userId: string): Promise<DailyPlan | null> => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  if (error) return null;
  return data;
};

export const createDailyPlan = async (
  userId: string,
  checkIn: string,
  winStatement: string,
  obstacle: string,
  intentions: string[]
) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_plans')
    .insert({
      user_id: userId, date: today, check_in: checkIn,
      win_statement: winStatement, obstacle, intentions,
      completed_at: new Date().toISOString()
    })
    .select()
    .single();
  return { data, error };
};

// ── DAILY PRIORITIES ──
export const getTodaysPriorities = async (dailyPlanId: string): Promise<DailyPriority[]> => {
  const { data, error } = await supabase
    .from('daily_priorities')
    .select('*')
    .eq('daily_plan_id', dailyPlanId)
    .order('order');
  if (error) return [];
  return data;
};

export const upsertPriority = async (
  dailyPlanId: string,
  text: string,
  roleId: string,
  order: number
) => {
  const { data, error } = await supabase
    .from('daily_priorities')
    .insert({
      daily_plan_id: dailyPlanId, text, role_id: roleId,
      status: 'pending', carried_forward: false, order
    })
    .select()
    .single();
  return { data, error };
};

export const updatePriorityStatus = async (
  priorityId: string,
  status: DailyPriority['status']
) => {
  const { data, error } = await supabase
    .from('daily_priorities')
    .update({ status })
    .eq('id', priorityId)
    .select()
    .single();
  return { data, error };
};

// ── EVENING REFLECTION ──
export const saveReflection = async (reflection: Omit<EveningReflection, 'id'>) => {
  const { data, error } = await supabase
    .from('evening_reflections')
    .insert(reflection)
    .select()
    .single();
  return { data, error };
};

// ── STREAK ──
export const updateStreak = async (userId: string, type: 'daily' | 'weekly') => {
  const field = type === 'daily' ? 'streak_daily' : 'streak_weekly';
  const { data: user } = await supabase
    .from('users')
    .select('streak_daily, streak_weekly, streak_best')
    .eq('id', userId)
    .single();

  const current = (user as any)?.[field] || 0;
  const newStreak = current + 1;

  const updateData: Record<string, number> = { [field]: newStreak };
  if (type === 'daily' && newStreak > ((user as any)?.streak_best || 0)) {
    updateData.streak_best = newStreak;
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId);

  return { newStreak, error };
};

// ── DASHBOARD ──
export const getDashboardData = async (userId: string): Promise<DashboardSummary | null> => {
  try {
    const [userRes, missionRes, rolesRes, weeklyPlanRes, todayPlanRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      getMission(userId),
      getRoles(userId),
      getCurrentWeeklyPlan(userId),
      getTodaysPlan(userId)
    ]);

    if (userRes.error || !missionRes) return null;

    const roleGoals = weeklyPlanRes ? await getRoleGoals(weeklyPlanRes.id) : [];
    const todayPriorities = todayPlanRes ? await getTodaysPriorities(todayPlanRes.id) : [];

    const doneGoals = roleGoals.filter(g => g.status === 'complete').length;
    const weekProgressPct = roleGoals.length > 0
      ? Math.round((doneGoals / roleGoals.length) * 100) : 0;

    return {
      user: userRes.data,
      mission: missionRes,
      roles: rolesRes,
      currentWeekPlan: weeklyPlanRes,
      roleGoals,
      todayPlan: todayPlanRes,
      todayPriorities,
      streakDaily: userRes.data.streak_daily || 0,
      streakWeekly: userRes.data.streak_weekly || 0,
      weekProgressPct
    };
  } catch {
    return null;
  }
};

// ── ELI CONVERSATIONS ──
export const saveEliMessage = async (
  userId: string,
  role: 'user' | 'eli',
  content: string,
  sessionType: string
) => {
  const { error } = await supabase
    .from('eli_conversations')
    .insert({ user_id: userId, role, content, session_type: sessionType });
  return { error };
};

export const getRecentEliHistory = async (userId: string, limit = 12): Promise<{ role: string; content: string; session_type: string; created_at: string }[]> => {
  const { data, error } = await supabase
    .from('eli_conversations')
    .select('role, content, session_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data || []).reverse();
};

export const getYesterdaysPriorities = async (userId: string): Promise<DailyPriority[]> => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  const { data: plan } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .single();

  if (!plan) return [];

  const { data } = await supabase
    .from('daily_priorities')
    .select('*')
    .eq('daily_plan_id', plan.id)
    .order('order');

  return data || [];
};

// ── ADMIN ──
export const getAdminData = async () => {
  const [usersRes, earlyAccessRes, dailyPlansRes, weeklyPlansRes] = await Promise.all([
    supabase.from('users').select('id, email, plan, created_at, streak_daily, streak_weekly, streak_best, onboarding_done').order('created_at', { ascending: false }),
    supabase.from('early_access').select('email, created_at').order('created_at', { ascending: false }),
    supabase.from('daily_plans').select('user_id, created_at').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('weekly_plans').select('user_id, created_at').gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);

  return {
    users: usersRes.data || [],
    earlyAccess: earlyAccessRes.data || [],
    recentDailyPlans: dailyPlansRes.data || [],
    recentWeeklyPlans: weeklyPlansRes.data || [],
  };
};

// ── UTILS ──
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};
