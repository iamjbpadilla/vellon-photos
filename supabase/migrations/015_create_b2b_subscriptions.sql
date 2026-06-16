-- B2B Subscriptions Table
-- Stores subscription information for B2B users

CREATE TABLE IF NOT EXISTS b2b_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('studio_suite', 'studio_pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_b2b_subscriptions_user_id ON b2b_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_b2b_subscriptions_status ON b2b_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_b2b_subscriptions_stripe_sub_id ON b2b_subscriptions(stripe_subscription_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_b2b_subscriptions_updated_at
  BEFORE UPDATE ON b2b_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- B2B Subscription Add-ons Table
-- Stores add-on subscriptions (CNAME, white-label, etc.)

CREATE TABLE IF NOT EXISTS b2b_subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES b2b_subscriptions(id) ON DELETE CASCADE,
  addon_type TEXT NOT NULL CHECK (addon_type IN ('custom_domain', 'white_label', 'priority_support', 'extra_storage')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled')),
  monthly_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_subscription_addons_subscription_id ON b2b_subscription_addons(subscription_id);
CREATE INDEX IF NOT EXISTS idx_b2b_subscription_addons_type ON b2b_subscription_addons(addon_type);

CREATE TRIGGER update_b2b_subscription_addons_updated_at
  BEFORE UPDATE ON b2b_subscription_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- B2B Manual Payments Table
-- Stores manual GCash/Maya payments for B2B subscriptions

CREATE TABLE IF NOT EXISTS b2b_manual_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES b2b_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('gcash', 'maya', 'bank_transfer')),
  reference_number TEXT NOT NULL UNIQUE,
  receipt_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_manual_payments_user_id ON b2b_manual_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_b2b_manual_payments_status ON b2b_manual_payments(status);
CREATE INDEX IF NOT EXISTS idx_b2b_manual_payments_reference ON b2b_manual_payments(reference_number);

-- RLS Policies

ALTER TABLE b2b_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON b2b_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON b2b_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Service role can manage subscriptions"
  ON b2b_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE b2b_subscription_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription add-ons"
  ON b2b_subscription_addons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM b2b_subscriptions
      WHERE b2b_subscriptions.id = b2b_subscription_addons.subscription_id
      AND b2b_subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all add-ons"
  ON b2b_subscription_addons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Service role can manage add-ons"
  ON b2b_subscription_addons FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE b2b_manual_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own manual payments"
  ON b2b_manual_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all manual payments"
  ON b2b_manual_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update manual payments"
  ON b2b_manual_payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Service role can manage manual payments"
  ON b2b_manual_payments FOR ALL
  USING (auth.role() = 'service_role');
