-- =========================================================================
-- SHEBA SUPPORT PORTAL DATABASE SCHEMA - SUPABASE POSTGRESQL MIGRATION
-- =========================================================================

-- 1. Create table for Users
CREATE TABLE IF NOT EXISTS public.sheba_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    username TEXT,
    "employeeId" TEXT,
    department TEXT,
    password TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE
);

-- 2. Create table for Tickets
CREATE TABLE IF NOT EXISTS public.sheba_tickets (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT,
    status TEXT,
    "screenshotUrl" TEXT,
    "assignedTo" TEXT,
    "assignedBy" TEXT,
    "assignedDepartment" TEXT,
    "assignedRole" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create table for Comments
CREATE TABLE IF NOT EXISTS public.sheba_comments (
    id TEXT PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "commentText" TEXT NOT NULL,
    "isInternal" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create table for Audit Logs
CREATE TABLE IF NOT EXISTS public.sheba_audit_logs (
    id TEXT PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    action TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) for testing and development simplicity
ALTER TABLE public.sheba_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheba_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheba_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheba_audit_logs DISABLE ROW LEVEL SECURITY;

-- 5. Seed the default admin profile
INSERT INTO public.sheba_users (
    id, 
    name, 
    email, 
    role, 
    username, 
    "employeeId", 
    department, 
    password, 
    "isActive"
) VALUES (
    'emp1', 
    'Sasha', 
    'sashaown99@gmail.com', 
    'Admin access', 
    'sashaown', 
    'EMP-001', 
    'Corporate Admin', 
    'password', 
    true
) ON CONFLICT (id) DO NOTHING;
