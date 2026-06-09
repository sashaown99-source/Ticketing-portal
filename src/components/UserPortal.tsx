import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TicketCategory, TicketPriority, TicketStatus } from '../types';
import { PlusCircle, Search, Inbox, Filter, Clock, CheckCircle2, CircleDot, Download } from 'lucide-react';

interface UserPortalProps {
  onSelectTicket: (ticketId: string) => void;
  onOpenCreate: () => void;
}

export default function UserPortal({ onSelectTicket, onOpenCreate }: UserPortalProps) {
  const { currentUser, tickets } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [queueFilter, setQueueFilter] = useState<'all' | 'assigned'>('all');

  // Let whoever is given a specific role work with their related tickets (which are pre-filtered in AppContext)
  const myTickets = tickets;

  // Apply filters
  const filteredTickets = myTickets.filter(t => {
    // Check if explicitly assigned to the logged in user
    const isAssignedToMe = (t.assignedTo && currentUser?.name && t.assignedTo.toLowerCase() === currentUser.name.toLowerCase()) || 
                           (t.assignedBy && currentUser?.name && t.assignedBy.toLowerCase() === currentUser.name.toLowerCase());
    
    if (queueFilter === 'assigned' && !isAssignedToMe) {
      return false;
    }

    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleExportCSV = () => {
    const headers = [
      'Ticket ID',
      'Creator Name',
      'Category',
      'Subject',
      'Description',
      'Priority',
      'Status',
      'Specialist Assigned',
      'Created At',
      'Updated At'
    ];

    const rows = filteredTickets.map(t => [
      t.id,
      t.userName,
      t.category,
      t.subject,
      t.description.replace(/\n/g, ' '),
      t.priority,
      t.status,
      t.assignedTo || t.assignedBy || 'Unassigned',
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
    link.setAttribute('download', `sheba_ticket_queue_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats dynamically reflect selected queue filter category
  const activeQueueTickets = queueFilter === 'assigned'
    ? myTickets.filter(t => (t.assignedTo && currentUser?.name && t.assignedTo.toLowerCase() === currentUser.name.toLowerCase()) || (t.assignedBy && currentUser?.name && t.assignedBy.toLowerCase() === currentUser.name.toLowerCase()))
    : myTickets;

  const stats = {
    total: activeQueueTickets.length,
    active: activeQueueTickets.filter(t => ['Open', 'In Progress', 'On Hold'].includes(t.status)).length,
    resolved: activeQueueTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length
  };

  const getStatusStyle = (status: TicketStatus) => {
    switch (status) {
      case 'Open': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'In Progress': return 'bg-[#ea580c]/10 text-amber-400 border-[#ea580c]/20';
      case 'On Hold': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Closed': return 'bg-[#18233c] text-slate-400 border-slate-705';
    }
  };

  const getPriorityStyle = (p: TicketPriority) => {
    switch (p) {
      case 'Urgent': return 'text-rose-400 font-bold';
      case 'High': return 'text-orange-400 font-medium';
      case 'Medium': return 'text-blue-400 font-medium';
      case 'Low': return 'text-slate-450';
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0d1527] rounded-2xl border border-slate-800/80 p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Hello, {currentUser?.name} 👋</h2>
          <p className="text-slate-400 text-xs mt-1">Need help? Submit a support ticket and direct-track resolving progress.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 font-bold rounded-xl text-xs border border-emerald-500/25 transition cursor-pointer transition-all duration-150"
          >
            <Download className="w-4 h-4" />
            Export Queue to CSV
          </button>
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/10 cursor-pointer transition-all duration-150"
          >
            <PlusCircle className="w-4 h-4" />
            Create a New Ticket
          </button>
        </div>
      </div>

      {/* Queue Filter Segment Controls - "Assign to me" and "All tickets" */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0d1527] rounded-2xl border border-slate-800/80 p-5 shadow-sm">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Queue Focus Overview</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Filter between tickets assigned to you or the entire role matching queue.</span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-[#121c33] border border-slate-800/60 rounded-xl self-start sm:self-auto w-full sm:w-auto">
          <button
            id="btn-queue-assigned"
            onClick={() => setQueueFilter('assigned')}
            className={`flex-1 sm:flex-initial cursor-pointer px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              queueFilter === 'assigned'
                ? 'bg-blue-600 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            👤 Assign to me ({myTickets.filter(t => (t.assignedTo && currentUser?.name && t.assignedTo.toLowerCase() === currentUser.name.toLowerCase()) || (t.assignedBy && currentUser?.name && t.assignedBy.toLowerCase() === currentUser.name.toLowerCase())).length})
          </button>
          <button
            id="btn-queue-all"
            onClick={() => setQueueFilter('all')}
            className={`flex-1 sm:flex-initial cursor-pointer px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              queueFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-800/40'
            }`}
          >
            📁 All tickets ({myTickets.length})
          </button>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-3 gap-4">
        
        <div className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/15 text-blue-400 rounded-xl border border-blue-500/10">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Total Inbox</span>
            <span className="text-lg font-bold text-slate-100">{stats.total}</span>
          </div>
        </div>

        <div className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-600/15 text-amber-400 rounded-xl border border-amber-500/10">
            <CircleDot className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Active Queue</span>
            <span className="text-lg font-bold text-slate-100">{stats.active}</span>
          </div>
        </div>

        <div className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600/15 text-emerald-400 rounded-xl border border-emerald-500/10">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Solved</span>
            <span className="text-lg font-bold text-slate-100">{stats.resolved}</span>
          </div>
        </div>

      </div>

      {/* Filter and Search controls */}
      <div className="bg-[#0d1527] rounded-2xl border border-slate-800/80 shadow-sm p-4 space-y-4">
        <div className="grid md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-450">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Ticket ID, Subject, or details..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-100 placeholder-slate-500"
            />
          </div>

          {/* Category Selector */}
          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-2 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl text-[11px] focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 font-semibold"
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

          {/* Priority selector */}
          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full px-2 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl text-[11px] focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 font-semibold"
            >
              <option value="All" className="bg-[#141f35]">All Priorities</option>
              <option value="Low" className="bg-[#141f35]">Low</option>
              <option value="Medium" className="bg-[#141f35]">Medium</option>
              <option value="High" className="bg-[#141f35]">High</option>
              <option value="Urgent" className="bg-[#141f35]">Urgent</option>
            </select>
          </div>

          {/* Status selector */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-2 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl text-[11px] focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 font-semibold"
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

      {/* Tickets List Table */}
      <div className="bg-[#0d1527] border border-slate-800/80 shadow-sm rounded-2xl overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <span className="text-xs font-bold text-slate-300 block">No support tickets found</span>
            <span className="text-[11px] text-slate-450 mt-1 block">Try clearing search phrases or create a new support ticket.</span>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="bg-[#121c33]/70 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Ticket Details / Subject</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Update</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-400 shrink-0">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-bold text-[9px] uppercase tracking-wide">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <p 
                          onClick={() => onSelectTicket(ticket.id)}
                          className="font-bold text-slate-100 hover:text-blue-400 cursor-pointer transition max-w-xs md:max-w-md truncate"
                        >
                          {ticket.subject}
                        </p>
                        <p className="text-[10px] text-slate-450 truncate max-w-xs mt-0.5">{ticket.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      <span className={getPriorityStyle(ticket.priority)}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold border rounded uppercase leading-none inline-flex items-center tracking-wide ${getStatusStyle(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-450 font-bold text-[10px]">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onSelectTicket(ticket.id)}
                        className="p-1 px-3 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 text-[10px] font-bold border border-blue-500/20 rounded-lg transition shrink-0 cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
