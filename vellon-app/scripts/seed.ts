import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length > 0 && !key.startsWith("#")) {
      process.env[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  }
} catch {
  // .env.local not found — rely on already-exported env vars
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_USER = { email: "test@vellon.photos", password: "password123", name: "Test User", role: "user" as const };
const ADMIN_USER = { email: "admin@vellon.photos", password: "admin1234", name: "Admin User", role: "admin" as const };

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function cleanup() {
  console.log("  Cleaning up previous test data…");
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const targets = [TEST_USER.email, ADMIN_USER.email];
  const toDelete = existingUsers.users.filter((u) => targets.includes(u.email ?? ""));

  if (toDelete.length) {
    await supabase.from("photos").delete().neq("id", "0");
    await supabase.from("payment_proofs").delete().neq("id", "0");
    await supabase.from("events").delete().neq("id", "0");
    for (const u of toDelete) {
      await supabase.from("profiles").delete().eq("id", u.id);
      await supabase.auth.admin.deleteUser(u.id);
    }
    console.log(`    Removed ${toDelete.length} test user(s) and all data.`);
  }
}

async function createUserAccount(cfg: { email: string; password: string; name: string; role: "user" | "admin" }) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: cfg.email,
    password: cfg.password,
    email_confirm: true,
    user_metadata: { full_name: cfg.name },
  });
  if (error) {
    console.error(`Failed to create ${cfg.email}:`, error.message);
    return null;
  }

  await supabase.from("profiles").insert({
    id: data.user.id,
    email: cfg.email,
    name: cfg.name,
    role: cfg.role,
    onboarding_completed: true,
  });

  console.log(`    ${cfg.role.toUpperCase()}  | ${cfg.email} / ${cfg.password}`);
  return data.user.id;
}

async function createEvents(hostId: string) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const events = [
    {
      title: "Sarah's 18th Debut",
      description: "A magical night celebrating Sarah's coming of age. Share every moment!",
      status: "trial" as const,
      expires_at: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      photo_count: 2,
    },
    {
      title: "Marco's 30th Birthday Bash",
      description: "Surprise party for Marco! No spoilers in the captions 😉",
      status: "pending" as const,
      expires_at: new Date(now + 15 * day).toISOString(),
      photo_count: 0,
    },
    {
      title: "Wedding of Sarah & Marco",
      description: "The big day! From the ceremony to the last dance — every angle matters.",
      status: "active" as const,
      expires_at: new Date(now + 13 * day).toISOString(),
      photo_count: 5,
    },
    {
      title: "Company Year-End Party 2024",
      description: "Annual celebration with the whole team. Great memories!",
      status: "archived" as const,
      expires_at: new Date(now - 15 * day).toISOString(),
      photo_count: 12,
    },
  ];

  const eventIds: string[] = [];
  for (const evt of events) {
    const code = generateCode();
    const { data: inserted, error } = await supabase
      .from("events")
      .insert({
        event_code: code,
        title: evt.title,
        description: evt.description,
        host_id: hostId,
        status: evt.status,
        expires_at: evt.expires_at,
        photo_count: evt.photo_count,
        view_count: Math.floor(Math.random() * 50) + 5,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`Failed to create event "${evt.title}":`, error.message);
      continue;
    }
    eventIds.push(inserted.id);
    console.log(`    ${evt.status.toUpperCase().padStart(8)} | ${evt.title} (${code})`);
  }
  return eventIds;
}

async function seed() {
  console.log("🌱 Seeding database…\n");

  await cleanup();

  // ── Create Test User (regular) ──
  console.log("  Creating test user…");
  const testUserId = await createUserAccount(TEST_USER);

  // ── Create Admin User ──
  console.log("  Creating admin user…");
  const adminUserId = await createUserAccount(ADMIN_USER);

  if (!testUserId) {
    console.error("Failed to create test user. Aborting.");
    process.exit(1);
  }

  // ── Create events for test user ──
  console.log("  Creating events for test user…");
  const eventIds = await createEvents(testUserId);

  // ── Payment proof for pending event ──
  const pendingEventId = eventIds[1];
  if (pendingEventId) {
    await supabase.from("payment_proofs").insert({
      event_id: pendingEventId,
      ref_number: "GCASH123456",
      amount: 699,
      status: "pending",
      screenshot_path: `payment-proofs/${pendingEventId}/demo.png`,
      screenshot_url: "https://placehold.co/600x400/1F2937/FFFFFF?text=GCash+Receipt",
    });
    console.log("    Payment proof created for pending event.");
  }

  // ── Photos for active & archived events ──
  const photoEvents = [
    { eventId: eventIds[2], count: 5, names: ["Tita Lorna", "Kuya Boyet", "Ate Marie", "Cousin Jake", "Sarah"] },
    { eventId: eventIds[3], count: 3, names: ["Boss Anna", "Officemate Carlo", "HR Team"] },
  ];

  for (const pe of photoEvents) {
    if (!pe.eventId) continue;
    const inserts = [];
    for (let i = 0; i < pe.count; i++) {
      inserts.push({
        event_id: pe.eventId,
        storage_path: `demo/${pe.eventId}/photo-${i + 1}.jpg`,
        storage_url: `https://picsum.photos/seed/${pe.eventId}${i}/400/600`,
        uploader_name: pe.names[i] ?? "Guest",
        file_size: 1024 * 1024 * (1 + Math.random() * 3),
        mime_type: "image/jpeg",
      });
    }
    await supabase.from("photos").insert(inserts);
    console.log(`    ${pe.count} photos added to event ${pe.eventId.slice(0, 8)}…`);
  }

  console.log("\n✅ Done! Log in with one of:");
  console.log(`   Test User  | ${TEST_USER.email} / ${TEST_USER.password}`);
  console.log(`   Admin User | ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
