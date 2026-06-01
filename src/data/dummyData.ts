import { User, Ticket, Comment, AuditLog } from '../types';

export const DUMMY_USERS: User[] = [
  {
    id: 'emp1',
    name: 'Sasha',
    email: 'sashaown99@gmail.com',
    role: 'Admin access',
    username: 'sashaown',
    employeeId: 'EMP-001',
    department: 'Corporate Admin',
    avatarUrl: undefined
  }
];

export const DUMMY_TICKETS: Ticket[] = [];

export const DUMMY_COMMENTS: Comment[] = [];

export const DUMMY_AUDIT_LOGS: AuditLog[] = [];
