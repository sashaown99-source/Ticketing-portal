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
  ) => User;
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
  ) => void;
  deleteUser: (id: string) => void;
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
  
  // Supabase states & triggers
  isSupabaseSynced: boolean;
  supabaseError: string | null;
  reconnectSupabase: () => Promise<void>;
  seedDummyToSupabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Database mappers to map snake_case to camelCase
const mapDbUser = (u: any): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role as Role,
  username: u.username || undefined,
  employeeId: u.employee_id || undefined,
  department: u.department || undefined,
  password: u.password || undefined,
  avatarUrl: u.avatar_url || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150`,
  isActive: u.is_active === undefined ? true : u.is_active
});

const mapDbTicket = (t: any): Ticket => ({
  id: t.id,
  userId: t.user_id,
  userName: t.user_name,
  subject: t.subject,
  description: t.description,
  category: t.category,
  priority: t.priority,
  status: t.status,
  screenshotUrl: t.screenshot_url || undefined,
  assignedTo: t.assigned_to || undefined,
  assignedBy: t.assigned_by || undefined,
  assignedDepartment: t.assigned_department as any,
  assignedRole: t.assigned_role as any,
  createdAt: t.created_at,
  updatedAt: t.updated_at
});

const mapDbComment = (c: any): Comment => ({
  id: c.id,
  ticketId: c.ticket_id,
  userId: c.user_id,
  userName: c.user_name,
  userRole: c.user_role as Role,
  commentText: c.comment_text,
  isInternal: c.is_internal,
  createdAt: c.created_at
});

const mapDbAuditLog = (l: any): AuditLog => ({
  id: l.id,
  ticketId: l.ticket_id,
  action: l.action,
  performedBy: l.performed_by,
  createdAt: l.created_at
});

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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('it_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('it_users');
    return saved ? JSON.parse(saved) : DUMMY_USERS;
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('it_tickets');
    return saved ? JSON.parse(saved) : DUMMY_TICKETS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('it_comments');
    return saved ? JSON.parse(saved) : DUMMY_COMMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('it_audit_logs');
    return saved ? JSON.parse(saved) : DUMMY_AUDIT_LOGS;
  });

  // Supabase Status State
  const [isSupabaseSynced, setIsSupabaseSynced] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Sync state with localstorage so the app performs flawlessly offline or as a fallback
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

  // Read entire state from Supabase
  const fetchAllDataFromSupabase = async () => {
    try {
      setSupabaseError(null);
      
      // 1. Fetch Users
      const { data: dbUsers, error: usersErr } = await supabase.from('users').select('*');
      if (usersErr) {
        if (usersErr.code === '42P01') {
          setSupabaseError('tables_missing');
        } else {
          setSupabaseError(usersErr.message);
        }
        setIsSupabaseSynced(false);
        return;
      }

      // 2. Fetch Tickets
      const { data: dbTickets, error: ticketsErr } = await supabase.from('tickets').select('*');
      if (ticketsErr) throw ticketsErr;

      // 3. Fetch Comments
      const { data: dbComments, error: commentsErr } = await supabase.from('comments').select('*');
      if (commentsErr) throw commentsErr;

      // 4. Fetch Audit Logs
      const { data: dbLogs, error: logsErr } = await supabase.from('audit_logs').select('*');
      if (logsErr) throw logsErr;

      // Check if DB is empty - missing seed database
      if (!dbUsers || dbUsers.length === 0) {
        setSupabaseError('empty_database');
        setIsSupabaseSynced(false);
        return;
      }

      // Parse and sync to local state
      const parsedUsers = dbUsers.map(mapDbUser);
      const parsedTickets = dbTickets.map(mapDbTicket);
      const parsedComments = dbComments.map(mapDbComment);
      const parsedLogs = dbLogs.map(mapDbAuditLog);

      setUsers(parsedUsers);
      setTickets(parsedTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setComments(parsedComments);
      setAuditLogs(parsedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      // Update current Logged-In User pointer if it matches a record
      if (currentUser) {
        const liveUserObj = parsedUsers.find(u => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (liveUserObj) {
          setCurrentUser(liveUserObj);
        }
      }

      setIsSupabaseSynced(true);
      setSupabaseError(null);
    } catch (err: any) {
      console.error("Supabase live download error:", err);
      setSupabaseError(err.message || String(err));
      setIsSupabaseSynced(false);
    }
  };

  // Seed Dummy Data to live Supabase Instance
  const seedDummyToSupabase = async () => {
    try {
      setSupabaseError(null);
      setIsSupabaseSynced(false);

      // Clean existing sequence to force fresh load if requested
      await supabase.from('audit_logs').delete().neq('id', 'force_clean_all');
      await supabase.from('comments').delete().neq('id', 'force_clean_all');
      await supabase.from('tickets').delete().neq('id', 'force_clean_all');
      await supabase.from('users').delete().neq('id', 'force_clean_all');

      // 1. Users
      if (DUMMY_USERS.length > 0) {
        const { error: uErr } = await supabase.from('users').insert(
          DUMMY_USERS.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            username: u.username || null,
            employee_id: u.employeeId || null,
            department: u.department || null,
            password: u.password || null,
            avatar_url: u.avatarUrl || null,
            is_active: u.isActive !== false
          }))
        );
        if (uErr) throw uErr;
      }

      // 2. Tickets
      if (DUMMY_TICKETS.length > 0) {
        const { error: tErr } = await supabase.from('tickets').insert(
          DUMMY_TICKETS.map(t => ({
            id: t.id,
            user_id: t.userId,
            user_name: t.userName,
            subject: t.subject,
            description: t.description,
            category: t.category,
            priority: t.priority,
            status: t.status,
            screenshot_url: t.screenshotUrl || null,
            assigned_to: t.assignedTo || null,
            assigned_by: t.assignedBy || null,
            assigned_department: t.assignedDepartment || null,
            assigned_role: t.assignedRole || null,
            created_at: t.createdAt,
            updated_at: t.updatedAt
          }))
        );
        if (tErr) throw tErr;
      }

      // 3. Comments
      if (DUMMY_COMMENTS.length > 0) {
        const { error: cErr } = await supabase.from('comments').insert(
          DUMMY_COMMENTS.map(c => ({
            id: c.id,
            ticket_id: c.ticketId,
            user_id: c.userId,
            user_name: c.userName,
            user_role: c.userRole,
            comment_text: c.commentText,
            is_internal: c.isInternal,
            created_at: c.createdAt
          }))
        );
        if (cErr) throw cErr;
      }

      // 4. Audit Logs
      if (DUMMY_AUDIT_LOGS.length > 0) {
        const { error: lErr } = await supabase.from('audit_logs').insert(
          DUMMY_AUDIT_LOGS.map(l => ({
            id: l.id,
            ticket_id: l.ticketId,
            action: l.action,
            performed_by: l.performedBy,
            created_at: l.createdAt
          }))
        );
        if (lErr) throw lErr;
      }

      // Sync and succeed
      await fetchAllDataFromSupabase();
    } catch (err: any) {
      console.error("Supabase manual seeding failure:", err);
      setSupabaseError(`Seeding failed: ${err.message || String(err)}`);
    }
  };

  // Initial Sync load
  useEffect(() => {
    fetchAllDataFromSupabase();
  }, []);

  const reconnectSupabase = async () => {
    await fetchAllDataFromSupabase();
  };

  const registerUser = (
    name: string,
    email: string,
    role: Role,
    username?: string,
    employeeId?: string,
    department?: string,
    password?: string
  ) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      username,
      employeeId,
      department,
      password,
      avatarUrl: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150`,
      isActive: true
    };
    
    setUsers(prev => [...prev, newUser]);

    // Async write to Supabase
    supabase.from('users').insert({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      username: newUser.username || null,
      employee_id: newUser.employeeId || null,
      department: newUser.department || null,
      password: newUser.password || null,
      avatar_url: newUser.avatarUrl || null,
      is_active: newUser.isActive !== false
    }).then(({ error }) => {
      if (error) console.error("registerUser sync to Supabase failed:", error);
    });

    return newUser;
  };

  const updateUser = (
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
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated: User = {
          ...u,
          name,
          email,
          role,
          username,
          employeeId,
          department,
          password,
          isActive: isActive !== undefined ? isActive : (u.isActive !== false)
        };
        // sync currently logged in user if they updated themselves
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
        }

        return updated;
      }
      return u;
    }));

    // Async update to Supabase
    supabase.from('users').update({
      name,
      email,
      role,
      username: username || null,
      employee_id: employeeId || null,
      department: department || null,
      password: password || null,
      is_active: isActive !== undefined ? isActive : true
    }).eq('id', id).then(({ error }) => {
      if (error) console.error("updateUser sync to Supabase failed:", error);
    });
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));

    // Async delete from Supabase
    supabase.from('users').delete().eq('id', id).then(({ error }) => {
      if (error) console.error("deleteUser sync to Supabase failed:", error);
    });
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
      assignedTo: assignedBy,
      assignedBy,
      assignedDepartment,
      assignedRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTickets(prev => [newTicket, ...prev]);

    // Create audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      ticketId: newId,
      action: `Created ticket assigned to: ${assignedBy || 'Unassigned'}`,
      performedBy: currentUser.name,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Async insert to Supabase for tickets & audit_logs
    supabase.from('tickets').insert({
      id: newTicket.id,
      user_id: newTicket.userId,
      user_name: newTicket.userName,
      subject,
      description,
      category,
      priority,
      status: 'Open',
      screenshot_url: screenshotUrl || null,
      assigned_to: assignedBy || null,
      assigned_by: assignedBy || null,
      assigned_department: assignedDepartment || null,
      assigned_role: assignedRole || null,
      created_at: newTicket.createdAt,
      updated_at: newTicket.updatedAt
    }).then(({ error }) => {
      if (error) console.error("addTicket sync to Supabase failed:", error);
    });

    supabase.from('audit_logs').insert({
      id: newLog.id,
      ticket_id: newLog.ticketId,
      action: newLog.action,
      performed_by: newLog.performedBy,
      created_at: newLog.createdAt
    }).then(({ error }) => {
      if (error) console.error("addTicket log sync failed:", error);
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

    setComments(prev => [...prev, newComment]);

    // Update ticket's updatedAt timestamp
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, updatedAt: currentTimestamp } : t));

    // Audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      ticketId,
      action: isInternal ? 'Added Internal Comment' : 'Added Public Comment',
      performedBy: currentUser.name,
      createdAt: currentTimestamp
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Async sync to Supabase comments, update ticket and audit_logs
    supabase.from('comments').insert({
      id: newComment.id,
      ticket_id: ticketId,
      user_id: newComment.userId,
      user_name: newComment.userName,
      user_role: newComment.userRole,
      comment_text: commentText,
      is_internal: isInternal,
      created_at: currentTimestamp
    }).then(({ error }) => {
      if (error) console.error("addComment sync failed:", error);
    });

    supabase.from('tickets').update({
      updated_at: currentTimestamp
    }).eq('id', ticketId).then(({ error }) => {
      if (error) console.error("addComment ticket updatedAt sync failed:", error);
    });

    supabase.from('audit_logs').insert({
      id: newLog.id,
      ticket_id: ticketId,
      action: newLog.action,
      performed_by: newLog.performedBy,
      created_at: currentTimestamp
    }).then(({ error }) => {
      if (error) console.error("addComment audit log sync failed:", error);
    });
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    if (!currentUser) return;
    const currentTimestamp = new Date().toISOString();
    
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: currentTimestamp
        };
      }
      return t;
    }));

    // Audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      ticketId,
      action: `Status changed to ${newStatus}`,
      performedBy: currentUser.name,
      createdAt: currentTimestamp
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Async sync to Supabase for tickets with newStatus, and audit_log
    supabase.from('tickets').update({
      status: newStatus,
      updated_at: currentTimestamp
    }).eq('id', ticketId).then(({ error }) => {
      if (error) console.error("updateTicketStatus sync failed:", error);
    });

    supabase.from('audit_logs').insert({
      id: newLog.id,
      ticket_id: ticketId,
      action: newLog.action,
      performed_by: newLog.performedBy,
      created_at: currentTimestamp
    }).then(({ error }) => {
      if (error) console.error("updateTicketStatus audit log sync failed:", error);
    });
  };

  const assignTicket = (ticketId: string, assignedToName: string) => {
    if (!currentUser) return;
    const currentTimestamp = new Date().toISOString();

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          assignedTo: assignedToName,
          assignedBy: assignedToName,
          updatedAt: currentTimestamp
        };
      }
      return t;
    }));

    // Audit Log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      ticketId,
      action: `Assigned to ${assignedToName}`,
      performedBy: currentUser.name,
      createdAt: currentTimestamp
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Async sync to Supabase for tickets with assignment, and audit_log
    supabase.from('tickets').update({
      assigned_to: assignedToName,
      assigned_by: assignedToName,
      updated_at: currentTimestamp
    }).eq('id', ticketId).then(({ error }) => {
      if (error) console.error("assignTicket sync failed:", error);
    });

    supabase.from('audit_logs').insert({
      id: newLog.id,
      ticket_id: ticketId,
      action: newLog.action,
      performed_by: newLog.performedBy,
      created_at: currentTimestamp
    }).then(({ error }) => {
      if (error) console.error("assignTicket audit log sync failed:", error);
    });
  };

  const resetState = async () => {
    localStorage.removeItem('it_current_user');
    localStorage.removeItem('it_users');
    localStorage.removeItem('it_tickets');
    localStorage.removeItem('it_comments');
    localStorage.removeItem('it_audit_logs');
    setCurrentUser(DUMMY_USERS[0]); // Reset to default admin
    setUsers(DUMMY_USERS);
    setTickets(DUMMY_TICKETS);
    setComments(DUMMY_COMMENTS);
    setAuditLogs(DUMMY_AUDIT_LOGS);

    // Deep reset inside Supabase too
    try {
      await seedDummyToSupabase();
    } catch (e) {
      console.error("Clean wipe database in resetState failed:", e);
    }
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

  // Filter tickets by user's role access to ensure they only see what is relevant:
  const visibleTickets = React.useMemo(() => {
    if (!currentUser) return [];
    
    // Super Admin has system-wide visibility to oversee, assign, and report
    if (currentUser.role === 'Super Admin') {
      return tickets;
    }

    // Supervisor gets tickets in their department, or explicitly assigned to them, or created by them
    if (currentUser.role === 'Supervisor') {
      return tickets.filter(t => {
        const creator = users.find(u => u.id === t.userId);
        const supervisorDept = currentUser.department?.trim().toLowerCase();
        const creatorDept = creator?.department?.trim().toLowerCase();
        const isDeptMatch = supervisorDept && creatorDept === supervisorDept;
        const isExplicitAssignee = (t.assignedTo && currentUser.name && (t.assignedTo.toLowerCase() === currentUser.name.toLowerCase())) || 
                                    (t.assignedBy && currentUser.name && (t.assignedBy.toLowerCase() === currentUser.name.toLowerCase()));
        const isOwner = t.userId === currentUser.id;
        const isDeptAssigned = t.assignedDepartment && supervisorDept && (t.assignedDepartment.toLowerCase() === supervisorDept);
        return isDeptMatch || isExplicitAssignee || isOwner || isDeptAssigned;
      });
    }
    
    // Agent can only see:
    // - Tickets they created themselves
    // - Tickets explicitly assigned to their username/name
    // - Tickets matching their department role or assigned Department
    return tickets.filter(t => {
      const isOwner = t.userId === currentUser.id;
      const isExplicitAssignee = t.assignedTo && currentUser.name && (t.assignedTo.toLowerCase() === currentUser.name.toLowerCase());
      const isRoleMatched = t.assignedRole === currentUser.role;
      const isDeptMatched = t.assignedDepartment && currentUser.department && (t.assignedDepartment.toLowerCase() === currentUser.department.toLowerCase());
      return isOwner || isExplicitAssignee || isRoleMatched || isDeptMatched;
    });
  }, [tickets, users, currentUser]);

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
      isSupabaseSynced,
      supabaseError,
      reconnectSupabase,
      seedDummyToSupabase
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

