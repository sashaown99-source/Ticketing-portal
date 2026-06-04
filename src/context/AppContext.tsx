"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Ticket, Comment, AuditLog, TicketCategory, TicketPriority, TicketStatus, Role } from '../types';
import { DUMMY_USERS, DUMMY_TICKETS, DUMMY_COMMENTS, DUMMY_AUDIT_LOGS } from '../data/dummyData';
import { supabase } from '../lib/supabaseClient';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  tickets: Ticket[];
  comments: Comment[];
  auditLogs: AuditLog[];
  setCurrentUser: (user: User | null) => void;
  registerUser: (
    name: string,
    email: string,
    role: Role,
    username?: string,
    employeeId?: string,
    department?: string,
    password?: string
  ) => Promise<User>;
  updateUser: (
    id: string,
    name: string,
    email: string,
    role: Role,
    username?: string,
    employeeId?: string,
    department?: string,
    password?: string,
    isActive?: boolean
  ) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addTicket: (
    subject: string,
    description: string,
    category: TicketCategory,
    priority: TicketPriority,
    screenshotUrl?: string,
    assignedBy?: string,
    assignedDepartment?: 'IT' | 'Admin' | 'HR' | 'Finance' | 'Manager',
    assignedRole?: Role
  ) => void;
  addComment: (ticketId: string, commentText: string, isInternal: boolean) => void;
  updateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  assignTicket: (ticketId: string, assignedToName: string) => void;
  resetState: () => void;
  importDatabaseState: (data: { users: User[]; tickets: Ticket[]; comments: Comment[]; auditLogs: AuditLog[] }) => void;
  addUserToLocalState: (user: User) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// One-time migration to clean up legacy data structures safely at the module level
