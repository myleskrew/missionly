-- ============================================
-- MISSIONLY DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ──
CREATE TABLE users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  name            TEXT NOT NULL,
  plan            TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT,
  streak_daily    INTEGER NOT NULL DEFAULT 0,
  streak_weekly   INTEGER NOT NULL DEFAULT 0,
  streak_best     INTEGER NOT NULL DEFAULT 0,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── MISSIONS ──
CREATE TABLE missions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ── ROLES ──
CREATE TABLE roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  emoji      TEXT NOT NULL DEFAULT '◎',
  "order"    INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── WEEKLY PLANS ──
CREATE TABLE weekly_plans (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number      INTEGER NOT NULL,
  year             INTEGER NOT NULL,
  theme_word       TEXT,
  theme            TEXT,
  review_wins      TEXT,
  review_lessons   TEXT,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_number, year)
);

-- ── ROLE GOALS ──
CREATE TABLE role_goals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weekly_plan_id   UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  role_id          UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  goal             TEXT NOT NULL,
  goal_secondary   TEXT,
  progress_pct     INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'not_started'
                   CHECK (status IN ('not_started','in_progress','complete','missed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(weekly_plan_id, role_id)
);

-- ── DAILY PLANS ──
CREATE TABLE daily_plans (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  check_in       TEXT,
  win_statement  TEXT,
  obstacle       TEXT,
  intentions     TEXT[] DEFAULT '{}',
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ── DAILY PRIORITIES ──
CREATE TABLE daily_priorities (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_plan_id    UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  text             TEXT NOT NULL,
  role_id          UUID REFERENCES roles(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','done','partial','missed')),
  carried_forward  BOOLEAN NOT NULL DEFAULT false,
  "order"          INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── EVENING REFLECTIONS ──
CREATE TABLE evening_reflections (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,
  day_word              TEXT,
  score_overall         INTEGER CHECK (score_overall BETWEEN 1 AND 5),
  score_presence        INTEGER CHECK (score_presence BETWEEN 1 AND 5),
  score_hard_things     INTEGER CHECK (score_hard_things BETWEEN 1 AND 5),
  would_do_differently  TEXT,
  gratitude_1           TEXT,
  gratitude_2           TEXT,
  gratitude_3           TEXT,
  let_go                TEXT,
  tomorrow_notes        TEXT,
  completed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ── ELI CONVERSATION LOG ──
CREATE TABLE eli_messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('eli', 'user')),
  content      TEXT NOT NULL,
  context      TEXT CHECK (context IN ('daily','weekly','reflection','dashboard')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── STRIPE SUBSCRIPTIONS ──
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id       TEXT NOT NULL,
  status                TEXT NOT NULL,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_goals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_priorities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE evening_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE eli_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions      ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own data
CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "missions_own" ON missions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "roles_own" ON roles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "weekly_plans_own" ON weekly_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "daily_plans_own" ON daily_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "evening_reflections_own" ON evening_reflections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "eli_messages_own" ON eli_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_own" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- Role goals accessible through weekly plan ownership
CREATE POLICY "role_goals_own" ON role_goals FOR ALL
  USING (EXISTS (
    SELECT 1 FROM weekly_plans wp
    WHERE wp.id = weekly_plan_id AND wp.user_id = auth.uid()
  ));

-- Daily priorities accessible through daily plan ownership
CREATE POLICY "daily_priorities_own" ON daily_priorities FOR ALL
  USING (EXISTS (
    SELECT 1 FROM daily_plans dp
    WHERE dp.id = daily_plan_id AND dp.user_id = auth.uid()
  ));

-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
