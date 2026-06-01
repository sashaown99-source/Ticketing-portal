import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Ticket, Comment, AuditLog, TicketCategory, TicketPriority, TicketStatus, Role } from '../types';
import { DUMMY_USERS, DUMMY_TICKETS, DUMMY_COMMENTS, DUMMY_AUDIT_LOGS } from '../data/dummyData';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('it_current_user');
    // Default to Farhan Ahmed (Admin access) to see stats first
    return saved ? JSON.parse(saved) : DUMMY_USERS[7];
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

    setTickets(prev => [newTicket, ...prev]);

    // Create audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      ticketId: newId,
      action: `Created ticket assigned to role: ${assignedRole || 'Unassigned'}`,
      performedBy: currentUser.name,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addComment = (ticketId: string, commentText: string, isInternal: boolean) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `COM-${Date.now()}`,
      ticketId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      commentText,
      isInternal,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, newComment]);

    // Update ticket's updatedAt timestamp
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, updatedAt: new Date().toISOString() } : t));

    // Audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      ticketId,
      action: isInternal ? 'Added Internal Comment' : 'Added Public Comment',
      performedBy: currentUser.name,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    if (!currentUser) return;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const assignTicket = (ticketId: string, assignedToName: string) => {
    if (!currentUser) return;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          assignedTo: assignedToName,
          updatedAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const resetState = () => {
    localStorage.removeItem('it_current_user');
    localStorage.removeItem('it_users');
    localStorage.removeItem('it_tickets');
    localStorage.removeItem('it_comments');
    localStorage.removeItem('it_audit_logs');
    setCurrentUser(DUMMY_USERS[2]); // Back to Jenkins
    setUsers(DUMMY_USERS);
    setTickets(DUMMY_TICKETS);
    setComments(DUMMY_COMMENTS);
    setAuditLogs(DUMMY_AUDIT_LOGS);
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
      addTicket,
      addComment,
      updateTicketStatus,
      assignTicket,
      resetState,
      importDatabaseState
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