if (typeof window !== 'undefined') {
  const migrated = localStorage.getItem('it_migration_v2');
  if (!migrated) {
    localStorage.removeItem('it_current_user');
    localStorage.removeItem('it_users');
    localStorage.removeItem('it_tickets');
    localStorage.removeItem('it_comments');
    localStorage.removeItem('it_audit_logs');
    localStorage.setItem('it_migration_v2', 'done');
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [tickets, setTickets] = useState<Ticket[]>(DUMMY_TICKETS);
  const [comments, setComments] = useState<Comment[]>(DUMMY_COMMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DUMMY_AUDIT_LOGS);

  const fetchDataFromSupabase = async () => {
    try {
      const { data: dbUsers, error: uErr } = await supabase.from('sheba_users').select('*');
      if (uErr) throw uErr;

      const { data: dbTickets, error: tErr } = await supabase.from('sheba_tickets').select('*').order('createdAt', { ascending: false });
      if (tErr) throw tErr;

      const { data: dbComments, error: cErr } = await supabase.from('sheba_comments').select('*').order('createdAt', { ascending: true });
      if (cErr) throw cErr;

      const { data: dbAudit, error: aErr } = await supabase.from('sheba_audit_logs').select('*').order('createdAt', { ascending: false });
      if (aErr) throw aErr;

      setUsers(dbUsers || []);
      setTickets(dbTickets || []);
      setComments(dbComments || []);
      setAuditLogs(dbAudit || []);
      console.log('Successfully synchronized state with Supabase PostgreSQL tables.');
    } catch (err: any) {
      console.warn('Supabase fetch failed:', err.message);
    }
  };

  useEffect(() => {
    // 1. Initial check of session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthSession(session);
    });

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      handleAuthSession(session);
    });

    async function handleAuthSession(session: any) {
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('sheba_users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!error && profile) {
          setCurrentUser(profile);
        } else {
          const fallbackProfile: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email?.split('@')[0] || 'Auth User',
            role: 'agent',
            isActive: true
          };
          setCurrentUser(fallbackProfile);
        }
        fetchDataFromSupabase();
      } else {
        setCurrentUser(null);
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('it_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('it_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('it_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('it_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('it_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const registerUser = async (
    name: string,
    email: string,
    role: Role,
    username?: string,
    employeeId?: string,
    department?: string,
    password?: string
  ) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role, username, employeeId, department, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register user');
    
    await fetchDataFromSupabase();
    return data as User;
  };

  const updateUser = async (
    id: string,
    name: string,
    email: string,
    role: Role,
    username?: string,
    employeeId?: string,
    department?: string,
    password?: string,
    isActive?: boolean
  ) => {
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, email, role, username, employeeId, department, password, isActive })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user');

    await fetchDataFromSupabase();
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(`/api/users?id=${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');

    await fetchDataFromSupabase();
  };

  const addTicket = (
    subject: string,
    description: string,
    category: TicketCategory,
    priority: TicketPriority,
    screenshotUrl?: string,
    assignedBy?: string,
    assignedDepartment?: 'IT' | 'Admin' | 'HR' | 'Finance' | 'Manager',
    assignedRole?: Role
  ) => {
    if (!currentUser) return;
    const newId = `TCK-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(3, '0')}`;
    const newTicket: Ticket = {
      id: newId,
      userId: currentUser.id,
      userName: currentUser.name,
      subject,
      description,
      category,
      priority,
      status: 'Open',
      screenshotUrl,
      assignedBy,
      assignedDepartment,
      assignedRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      ticketId: newId,
      action: `Created ticket assigned to role: ${assignedRole || 'Unassigned'}`,
      performedBy: currentUser.name,
      createdAt: new Date().toISOString()
    };

    // Send to Supabase directly
    supabase.from('sheba_tickets').insert(newTicket).then(({ error }) => {
      if (error) {
        console.error('Supabase error during addTicket (ticket):', error);
      } else {
        supabase.from('sheba_audit_logs').insert(newLog).then(({ error }) => {
          if (error) console.error('Supabase error during addTicket (audit):', error);
          fetchDataFromSupabase();
        });
      }
    });
  };

  const addComment = (ticketId: string, commentText: string, isInternal: boolean) => {
    if (!currentUser) return;
    const currentTimestamp = new Date().toISOString();
    const newComment: Comment = {
      id: `COM-${Date.now()}`,
      ticketId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      commentText,
      isInternal,
      createdAt: currentTimestamp
    };

    // Audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      ticketId,
      action: isInternal ? 'Added Internal Comment' : 'Added Public Comment',
      performedBy: currentUser.name,
      createdAt: currentTimestamp
    };

    // Send to Supabase directly
    supabase.from('sheba_comments').insert(newComment).then(({ error }) => {
      if (error) {
        console.error('Supabase error during addComment (comment):', error);
      } else {
        supabase.from('sheba_tickets').update({ updatedAt: currentTimestamp }).eq('id', ticketId).then(() => {
          supabase.from('sheba_audit_logs').insert(newLog).then(() => {
            fetchDataFromSupabase();
          });
        });
      }
    });
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    if (!currentUser) return;
    const currentTimestamp = new Date().toISOString();
    
    // Audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      ticketId,
      action: `Status changed to ${newStatus}`,
      performedBy: currentUser.name,
      createdAt: currentTimestamp
    };

    // Send to Supabase directly
    supabase.from('sheba_tickets').update({ status: newStatus, updatedAt: currentTimestamp }).eq('id', ticketId).then(({ error }) => {
      if (error) {
        console.error('Supabase error during updateTicketStatus (ticket):', error);
      } else {
        supabase.from('sheba_audit_logs').insert(newLog).then(() => {
          fetchDataFromSupabase();
        });
      }
    });
  };

  const assignTicket = (ticketId: string, assignedToName: string) => {
    if (!currentUser) return;
    const currentTimestamp = new Date().toISOString();

    // Audit Log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      ticketId,
      action: `Assigned to ${assignedToName}`,
      performedBy: currentUser.name,
      createdAt: currentTimestamp
    };

    // Send to Supabase directly
    supabase.from('sheba_tickets').update({ assignedTo: assignedToName, updatedAt: currentTimestamp }).eq('id', ticketId).then(({ error }) => {
      if (error) {
        console.error('Supabase error during assignTicket (ticket):', error);
      } else {
        supabase.from('sheba_audit_logs').insert(newLog).then(() => {
          fetchDataFromSupabase();
        });
      }
    });
  };

  const resetState = () => {
    setCurrentUser(null);
    supabase.auth.signOut();
    setUsers([]);
    setTickets([]);
    setComments([]);
    setAuditLogs([]);
  };

  const importDatabaseState = (data: { users: User[]; tickets: Ticket[]; comments: Comment[]; auditLogs: AuditLog[] }) => {
    if (!data) return;
    if (!Array.isArray(data.users) || !Array.isArray(data.tickets) || !Array.isArray(data.comments) || !Array.isArray(data.auditLogs)) {
      throw new Error("Invalid database backup structure format.");
    }

    // Direct state updates
    setUsers(data.users);
    setTickets(data.tickets);
    setComments(data.comments);
    setAuditLogs(data.auditLogs);

    // Sync currentUser profile matches
    if (currentUser) {
      const existsInNew = data.users.find(u => u.id === currentUser.id);
      if (existsInNew) {
        setCurrentUser(existsInNew);
      }
    }
  };

  const addUserToLocalState = (newUser: User) => {
    setUsers(prev => {
      const match = prev.find(u => u.id === newUser.id || u.email.toLowerCase() === newUser.email.toLowerCase());
      if (match) {
        return prev.map(u => (u.id === newUser.id || u.email.toLowerCase() === newUser.email.toLowerCase()) ? newUser : u);
      }
      return [...prev, newUser];
    });
  };

  // Filter tickets by user's role access to ensure they only see what is relevant:
  // "jake jei role er access dawha hobe tara sudu er related ticket nia kaj korte parbe"
  const visibleTickets = React.useMemo(() => {
    if (!currentUser) return [];
    
    // Master Admin access role can see everything
    if (currentUser.role === 'Admin access') return tickets;
    
    // Let's filter tickets:
    // 1. Author of the ticket (can always see their own creations)
    // 2. The ticket is assigned to their specific Role (e.g., 'IT', 'HR', 'Finance', 'Manager', 'Supervisor', 'Admin', 'agent')
    // 3. Or they are explicitly designated as the assignee (assignedTo === currentUser.name)
    return tickets.filter(t => {
      const isOwner = t.userId === currentUser.id;
      const isRoleMatched = t.assignedRole === currentUser.role;
      const isExplicitAssignee = t.assignedTo === currentUser.name;
      return isOwner || isRoleMatched || isExplicitAssignee;
    });
  }, [tickets, currentUser]);

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      tickets: visibleTickets,
      comments,
      auditLogs,
      setCurrentUser,
      registerUser,
      updateUser,
      deleteUser,
      addTicket,
      addComment,
      updateTicketStatus,
      assignTicket,
      resetState,
      importDatabaseState,
      addUserToLocalState
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
};
