import { EliMessage, User, Mission, Role, RoleGoal, DailyPriority } from '../types';

interface EliContext {
  user: User;
  mission: Mission;
  roles: Role[];
  roleGoals?: RoleGoal[];
  todayPriorities?: DailyPriority[];
  sessionType: 'daily' | 'weekly' | 'reflection' | 'dashboard';
  conversationHistory: EliMessage[];
}

// Build Eli's system prompt from the user's actual data
const buildSystemPrompt = (ctx: EliContext): string => {
  const roleList = ctx.roles.map(r => `${r.emoji} ${r.name}`).join(', ');

  const goalsSection = ctx.roleGoals && ctx.roleGoals.length > 0
    ? `\nThis week's role goals:\n${ctx.roleGoals.map(g =>
        `- ${g.roleId}: "${g.goal}" (${g.status}, ${g.progressPct}% complete)`
      ).join('\n')}`
    : '';

  const prioritiesSection = ctx.todayPriorities && ctx.todayPriorities.length > 0
    ? `\nToday's priorities:\n${ctx.todayPriorities.map(p =>
        `- "${p.text}" [${p.roleId}] — ${p.status}`
      ).join('\n')}`
    : '';

  return `You are Eli, a personal planning coach inside Missionly — an app built around intentional daily and weekly planning.

You are NOT a generic assistant. You are a focused, direct, warm coach who knows this specific person deeply.

WHO YOU'RE COACHING:
- Name: ${ctx.user.name}
- Daily planning streak: ${ctx.user.streakDaily} days
- Weekly planning streak: ${ctx.user.streakWeekly} weeks
- Plan: ${ctx.user.plan}

THEIR MISSION STATEMENT:
"${ctx.mission.text}"

THEIR LIFE ROLES:
${roleList}
${goalsSection}
${prioritiesSection}

YOUR COACHING STYLE:
- Direct but warm. You call things out without being harsh.
- Always connect advice back to their mission and roles — never give generic productivity advice.
- Ask one pointed question at a time. Don't overwhelm with multiple questions.
- Short responses. 2-4 sentences max unless they ask for more.
- You remember what they've told you in this conversation. Reference it.
- You care about ALL their roles, not just the professional one. If a personal role keeps getting neglected, you say something.
- You're not a cheerleader. You're a coach. Real coaches tell the truth.

CURRENT SESSION: ${ctx.sessionType}

NEVER:
- Give generic productivity tips that don't reference their specific mission or roles
- Ask more than one question at a time
- Be sycophantic ("Great question!", "Absolutely!")
- Give advice longer than 4 sentences unless asked
- Forget that you know their mission statement and roles

Respond in plain text only. No markdown, no bullet points, no headers.`;
};

// Send a message to Eli
export const sendEliMessage = async (
  userMessage: string,
  ctx: EliContext
): Promise<string> => {
  const systemPrompt = buildSystemPrompt(ctx);

  // Build conversation history for the API
  const messages = ctx.conversationHistory.map(msg => ({
    role: msg.role === 'eli' ? 'assistant' : 'user' as 'assistant' | 'user',
    content: msg.content
  }));

  // Add the new user message
  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch('/api/eli', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, messages })
    });

    if (!response.ok) throw new Error('Eli API error');

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Eli error:', error);
    return "I'm having trouble connecting right now. Try again in a moment.";
  }
};

// Get Eli's opening message for each session type
export const getEliOpener = (
  sessionType: 'daily' | 'weekly' | 'reflection' | 'dashboard',
  ctx: Partial<EliContext>
): string => {
  const name = ctx.user?.name || 'there';
  const streakDaily = ctx.user?.streakDaily || 0;

  const openers: Record<string, string> = {
    daily: `Good morning, ${name}. Day ${streakDaily + 1} starts now. What's the one thing that absolutely has to happen today?`,
    weekly: `Good Sunday, ${name}. Before we plan the week ahead — how honest are you willing to be about last week?`,
    reflection: `Good evening, ${name}. Day ${streakDaily} is almost done. Before you close it out — how are you actually feeling right now?`,
    dashboard: `${name}. Your mission is still true today. What do you need from me right now?`
  };

  return openers[sessionType] || openers.dashboard;
};
