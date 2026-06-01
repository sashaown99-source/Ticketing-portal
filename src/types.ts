export type Role = 
  | 'agent' 
  | 'Supervisor' 
  | 'Manager' 
  | 'Admin' 
  | 'IT' 
  | 'HR' 
  | 'Finance' 
  | 'Admin access';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  username?: string;
  employeeId?: string;
  department?: string;
  password?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export type TicketCategory = 
  | 'Hardware' 
  | 'Software' 
  | 'Network' 
  | 'admin portal issue' 
  | 'Desk Issue' 
  | 'Others';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketStatus = 'Open' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';

export interface Ticket {
  id: string;
  userId: string; // Employee who created it
  userName: string; // Helper for UI
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  screenshotUrl?: string;
  assignedTo?: string; // Admin/IT Staff name/ID
  assignedBy?: string; // Assign to a specific user (Assign by)
  assignedDepartment?: 'IT' | 'Admin' | 'HR' | 'Finance' | 'Manager'; // Assign department
  assignedRole?: Role; // Target role that can view and work with this ticket
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: Role;
  commentText: string;
  isInternal: boolean; // IT-only internal note vs public comment
  createdAt: string;
}

export interface AuditLog {
  id: string;
  ticketId: string;
  action: string;
  performedBy: string;
  createdAt: string;
}
