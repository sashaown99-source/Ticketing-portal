import { User, Ticket, Comment, AuditLog } from '../types';

export const DUMMY_USERS: User[] = [
  {
    id: 'emp1',
    name: 'Farhan Ahmed',
    email: 'farhan.super@sheba.xyz',
    role: 'Admin access',
    username: 'farhan_master',
    employeeId: 'EMP-001',
    department: 'Global Executive Systems Admin',
    avatarUrl: undefined
  },
  {
    id: 'emp2',
    name: 'Sasha',
    email: 'sashaown99@gmail.com',
    role: 'Admin access',
    username: 'sashaown',
    employeeId: 'EMP-002',
    department: 'Corporate Admin',
    avatarUrl: undefined
  },
  {
    id: 'emp3',
    name: 'Tanzim Rahman',
    email: 'tanzim.agent@sheba.xyz',
    role: 'agent',
    username: 'tanzim99',
    employeeId: 'EMP-003',
    department: 'Customer Service Operations',
    avatarUrl: undefined
  }
];

export const DUMMY_TICKETS: Ticket[] = [];

export const DUMMY_COMMENTS: Comment[] = [];

export const DUMMY_AUDIT_LOGS: AuditLog[] = [];
