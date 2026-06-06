import { createClient } from '@supabase/supabase-js';

const cleanEnvVar = (val: any): string => {
  if (!val || typeof val !== 'string') return '';
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
};

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

const cleanedUrl = cleanEnvVar(rawUrl);
const cleanedKey = cleanEnvVar(rawKey);

const isUrlValid = (url: string) => url.startsWith('http://') || url.startsWith('https://');
const isKeyValid = (key: string) => key.startsWith('eyJ') && key.length > 50;

const SUPABASE_URL = isUrlValid(cleanedUrl) ? cleanedUrl : 'https://qcsyjckhaqvtsgvsemnr.supabase.co';
const SUPABASE_ANON_KEY = isKeyValid(cleanedKey) ? cleanedKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjc3lqY2toYXF2dHNndnNlbW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MTQ1MjcsImV4cCI6MjA5NjI5MDUyN30.8wvhhmNDHvIwv9Dccf0prSJH2ZZsXA7v1grQmwtr9wI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper constant for SQL generation so the user can easily copy and paste into Supabase
export const SUPABASE_SQL_SETUP = `-- Supabase SQL DDL and Seed Data definition for the IT support ticketing system
-- Run this in your Supabase SQL Editor to build the necessary tables and populate real starter records.

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Agent',
  username TEXT,
  employee_id TEXT,
  department TEXT,
  password TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS and insert some policies for public access (Simplified for client side ease of use)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select of users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert of users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of users" ON public.users FOR DELETE USING (true);

-- 2. Create Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  screenshot_url TEXT,
  assigned_to TEXT,
  assigned_by TEXT,
  assigned_department TEXT,
  assigned_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select of tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert of tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of tickets" ON public.tickets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of tickets" ON public.tickets FOR DELETE USING (true);

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select of comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert of comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of comments" ON public.comments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of comments" ON public.comments FOR DELETE USING (true);

-- 4. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select of audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert of audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of audit_logs" ON public.audit_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of audit_logs" ON public.audit_logs FOR DELETE USING (true);

-- 5. Insert Initial Seed / Sample Data
-- Clear any existing rows in tables to prevent duplicate key violations on re-runs
DELETE FROM public.audit_logs;
DELETE FROM public.comments;
DELETE FROM public.tickets;
DELETE FROM public.users;

-- Seed Users (Pre-built with correct profiles including Admin, Supervisor, and live Agent)
INSERT INTO public.users (id, name, email, role, username, employee_id, department, password, avatar_url, is_active)
VALUES 
('emp1', 'Sasha', 'sashaown99@gmail.com', 'Super Admin', 'sashaown', 'EMP-001', 'Corporate Admin', 'password', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', true);
`;
