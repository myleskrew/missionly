# Missionly

> Live with purpose, every day.

A daily + weekly planning app built around life roles, mission statements, and an AI coach named Eli.

---

## Tech Stack

- **Frontend**: React + TypeScript → Vercel
- **Backend/DB**: Supabase (Auth + PostgreSQL)
- **AI**: Anthropic Claude API (Eli coach)
- **Payments**: Stripe
- **Domain**: trymissionly.com

---

## Project Structure

```
src/
  components/
    ui/          # Reusable UI primitives (Button, Input, Card...)
    layout/      # Sidebar, TopNav, SessionNav
    eli/         # EliPanel chat component
  pages/
    LandingPage.tsx
    SignInPage.tsx
    OnboardingPage.tsx
    DashboardPage.tsx
    DailyPlanPage.tsx
    WeeklyPlanPage.tsx
    ReflectionPage.tsx
  hooks/
    useAuth.tsx  # Auth context
    useEli.ts    # Eli chat state
  lib/
    supabase.ts  # Supabase client + auth helpers
    db.ts        # All database queries
    eli.ts       # Eli system prompt + API calls
  types/
    index.ts     # All TypeScript interfaces
  styles/
    globals.css  # CSS variables + base styles
```

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/myleskrew/missionly
cd missionly
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase-schema.sql`
3. Enable Google OAuth in Authentication → Providers
4. Copy your project URL and anon key

### 3. Environment variables

```bash
cp .env.example .env.local
# Fill in all values
```

### 4. Set up Stripe

1. Create a product "Missionly Pro" at [stripe.com](https://stripe.com)
2. Add monthly price ($9/mo) and yearly price ($79/yr)
3. Copy the price IDs into `.env.local`
4. Set up webhook for `customer.subscription.updated` and `customer.subscription.deleted`

### 5. Run locally

```bash
npm start
```

---

## Deployment

Push to GitHub → Vercel auto-deploys on every push to `main`.

Add all env variables in Vercel project settings under Environment Variables.

Connect `trymissionly.com` in Vercel → Settings → Domains.

---

## Build Order

- [x] Landing page (HTML)
- [x] Onboarding flow (HTML)
- [x] Dashboard (HTML)
- [x] Daily planning session (HTML)
- [x] Weekly planning session (HTML)
- [x] Evening reflection (HTML)
- [x] React app scaffold
- [x] Types + DB schema
- [x] Supabase auth
- [x] Eli agent lib
- [ ] Convert pages to React
- [ ] Wire up Supabase queries
- [ ] Stripe integration
- [ ] Deploy to trymissionly.com

---

## Pricing

| Plan | Price | Features |
|------|-------|---------|
| Free | $0/forever | Mission builder, roles, weekly planning, current week only |
| Pro | $9/mo or $79/yr | Everything + daily plan, evening reflection, Eli AI coach, full history, streaks |
