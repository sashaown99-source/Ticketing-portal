import { User, Ticket, Comment, AuditLog } from '../types';

export const DUMMY_USERS: User[] = [
  {
    id: 'emp1',
    name: 'Tanzim Rahman',
    email: 'tanzim.agent@sheba.xyz',
    role: 'agent',
    username: 'tanzim99',
    employeeId: 'EMP-001',
    department: 'Customer Service Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  },
  {
    id: 'emp2',
    name: 'Samantha Hoque',
    email: 'samantha.super@sheba.xyz',
    role: 'Supervisor',
    username: 'samantha_super',
    employeeId: 'EMP-002',
    department: 'Quality Assurance & Support',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'emp3',
    name: 'Rashedul Islam',
    email: 'rashed.mgr@sheba.xyz',
    role: 'Manager',
    username: 'rashed_mgr',
    employeeId: 'EMP-003',
    department: 'Operations & Strategy Management',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
  },
  {
    id: 'emp4',
    name: 'Sasha Chen',
    email: 'sasha.admin@sheba.xyz',
    role: 'Admin',
    username: 'sasha_admin',
    employeeId: 'EMP-004',
    department: 'Corporate & Facilities Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 'emp5',
    name: 'David Miller',
    email: 'david.it@sheba.xyz',
    role: 'IT',
    username: 'david_it',
    employeeId: 'EMP-005',
    department: 'Information Technology Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'emp6',
    name: 'Lamia Hasan',
    email: 'lamia.hr@sheba.xyz',
    role: 'HR',
    username: 'lamia_hr',
    employeeId: 'EMP-006',
    department: 'Human Resources & Talent',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  {
    id: 'emp7',
    name: 'Kamrul Ahsan',
    email: 'kamrul.fin@sheba.xyz',
    role: 'Finance',
    username: 'kamrul_fin',
    employeeId: 'EMP-007',
    department: 'Treasury, Accounts & Finance',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'emp8',
    name: 'Farhan Ahmed',
    email: 'farhan.super@sheba.xyz',
    role: 'Admin access',
    username: 'farhan_master',
    employeeId: 'EMP-008',
    department: 'Global Executive Systems Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  }
];

export const DUMMY_TICKETS: Ticket[] = [
  {
    id: 'TCK-2026-001',
    userId: 'emp1',
    userName: 'Tanzim Rahman',
    subject: 'Laptop Battery Swelling & Overheating',
    description: 'My MacBook Pro battery seems slightly swollen as the trackpad is hard to click, and it gets extremely hot when running Docker. Requesting immediate hardware replacement.',
    category: 'Hardware',
    priority: 'Urgent',
    status: 'In Progress',
    screenshotUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
    assignedTo: 'David Miller',
    assignedRole: 'IT',
    createdAt: '2026-05-28T09:30:00Z',
    updatedAt: '2026-05-29T14:20:00Z'
  },
  {
    id: 'TCK-2026-002',
    userId: 'emp1',
    userName: 'Tanzim Rahman',
    subject: 'VPN Connection Fails - Error 803',
    description: 'Cannot connect to the office VPN from home since yesterday evening. I keep getting Auth Peer Verification Failure (Error 803). Need files for the billing sprint urgently.',
    category: 'Network',
    priority: 'High',
    status: 'Open',
    assignedRole: 'IT',
    createdAt: '2026-05-31T08:15:00Z',
    updatedAt: '2026-05-31T08:15:00Z'
  },
  {
    id: 'TCK-2026-003',
    userId: 'emp5',
    userName: 'David Miller',
    subject: 'Figma and Adobe CC License Expired',
    description: 'Getting a "Subscription Ended" warning when starting Photoshop and Figma. I am on the design team and cannot complete active prototypes. Please renew or re-assign license lease.',
    category: 'Software',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Samantha Hoque',
    assignedRole: 'Supervisor',
    createdAt: '2026-05-25T11:00:00Z',
    updatedAt: '2026-05-27T10:30:00Z'
  },
  {
    id: 'TCK-2026-004',
    userId: 'emp5',
    userName: 'David Miller',
    subject: 'Office Printer Jam on 3rd Floor',
    description: 'The main HP LaserJet printer near the kitchen is stuck on "Jam in Tray 2". Tried opening the cover but couldn\'t find any paper remnant. Status is blocking printer queue.',
    category: 'Hardware',
    priority: 'Low',
    status: 'Closed',
    assignedTo: 'Sasha Chen',
    assignedRole: 'Admin',
    createdAt: '2026-05-20T14:10:00Z',
    updatedAt: '2026-05-21T16:00:00Z'
  },
  {
    id: 'TCK-2026-005',
    userId: 'emp1',
    userName: 'Tanzim Rahman',
    subject: 'Tax Deductions Query for May Salary Slip',
    description: 'My May payslip has a 12% deduction instead of the expected 8%. Please clarify if tax brackets were modified or if there was an administrative accounting calculation mismatch.',
    category: 'Others',
    priority: 'Medium',
    status: 'On Hold',
    assignedTo: 'Kamrul Ahsan',
    assignedRole: 'Finance',
    createdAt: '2026-05-29T16:45:00Z',
    updatedAt: '2026-05-30T11:15:00Z'
  },
  {
    id: 'TCK-2026-006',
    userId: 'emp1',
    userName: 'Tanzim Rahman',
    subject: 'Updated Employment Contract Signature Required',
    description: 'Need the latest revision of my operational contract signed by Lamia Hasan in HR. This is required for a commercial bank loan verification application deadline.',
    category: 'Others',
    priority: 'High',
    status: 'Open',
    assignedRole: 'HR',
    createdAt: '2026-05-31T10:00:00Z',
    updatedAt: '2026-05-31T10:00:00Z'
  },
  {
    id: 'TCK-2026-007',
    userId: 'emp2',
    userName: 'Samantha Hoque',
    subject: 'Quarterly Team budget approval Request',
    description: 'Operational budget for Q3 team training is pending approval from Rashedul Islam (Manager). Please review the requested spreadsheet on corporate drive.',
    category: 'Others',
    priority: 'High',
    status: 'Open',
    assignedRole: 'Manager',
    createdAt: '2026-05-31T12:00:00Z',
    updatedAt: '2026-05-31T12:00:00Z'
  },
  {
    id: 'TCK-2026-008',
    userId: 'emp3',
    userName: 'Rashedul Islam',
    subject: 'Support Ticket SLA Overflow Warning',
    description: 'Active ticket load under customer support has exceeded SLA response time limits. Need immediate assistance from customer agents to clear incoming live desk tickets.',
    category: 'Others',
    priority: 'Urgent',
    status: 'Open',
    assignedRole: 'agent',
    createdAt: '2026-05-31T14:00:00Z',
    updatedAt: '2026-05-31T14:00:00Z'
  },
  {
    id: 'TCK-2026-009',
    userId: 'emp6',
    userName: 'Lamia Hasan',
    subject: 'Portal Security Logs Audit & Permissions Lock',
    description: 'Need to run complete security verification on all employee login histories. Please restrict any unauthorized IP addresses and verify system configuration parameters.',
    category: 'admin portal issue',
    priority: 'Urgent',
    status: 'Open',
    assignedRole: 'Admin access',
    createdAt: '2026-05-31T15:00:00Z',
    updatedAt: '2026-05-31T15:00:00Z'
  }
];

export const DUMMY_COMMENTS: Comment[] = [
  {
    id: 'COM-001',
    ticketId: 'TCK-2026-001',
    userId: 'emp5',
    userName: 'David Miller',
    userRole: 'IT',
    commentText: 'Hi Tanzim, please do not use the laptop if the battery is swelling! That is a dynamic fire hazard. Come straight to the IT helpdesk in the corporate office tomorrow. I have set aside a replacement laptop for you.',
    isInternal: false,
    createdAt: '2026-05-28T10:15:00Z'
  },
  {
    id: 'COM-002',
    ticketId: 'TCK-2026-001',
    userId: 'emp5',
    userName: 'David Miller',
    userRole: 'IT',
    commentText: 'Internal note: Dispatched laptop replacement from stock. Trackpad issue confirmed swelling cell.',
    isInternal: true,
    createdAt: '2026-05-28T10:16:00Z'
  },
  {
    id: 'COM-003',
    ticketId: 'TCK-2026-001',
    userId: 'emp1',
    userName: 'Tanzim Rahman',
    userRole: 'agent',
    commentText: 'Thank you David, turning off the machine right now. I will see you tomorrow morning to transition.',
    isInternal: false,
    createdAt: '2026-05-28T10:45:00Z'
  }
];

export const DUMMY_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    ticketId: 'TCK-2026-001',
    action: 'Created Ticket',
    performedBy: 'Tanzim Rahman',
    createdAt: '2026-05-28T09:30:00Z'
  },
  {
    id: 'LOG-002',
    ticketId: 'TCK-2026-001',
    action: 'Assigned to David Miller',
    performedBy: 'Samantha Hoque',
    createdAt: '2026-05-28T10:05:00Z'
  }
];
