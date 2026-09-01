// js/supabase-client.js
// One place for Supabase setup. Loaded AFTER the Supabase CDN script
// and BEFORE js/main.js on every page.

const SUPABASE_URL = 'https://gquafwxbnjhkyeuucrdw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_q00RpZDxl0kxEl1f1aW7Yw_Dzp2Deg8';

// The one admin account you create in:
// Supabase Dashboard → Authentication → Users → Add user
// The site's login box only ever asks for a password — this email is
// paired with it behind the scenes. Change this to whatever email you
// use when you create that user.
const ADMIN_EMAIL = 'admin@reiportfolio.com';

const STORAGE_BUCKET = 'site-media';

// `sb` is the global Supabase client used everywhere else in the site.
// Guarded so the rest of the site still works (read-only, from the
// fallback data in js/data.js) if the CDN script fails to load.
let sb = null;
if (typeof window.supabase !== 'undefined') {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('Supabase SDK did not load — running with local fallback data only, and admin login is disabled.');
}

// True once we've confirmed there's a logged-in admin session.
let sbIsAdmin = false;

/**
 * Uploads a File to Supabase Storage and returns its public URL.
 * `folder` groups files inside the bucket (e.g. "projects", "photography").
 */
async function sbUploadFile(file, folder) {
  if (!sb) throw new Error('Supabase not configured.');
  const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${folder}/${Date.now()}_${cleanName}`;
  const { error } = await sb.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;
  const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
