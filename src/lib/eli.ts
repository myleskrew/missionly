import { EliMessage, User, Mission, Role, RoleGoal, DailyPriority } from '../types';

interface EliContext {
  user: User;
  mission: Mission;
  roles: Role[];
  roleGoals?: RoleGoal[];
  todayPriorities?: DailyPriority[];
  yesterdayPriorities?: DailyPriority[];
  sessionType: 'daily' | 'weekly' | 'reflection' | 'dashboard';
  conversationHistory: EliMessage[];
  pastConversations?: { role: string; content: string; session_type: string; created_at: string }[];
}

const buildSystemPrompt = (ctx: EliContext): string => {
  const roleList = ctx.roles.map(r => `${r.emoji} ${r.name}`).join(', ');

  const goalsSection = ctx.roleGoals && ctx.roleGoals.length > 0
    ? `\nThis week's role goals:\n${ctx.roleGoals.map(g =>
        `- ${g.roleId}: "${g.goal}" (${g.status}, ${g.progressPct}% complete)`
      ).join('\n')}`
    : '\nNo weekly goals set yet this week.';

  const prioritiesSection = ctx.todayPriorities && ctx.todayPriorities.length > 0
    ? `\nToday's priorities:\n${ctx.todayPriorities.map(p =>
        `- "${p.text}" [${p.roleId}] — ${p.status}`
      ).join('\n')}`
    : '';

  const yesterdaySection = ctx.yesterdayPriorities && ctx.yesterdayPriorities.length > 0
    ? (() => {
        const done = ctx.yesterdayPriorities.filter(p => p.status === 'done');
        const missed = ctx.yesterdayPriorities.filter(p => p.status !== 'done');
        return `\nYesterday's results: ${done.length}/${ctx.yesterdayPriorities.length} completed.${
          missed.length > 0 ? `\nMissed: ${missed.map(p => `"${p.text}"`).join(', ')}` : ''
        }`;
      })()
    : '';

  // Find roles that haven't appeared in priorities lately
  const neglectedRoles = ctx.roles.filter(role => {
    const recentPriorities = [
      ...(ctx.todayPriorities || []),
      ...(ctx.yesterdayPriorities || [])
    ];
    return !recentPriorities.some(p => p.roleId === role.id);
  });
  const neglectedSection = neglectedRoles.length > 0 && neglectedRoles.length < ctx.roles.length
    ? `\nRoles with no recent activity: ${neglectedRoles.map(r => `${r.emoji} ${r.name}`).join(', ')} — worth mentioning if relevant.`
    : '';

  const memorySection = ctx.pastConversations && ctx.pastConversations.length > 0
    ? `\nRECENT CONVERSATION HISTORY (from past sessions — use this to remember what they've shared with you):\n${
        ctx.pastConversations.map(m =>
          `[${new Date(m.created_at).toLocaleDateString()} - ${m.session_type}] ${m.role === 'eli' ? 'Eli' : ctx.user.name}: ${m.content}`
        ).join('\n')
      }`
    : '';

  return `You are Eli, a personal life coach inside Missionly — an app built around intentional daily and weekly planning inspired by Stephen Covey's 7 Habits.

You are NOT a generic assistant. You are a focused, direct, warm coach who knows this specific person deeply and remembers what they've told you before.

WHO YOU'RE COACHING:
- Name: ${ctx.user.name}
- Daily planning streak: ${ctx.user.streakDaily} days
- Weekly planning streak: ${ctx.user.streakWeekly} weeks
- Plan: ${ctx.user.plan}

THEIR MISSION STATEMENT:
"${ctx.mission?.text || 'Not yet written'}"

THEIR LIFE ROLES:
${roleList}
${goalsSection}
${prioritiesSection}
${yesterdaySection}
${neglectedSection}
${memorySection}

YOUR COACHING STYLE:
- Direct but warm. You call things out without being harsh.
- Always connect advice back to their specific mission and roles. Never give generic productivity advice.
- Ask one pointed question at a time. Never stack multiple questions.
- Keep responses short: 2-4 sentences max unless they explicitly ask for more.
- Reference things they've told you before — that's what makes you feel real, not like a chatbot.
- You care about ALL their life roles equally. If a personal role (spouse, parent, health) keeps getting skipped, you say something.
- You're not a cheerleader. You're a coach. Real coaches tell the truth.
- When someone is stuck, help them get specific — vague goals get vague results.
- When someone is overwhelmed, help them pick ONE thing, not five.
- When someone is avoiding something, name it gently.

CURRENT SESSION: ${ctx.sessionType}

NEVER:
- Give generic productivity tips not connected to their mission or roles
- Ask more than one question at a time
- Say "Great question!", "Absolutely!", or any sycophantic opener
- Write bullet points, headers, or markdown — plain conversational text only
- Give advice longer than 4 sentences unless asked
- Pretend you don't remember previous conversations — you do, use them`;
};

export const sendEliMessage = async (
  userMessage: string,
  ctx: EliContext
): Promise<string> => {
  const systemPrompt = buildSystemPrompt(ctx);

  const messages = ctx.conversationHistory.map(msg => ({
    role: msg.role === 'eli' ? 'assistant' : 'user' as 'assistant' | 'user',
    content: msg.content
  }));

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

export const getEliOpener = (
  sessionType: 'daily' | 'weekly' | 'reflection' | 'dashboard',
  ctx: Partial<EliContext>
): string => {
  const name = ctx.user?.name?.split(' ')[0] || 'there';
  const streakDaily = ctx.user?.streakDaily || 0;

  const yesterday = ctx.yesterdayPriorities || [];
  const donePct = yesterday.length > 0
    ? Math.round((yesterday.filter(p => p.status === 'done').length / yesterday.length) * 100)
    : null;

  const missedYesterday = yesterday.filter(p => p.status !== 'done');

  if (sessionType === 'daily') {
    if (donePct === 100) {
      return `${name}. Clean sweep yesterday — ${yesterday.length} for ${yesterday.length}. What are you building on that momentum today?`;
    }
    if (donePct !== null && donePct < 60 && missedYesterday.length > 0) {
      return `${name}. Yesterday you left "${missedYesterday[0].text}" unfinished. Is that carrying forward today, or are you letting it go?`;
    }
    if (donePct !== null) {
      return `${name}. ${donePct}% yesterday. Day ${streakDaily + 1} — what's the one thing that absolutely has to happen today?`;
    }
    return `${name}. Day ${streakDaily + 1} starts now. What's the one thing that absolutely has to happen today?`;
  }

  if (sessionType === 'weekly') {
    return `${name}. Before we plan the week ahead — how honest are you willing to be about last week?`;
  }

  if (sessionType === 'reflection') {
    if (donePct !== null) {
      return `${name}. ${donePct}% on your priorities today. Before you close out — what's the real story behind that number?`;
    }
    return `${name}. Day ${streakDaily} is almost done. Before you close it out — how are you actually feeling right now?`;
  }

  // dashboard
  if (streakDaily > 0) {
    return `${name}. ${streakDaily}-day streak. Your mission is still true today. What do you need from me?`;
  }
  return `${name}. Your mission is still true today. What do you need from me?`;
};
