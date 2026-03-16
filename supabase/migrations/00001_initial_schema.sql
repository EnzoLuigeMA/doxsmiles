-- =============================================================================
-- DOXSmiles - Gamified Loyalty Platform for DOX English School
-- Initial Schema Migration
-- =============================================================================

-- =============================================================================
-- 1. EXTENSIONS & SEQUENCES
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SEQUENCE IF NOT EXISTS dox_id_seq START 1;

-- =============================================================================
-- 2. TABLES
-- =============================================================================
-- Note: classes and users have a circular FK relationship.
-- We create both tables first WITHOUT the cross-references,
-- then ALTER TABLE to add the foreign keys.

-- -----------------------------------------------------------------------------
-- classes (created first WITHOUT teacher_id FK)
-- -----------------------------------------------------------------------------
CREATE TABLE public.classes (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    teacher_id  uuid,                          -- FK added after users table exists
    active      boolean     NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.classes IS 'School classes / turmas';

-- -----------------------------------------------------------------------------
-- users (extends auth.users, created WITHOUT class_id FK)
-- -----------------------------------------------------------------------------
CREATE TABLE public.users (
    id               uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    dox_id           text        UNIQUE NOT NULL,
    name             text        NOT NULL,
    email            text        UNIQUE NOT NULL,
    phone            text,
    role             text        NOT NULL DEFAULT 'student'
                                 CHECK (role IN ('student', 'teacher', 'admin')),
    level            text        NOT NULL DEFAULT 'bronze'
                                 CHECK (level IN ('bronze', 'prata', 'ouro', 'elite')),
    total_points     integer     NOT NULL DEFAULT 0,
    lifetime_points  integer     NOT NULL DEFAULT 0,
    streak_weeks     integer     NOT NULL DEFAULT 0,
    streak_last_date date,
    class_id         uuid,                     -- FK added below
    created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'Public profile for every authenticated user';

-- -----------------------------------------------------------------------------
-- Resolve circular FKs between users <-> classes
-- -----------------------------------------------------------------------------
ALTER TABLE public.classes
    ADD CONSTRAINT fk_classes_teacher
    FOREIGN KEY (teacher_id) REFERENCES public.users(id);

ALTER TABLE public.users
    ADD CONSTRAINT fk_users_class
    FOREIGN KEY (class_id) REFERENCES public.classes(id);

-- -----------------------------------------------------------------------------
-- point_rules
-- -----------------------------------------------------------------------------
CREATE TABLE public.point_rules (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    action_name text        NOT NULL,
    points      integer     NOT NULL,
    category    text        NOT NULL
                            CHECK (category IN ('classroom', 'financial', 'social', 'bonus')),
    icon        text,
    active      boolean     NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.point_rules IS 'Catalogue of actions that earn points';

-- -----------------------------------------------------------------------------
-- point_transactions (IMMUTABLE ledger - never UPDATE or DELETE)
-- -----------------------------------------------------------------------------
CREATE TABLE public.point_transactions (
    id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid          NOT NULL REFERENCES public.users(id),
    rule_id         uuid          REFERENCES public.point_rules(id),
    points_awarded  integer       NOT NULL,
    multiplier      numeric(3,2)  NOT NULL DEFAULT 1.00,
    bonus_points    integer       NOT NULL DEFAULT 0,
    awarded_by      uuid          REFERENCES public.users(id),
    note            text,
    created_at      timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.point_transactions IS 'Immutable ledger of every point award';

-- -----------------------------------------------------------------------------
-- products
-- -----------------------------------------------------------------------------
CREATE TABLE public.products (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name         text        NOT NULL,
    description  text,
    points_price integer     NOT NULL,
    category     text        NOT NULL
                             CHECK (category IN ('acessorios', 'vestuario', 'papelaria', 'premium', 'kits')),
    stock        integer     NOT NULL DEFAULT 0,   -- use -1 for unlimited
    image_url    text,
    active       boolean     NOT NULL DEFAULT true,
    created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Reward store catalogue';

-- -----------------------------------------------------------------------------
-- vouchers
-- -----------------------------------------------------------------------------
CREATE TABLE public.vouchers (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid        NOT NULL REFERENCES public.users(id),
    product_id    uuid        NOT NULL REFERENCES public.products(id),
    code          text        UNIQUE NOT NULL,
    points_spent  integer     NOT NULL,
    status        text        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'used', 'expired')),
    expires_at    timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
    used_at       timestamptz,
    validated_by  uuid        REFERENCES public.users(id),
    created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.vouchers IS 'Redeemed reward vouchers';

-- -----------------------------------------------------------------------------
-- notification_logs
-- -----------------------------------------------------------------------------
CREATE TABLE public.notification_logs (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid        REFERENCES public.users(id),
    channel    text        NOT NULL CHECK (channel IN ('email', 'whatsapp')),
    type       text        NOT NULL CHECK (type IN ('points', 'level_up', 'streak', 'voucher', 'voucher_expiring')),
    status     text        NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
    payload    jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notification_logs IS 'Audit log for all outbound notifications';

-- =============================================================================
-- 3. FUNCTIONS & TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- generate_dox_id() - auto-assign DOX-0001 style IDs on user creation
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_dox_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.dox_id := 'DOX-' || LPAD(nextval('dox_id_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_dox_id
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_dox_id();

-- -----------------------------------------------------------------------------
-- handle_new_user() - sync auth.users → public.users on signup
-- SECURITY DEFINER so it can write to public.users from the auth schema context.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- update_user_level() - recalculate level tier when lifetime_points changes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lifetime_points IS DISTINCT FROM OLD.lifetime_points THEN
        NEW.level := CASE
            WHEN NEW.lifetime_points >= 5000 THEN 'elite'
            WHEN NEW.lifetime_points >= 3000 THEN 'ouro'
            WHEN NEW.lifetime_points >= 1000 THEN 'prata'
            ELSE 'bronze'
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user_level
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_level();

-- -----------------------------------------------------------------------------
-- custom_access_token_hook() - inject user_role into JWT claims
-- Called by Supabase Auth as a custom access token hook.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
    claims  JSONB;
    user_role TEXT;
BEGIN
    claims := event->'claims';

    SELECT role INTO user_role
    FROM public.users
    WHERE id = (event->>'user_id')::uuid;

    claims := jsonb_set(claims, '{user_role}', to_jsonb(COALESCE(user_role, 'student')));

    event := jsonb_set(event, '{claims}', claims);
    RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute only to supabase_auth_admin (used by the auth hook system)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- =============================================================================
-- 4. ROW-LEVEL SECURITY
-- =============================================================================

-- Enable RLS on every table
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_rules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs  ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Helper: get_user_role() - returns the current user's role from public.users
-- SECURITY DEFINER so RLS policies can call it without recursion issues.
-- STABLE because it reads data but does not modify it.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================================================
-- users policies
-- =============================================================================

-- SELECT: own row, teachers see their class students, admins see all
CREATE POLICY users_select ON public.users
    FOR SELECT TO authenticated
    USING (
        auth.uid() = id
        OR (
            public.get_user_role() = 'teacher'
            AND EXISTS (
                SELECT 1 FROM public.classes c
                WHERE c.teacher_id = auth.uid()
                  AND c.id = users.class_id
            )
        )
        OR public.get_user_role() = 'admin'
    );

-- UPDATE: own row (limited columns) or admin (any column)
CREATE POLICY users_update_self ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY users_update_admin ON public.users
    FOR UPDATE TO authenticated
    USING (public.get_user_role() = 'admin')
    WITH CHECK (public.get_user_role() = 'admin');

-- DELETE: admin only
CREATE POLICY users_delete ON public.users
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- =============================================================================
-- classes policies
-- =============================================================================

CREATE POLICY classes_select ON public.classes
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY classes_insert ON public.classes
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY classes_update ON public.classes
    FOR UPDATE TO authenticated
    USING (public.get_user_role() = 'admin')
    WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY classes_delete ON public.classes
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- =============================================================================
-- point_rules policies
-- =============================================================================

CREATE POLICY point_rules_select ON public.point_rules
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY point_rules_insert ON public.point_rules
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY point_rules_update ON public.point_rules
    FOR UPDATE TO authenticated
    USING (public.get_user_role() = 'admin')
    WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY point_rules_delete ON public.point_rules
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- =============================================================================
-- point_transactions policies (IMMUTABLE - no UPDATE or DELETE policies)
-- =============================================================================

CREATE POLICY point_transactions_select ON public.point_transactions
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR awarded_by = auth.uid()
        OR public.get_user_role() = 'admin'
    );

CREATE POLICY point_transactions_insert ON public.point_transactions
    FOR INSERT TO authenticated
    WITH CHECK (
        public.get_user_role() IN ('teacher', 'admin')
    );

-- No UPDATE policy — transactions are immutable
-- No DELETE policy — transactions are immutable

-- =============================================================================
-- products policies
-- =============================================================================

CREATE POLICY products_select ON public.products
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY products_insert ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY products_update ON public.products
    FOR UPDATE TO authenticated
    USING (public.get_user_role() = 'admin')
    WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY products_delete ON public.products
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- =============================================================================
-- vouchers policies
-- =============================================================================

CREATE POLICY vouchers_select ON public.vouchers
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR public.get_user_role() = 'admin'
    );

CREATE POLICY vouchers_insert ON public.vouchers
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY vouchers_update ON public.vouchers
    FOR UPDATE TO authenticated
    USING (public.get_user_role() = 'admin')
    WITH CHECK (public.get_user_role() = 'admin');

-- No DELETE policy — vouchers are never deleted

-- =============================================================================
-- notification_logs policies
-- =============================================================================

CREATE POLICY notification_logs_select ON public.notification_logs
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR public.get_user_role() = 'admin'
    );

CREATE POLICY notification_logs_insert ON public.notification_logs
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() = 'admin');

-- =============================================================================
-- 5. INDEXES
-- =============================================================================

CREATE INDEX idx_users_role                    ON public.users(role);
CREATE INDEX idx_users_class_id                ON public.users(class_id);
CREATE INDEX idx_users_dox_id                  ON public.users(dox_id);
CREATE INDEX idx_users_level                   ON public.users(level);
CREATE INDEX idx_point_transactions_user_id    ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON public.point_transactions(created_at);
CREATE INDEX idx_point_transactions_awarded_by ON public.point_transactions(awarded_by);
CREATE INDEX idx_vouchers_user_id              ON public.vouchers(user_id);
CREATE INDEX idx_vouchers_code                 ON public.vouchers(code);
CREATE INDEX idx_vouchers_status               ON public.vouchers(status);
CREATE INDEX idx_notification_logs_user_id     ON public.notification_logs(user_id);

-- =============================================================================
-- 6. SEED DATA
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Point Rules (10 rules)
-- -----------------------------------------------------------------------------
INSERT INTO public.point_rules (action_name, points, category, icon) VALUES
    ('Presença na aula',               50,   'classroom',  '📋'),
    ('Pontualidade',                    30,   'classroom',  '⏰'),
    ('Participação ativa em aula',      60,   'classroom',  '🙋'),
    ('Action Time — Nota ≥ 7',         70,   'classroom',  '📝'),
    ('Action Time — Nota ≥ 9',         90,   'classroom',  '🌟'),
    ('Pagamento em dia',               200,  'financial',  '💳'),
    ('Engajamento nas redes sociais DOX', 40, 'social',    '📱'),
    ('Bônus Streak 4 semanas',         300,  'bonus',      '🔥'),
    ('Bônus Streak 8 semanas',         500,  'bonus',      '🔥'),
    ('Bônus Streak 12 semanas',        1000, 'bonus',      '💎');

-- -----------------------------------------------------------------------------
-- Products (8 products)
-- -----------------------------------------------------------------------------
INSERT INTO public.products (name, points_price, category, stock, description) VALUES
    ('Caneta Premium DOX',           300,  'papelaria',  50,  'Caneta exclusiva com logo DOX'),
    ('Copo DOX',                     800,  'acessorios', 30,  'Copo térmico DOX English'),
    ('Agenda DOX 2025',              1200, 'papelaria',  20,  'Agenda exclusiva DOX English'),
    ('Camiseta DOX',                 2500, 'vestuario',  15,  'Camiseta oficial DOX English'),
    ('Aula Particular (1h)',         1500, 'premium',    -1,  'Uma hora de aula particular'),
    ('1 Mês de EAD Grátis',         2000, 'premium',    -1,  'Acesso completo ao EAD por 1 mês'),
    ('Desconto 10% na Renovação',   3500, 'premium',    -1,  'Cupom de 10% de desconto na renovação'),
    ('Kit Completo DOX',             4500, 'kits',       10,  'Caneta + Copo + Agenda + Camiseta');
