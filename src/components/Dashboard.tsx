import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TicketCategory, TicketPriority, TicketStatus } from '../types';
import { 
  Users, 
  Inbox, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  TrendingUp,
  Download
} from 'lucide-react';

interface DashboardProps {
  onSelectTicket: (ticketId: string) => void;
}

export default function Dashboard({ onSelectTicket }: DashboardProps) {
  const { currentUser, tickets, auditLogs, comments, updateTicketStatus, assignTicket, users } = useApp();
  
  // Search and Filter State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter calculations
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase()) ||
                          t.userName.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // KPI Calculations
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    closed: tickets.filter(t => t.status === 'Closed').length,
    urgent: tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved' && t.priority === 'Urgent').length,
  };

  // Distribution Ratios for visualization helper
  const priorityDistribution = {
    Urgent: tickets.filter(t => t.priority === 'Urgent').length,
    High: tickets.filter(t => t.priority === 'High').length,
    Medium: tickets.filter(t => t.priority === 'Medium').length,
    Low: tickets.filter(t => t.priority === 'Low').length,
  };

  const categoryDistribution = {
    Hardware: tickets.filter(t => t.category === 'Hardware').length,
    Software: tickets.filter(t => t.category === 'Software').length,
    Network: tickets.filter(t => t.category === 'Network').length,
    'admin portal issue': tickets.filter(t => t.category === 'admin portal issue').length,
    'Desk Issue': tickets.filter(t => t.category === 'Desk Issue').length,
    Others: tickets.filter(t => t.category === 'Others').length,
  };

  const getStatusBadgeStyle = (status: TicketStatus) => {
    switch (status) {
      case 'Open': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'In Progress': return 'bg-[#ea580c]/10 text-amber-400 border-[#ea580c]/20';
      case 'On Hold': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Closed': return 'bg-[#18233c] text-slate-450 border-slate-705';
    }
  };

  const getPriorityStyle = (priority: TicketPriority) => {
    switch (priority) {
      case 'Urgent': return 'text-rose-400 font-bold';
      case 'High': return 'text-orange-400 font-bold';
      case 'Medium': return 'text-blue-400 font-bold';
      case 'Low': return 'text-slate-450';
    }
  };

  // Recent Comments Feed
  const recentComments = [...comments].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  const handleExportCSV = () => {
    const headers = [
      'Ticket ID',
      'Employee Name',
      'Category',
      'Subject',
      'Description',
      'Priority',
      'Status',
      'Specialist Assigned',
      'Created At',
      'Updated At'
    ];

    const rows = tickets.map(t => [
      t.id,
      t.userName,
      t.category,
      t.subject,
      t.description.replace(/\n/g, ' '),
      t.priority,
      t.status,
      t.assignedTo || 'Unassigned',
      new Date(t.createdAt).toLocaleString(),
      new Date(t.updatedAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = currentUser?.role === 'Super Admin' 
      ? `sheba_all_tickets_report_${new Date().toISOString().split('T')[0]}.csv`
      : `sheba_${currentUser?.department || 'dept'}_tickets_report_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Dashboard Top Header Section with Export Reports */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0d1527] rounded-2xl border border-slate-800/80 p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-100">IT Operations Dashboard</h2>
          <p className="text-slate-400 text-xs mt-0.5">System-wide metrics and support tickets analysis.</p>
        </div>
        {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Supervisor') && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {currentUser?.role === 'Super Admin' ? 'Download Master CSV Report' : `Export ${currentUser.department || 'Department'} Report`}
          </button>
        )}
      </div>

      {/* KPI Numerical Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div 
          onClick={() => {
            setSearch('');
            setCategoryFilter('All');
            setPriorityFilter('All');
            setStatusFilter('All');
            setTimeout(() => {
              document.getElementById('support-queue-registry-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:border-blue-500/50 hover:bg-[#111c33] transition-all duration-200 active:scale-[0.98] select-none group"
        >
          <div className="p-3 bg-blue-600/15 text-blue-400 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Total Tickets</span>
            <span className="text-xl font-extrabold text-slate-100">{stats.total}</span>
          </div>
        </div>

        <div 
          onClick={() => {
            setPriorityFilter('All');
            setStatusFilter('Open');
            setTimeout(() => {
              document.getElementById('support-queue-registry-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:border-indigo-500/50 hover:bg-[#111c33] transition-all duration-200 active:scale-[0.98] select-none group"
        >
          <div className="p-3 bg-indigo-600/15 text-indigo-400 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">New Open</span>
            <span className="text-xl font-extrabold text-slate-100">{stats.open}</span>
          </div>
        </div>

        <div 
          onClick={() => {
            setPriorityFilter('All');
            setStatusFilter('In Progress');
            setTimeout(() => {
              document.getElementById('support-queue-registry-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:border-amber-500/50 hover:bg-[#111c33] transition-all duration-200 active:scale-[0.98] select-none group"
        >
          <div className="p-3 bg-[#eab308]/10 text-amber-400 rounded-xl shrink-0 border border-[#eab308]/10 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-extrabold text-slate-100">{stats.inProgress}</span>
          </div>
        </div>

        <div 
          onClick={() => {
            setPriorityFilter('All');
            setStatusFilter('Closed');
            setTimeout(() => {
              document.getElementById('support-queue-registry-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:border-emerald-500/50 hover:bg-[#111c33] transition-all duration-200 active:scale-[0.98] select-none group"
        >
          <div className="p-3 bg-emerald-600/15 text-emerald-400 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Closed Solved</span>
            <span className="text-xl font-extrabold text-slate-100">{stats.closed}</span>
          </div>
        </div>

        <div 
          onClick={() => {
            setPriorityFilter('Urgent');
            setStatusFilter('All');
            setTimeout(() => {
              document.getElementById('support-queue-registry-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-4 shadow-sm flex items-center gap-3 col-span-2 lg:col-span-1 cursor-pointer hover:border-rose-500/50 hover:bg-[#111c33] transition-all duration-200 active:scale-[0.98] select-none group"
        >
          <div className={`p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform ${stats.urgent > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800/60 text-slate-500'}`}>
            <AlertTriangle className={`w-5 h-5 ${stats.urgent > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Active Urgent</span>
            <span className="text-xl font-extrabold text-rose-455">{stats.urgent}</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Row */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Urgency Ratio Visualizer */}
        <div className="bg-[#0d1527] border border-slate-800/85 rounded-2xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Urgency Breakdowns</span>
          <div className="space-y-3">
            {Object.entries(priorityDistribution).map(([name, count]) => {
              const percentage = Math.round((count / (tickets.length || 1)) * 100);
              const barColor = name === 'Urgent' ? 'bg-rose-500' : name === 'High' ? 'bg-orange-500' : name === 'Medium' ? 'bg-blue-500' : 'bg-slate-500';
              return (
                <div key={name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-350">{name} Priority</span>
                    <span className="text-slate-400 font-semibold">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${barColor} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Share Distribution */}
        <div className="bg-[#0d1527] border border-slate-800/85 rounded-2xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Category Distribution</span>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(categoryDistribution).map(([name, count]) => {
              const percentage = Math.round((count / (tickets.length || 1)) * 100);
              const categoryDesc = 
                name === 'Hardware' ? '🔧 Laptop, printer, screens' : 
                name === 'Software' ? '💿 License, OS issues' : 
                name === 'Network' ? '🌐 Wi-Fi, VPN connectivity' : 
                name === 'admin portal issue' ? '🖥️ Sheba app error' : 
                name === 'Desk Issue' ? '🗂️ Workspace desk issue' : 
                '🧩 Others';
              return (
                <div key={name} className="p-3 rounded-xl bg-[#142038] border border-slate-700/40 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-100">{name}</span>
                    <p className="text-[10px] text-slate-450 mt-0.5 line-clamp-1">{categoryDesc}</p>
                  </div>
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-sm font-bold text-slate-150">{count}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Filter and Search controls */}
      <div id="support-queue-registry-section" className="scroll-mt-6 bg-[#0d1527] rounded-2xl border border-slate-800/80 shadow-sm p-4 space-y-4">
        <div className="grid md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-405">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search tickets by ID, employee name, subject keywords..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-100 placeholder-slate-500 font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-2 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl text-[11px] focus:outline-none focus:border-blue-500 text-slate-100 font-bold"
            >
              <option value="All" className="bg-[#141f35]">All Categories</option>
              <option value="Hardware" className="bg-[#141f35]">Hardware</option>
              <option value="Software" className="bg-[#141f35]">Software</option>
              <option value="Network" className="bg-[#141f35]">Network</option>
              <option value="admin portal issue" className="bg-[#141f35]">admin portal issue</option>
              <option value="Desk Issue" className="bg-[#141f35]">Desk Issue</option>
              <option value="Others" className="bg-[#141f35]">Others</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full px-2 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl text-[11px] focus:outline-none focus:border-blue-500 text-slate-100 font-bold"
            >
              <option value="All" className="bg-[#141f35]">All Priorities</option>
              <option value="Low" className="bg-[#141f35]">Low</option>
              <option value="Medium" className="bg-[#141f35]">Medium</option>
              <option value="High" className="bg-[#141f35]">High</option>
              <option value="Urgent" className="bg-[#141f35]">Urgent</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-2 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl text-[11px] focus:outline-none focus:border-blue-500 text-slate-100 font-bold"
            >
              <option value="All" className="bg-[#141f35]">All Statuses</option>
              <option value="Open" className="bg-[#141f35]">Open</option>
              <option value="In Progress" className="bg-[#141f35]">In Progress</option>
              <option value="On Hold" className="bg-[#141f35]">On Hold</option>
              <option value="Resolved" className="bg-[#141f35]">Resolved</option>
              <option value="Closed" className="bg-[#141f35]">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main IT Support Ticket Queue table */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left/Middle: Ticket Queue list */}
        <div className="lg:col-span-9 bg-[#0d1527] border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-100">Support Queue Registry ({filteredTickets.length})</span>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-450">
              No matching tickets found. Turn off active filters to reload standard queue records.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left border-collapse">
                <thead>
                  <tr className="bg-[#121c33]/70 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    <th className="px-5 py-4 ml-1.5 whitespace-nowrap">ID</th>
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Issue/Subject</th>
                    <th className="px-5 py-4">Urgency</th>
                    <th className="px-5 py-4">Specialist Assigned</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredTickets.map(ticket => (
                    <tr 
                      key={ticket.id} 
                      className={`hover:bg-[#14203a]/40 transition ${
                        ticket.priority === 'Urgent' && ticket.status !== 'Closed' && ticket.status !== 'Resolved'
                          ? 'bg-rose-500/10' 
                          : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-400">
                        {ticket.id}
                      </td>
                      <td className="px-5 py-3.5 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600/20 text-blue-300 rounded-full flex items-center justify-center font-bold text-[10px] uppercase border border-blue-500/15">
                            {ticket.userName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-100 truncate">{ticket.userName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <div>
                          <p 
                            onClick={() => onSelectTicket(ticket.id)}
                            className="font-bold text-slate-105 truncate hover:text-blue-400 cursor-pointer transition"
                          >
                            {ticket.subject}
                          </p>
                          <p className="text-[10px] text-slate-450 truncate mt-0.5">{ticket.description}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[11px]">
                        <span className={getPriorityStyle(ticket.priority)}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={ticket.assignedTo || ''}
                          onClick={e => e.stopPropagation()}
                          onChange={e => assignTicket(ticket.id, e.target.value)}
                          className="px-2 py-1.5 bg-[#141f35] border border-slate-700/60 rounded-lg text-[10px] text-slate-200 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="" className="bg-[#141f35]">👤 Unassigned</option>
                          {users.map(u => (
                            <option key={u.id} value={u.name} className="bg-[#141f35]">
                              {u.name} ({u.role})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={ticket.status}
                          onClick={e => e.stopPropagation()}
                          onChange={e => updateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                          className="px-2 py-1.5 bg-[#141f35] border border-slate-700/60 rounded-lg text-[10px] text-slate-200 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="Open" className="bg-[#141f35]">🔵 Open</option>
                          <option value="In Progress" className="bg-[#141f35]">🟡 In Progress</option>
                          <option value="On Hold" className="bg-[#141f35]">🟣 On Hold</option>
                          <option value="Resolved" className="bg-[#141f35]">🟢 Resolved</option>
                          <option value="Closed" className="bg-[#141f35]">⚪ Closed</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => onSelectTicket(ticket.id)}
                          className="p-1 px-3 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/25 text-[10px] font-bold rounded-lg transition overflow-hidden cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Sidebar: Recent Activity stream and Comments */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-sans">Recent Activity Log</span>
            
            <div className="space-y-4">
              {recentComments.length === 0 ? (
                <div className="p-4 text-center text-[10px] text-slate-500">
                  No activity comments logged yet.
                </div>
              ) : (
                recentComments.map(cmt => (
                  <div key={cmt.id} className="text-xs space-y-1 bg-[#141f35] p-3 rounded-xl border border-slate-800/60">
                    <div className="flex justify-between items-center text-[9px] text-slate-450">
                      <span className="font-bold text-slate-200">{cmt.userName}</span>
                      <span>{new Date(cmt.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-medium leading-relaxed line-clamp-2">"{cmt.commentText}"</p>
                    <p className="text-[9px] text-blue-400 font-bold flex items-center gap-1">
                      Ticket ID Ref: <span className="underline cursor-pointer" onClick={() => onSelectTicket(cmt.ticketId)}>{cmt.ticketId}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
