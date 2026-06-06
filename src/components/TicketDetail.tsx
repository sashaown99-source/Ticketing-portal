import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, TicketStatus, TicketPriority } from '../types';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MessageSquare, 
  Plus, 
  Lock, 
  Clock, 
  Tag, 
  Paperclip,
  Eye,
  EyeOff
} from 'lucide-react';

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

export default function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const { 
    currentUser, 
    tickets, 
    comments, 
    auditLogs, 
    addComment, 
    updateTicketStatus, 
    assignTicket,
    users
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  // Staging state variables for ticket status update flow
  const [prevTicketStatus, setPrevTicketStatus] = useState<TicketStatus>('Open');
  const [prevTicketId, setPrevTicketId] = useState<string>('');
  const [stagedStatus, setStagedStatus] = useState<TicketStatus>('Open');
  const [statusSaveSuccess, setStatusSaveSuccess] = useState(false);

  // Finding components
  const ticket = tickets.find(t => t.id === ticketId);

  if (ticket && (ticket.status !== prevTicketStatus || ticket.id !== prevTicketId)) {
    setPrevTicketStatus(ticket.status);
    setPrevTicketId(ticket.id);
    setStagedStatus(ticket.status);
  }
  if (!ticket) {
    return (
      <div className="bg-[#0d1527] rounded-2xl p-8 text-center border border-slate-800 text-slate-100">
        <p className="text-slate-400 mb-4 font-semibold">Ticket not found or has been revoked.</p>
        <button onClick={onBack} className="text-blue-450 hover:underline font-bold transition">Go Back</button>
      </div>
    );
  }

  // Support staff validation (Super Admin, Supervisor and Agent support roles)
  const isSupportStaff = currentUser && ['Super Admin', 'Supervisor', 'Agent'].includes(currentUser.role);
  const isPrivilegedWriter = currentUser && ['Super Admin'].includes(currentUser.role);

  // Point 4 Access Restrictions Implementation
  // Only the creator, assigned user, assigned department, or Super Admin can take action on a ticket
  const isCreatedByMe = currentUser && currentUser.id === ticket.userId;
  const isAssignedToMe = currentUser && (
    (ticket.assignedBy && ticket.assignedBy.toLowerCase() === currentUser.name.toLowerCase()) ||
    (ticket.assignedTo && ticket.assignedTo.toLowerCase() === currentUser.name.toLowerCase())
  );
  const isAssignedToMyDepartment = currentUser && ticket.assignedDepartment && currentUser.department && (
    ticket.assignedDepartment.toLowerCase() === currentUser.department.toLowerCase()
  );
  const isSuperAdmin = currentUser && currentUser.role === 'Super Admin';

  const canTakeAction = isCreatedByMe || isAssignedToMe || isAssignedToMyDepartment || isSuperAdmin;

  // Filter Comments (Only support staff can see isInternal comments)
  const ticketComments = comments.filter(c => 
    c.ticketId === ticket.id && (!c.isInternal || isSupportStaff)
  );

  // Filter Audit Logs for this ticket
  const ticketLogs = auditLogs.filter(l => l.ticketId === ticket.id);

  // Status badges
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'In Progress':
        return 'bg-[#ea580c]/10 text-amber-400 border-[#ea580c]/20';
      case 'On Hold':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Closed':
        return 'bg-[#18233c] text-slate-400 border-slate-705';
    }
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'Urgent': return 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold';
      case 'High': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Low': return 'bg-[#18233c] text-white border-slate-705';
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(ticket.id, commentText.trim(), isInternal);
    setCommentText('');
    setIsInternal(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStagedStatus(e.target.value as TicketStatus);
  };

  const handleStatusSubmit = () => {
    updateTicketStatus(ticket.id, stagedStatus);
    setStatusSaveSuccess(true);
    setTimeout(() => {
      setStatusSaveSuccess(false);
    }, 2000);
  };

  const handleAssignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    assignTicket(ticket.id, e.target.value);
  };

  const isUserOwner = currentUser?.id === ticket.userId;

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-105 transition cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4 text-blue-450" />
          Back to Ticket Queue
        </button>
        
        <div className="flex items-center gap-2 self-start sm:self-auto text-slate-450">
          <span className="text-xs font-bold font-mono text-blue-400">ID: {ticket.id}</span>
          <span>•</span>
          <span className="text-xs font-bold">Last Modified: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Side: Ticket details & Comments */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Detailed Card */}
          <div className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-6 md:p-8 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 text-[10px] font-bold border rounded uppercase leading-none ${getStatusBadge(ticket.status)}`}>
                  ● {ticket.status}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-bold border rounded uppercase leading-none ${getPriorityBadge(ticket.priority)}`}>
                  {ticket.priority} Priority
                </span>
                <span className="px-2.5 py-1 text-[10px] uppercase font-bold bg-[#141f35] border border-slate-700/60 text-slate-300 rounded flex items-center gap-1">
                  <Tag className="w-3 h-3 text-blue-400" />
                  {ticket.category}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight leading-snug">
                {ticket.subject}
              </h1>

              <div className="flex items-center gap-3 bg-[#142038] p-3 rounded-xl border border-slate-700/40">
                <div className="w-9 h-9 bg-blue-600/20 text-blue-300 rounded-full flex items-center justify-center font-bold text-sm shadow-inner uppercase shrink-0 border border-blue-500/10">
                  {ticket.userName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{ticket.userName}</p>
                  <p className="text-[10px] text-slate-450 flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blue-450" />
                    Submitted on {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Description / Details</span>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap select-text font-medium">
                {ticket.description}
              </p>
            </div>

            {ticket.screenshotUrl && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  <Paperclip className="w-3.5 h-3.5 text-blue-450" />
                  Screenshot attachment
                </span>
                <div className="inline-block bg-[#121c32]/50 rounded-xl p-2 border border-slate-800">
                  <a href={ticket.screenshotUrl} target="_blank" rel="noreferrer" className="block relative group overflow-hidden max-w-sm rounded-lg border border-slate-700/40">
                    <img 
                      src={ticket.screenshotUrl} 
                      alt="Attachment" 
                      className="max-h-[220px] object-cover hover:scale-103 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-[#060a13]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="text-xs text-blue-200 font-bold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Expand Attachment
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Comments/Logs Timeline */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-455" />
              Communication log ({ticketComments.length})
            </h3>

            <div className="space-y-4">
              {ticketComments.length === 0 ? (
                <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-6 text-center text-xs text-slate-450 font-bold">
                  No comments logged yet. Start communication using the comment composer below.
                </div>
              ) : (
                ticketComments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`p-4 rounded-2xl border transition ${
                      comment.isInternal 
                        ? 'bg-[#fbbf24]/10 border-[#fbbf24]/20 shadow-sm text-amber-200' 
                        : comment.userRole === 'Super Admin' || comment.userRole === 'Supervisor'
                          ? 'bg-[#1e40af]/10 border-[#3b82f6]/20 shadow-inner'
                          : 'bg-[#0d1527] border-slate-800/80 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-200">{comment.userName}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 rounded uppercase ${
                          comment.userRole === 'Super Admin' || comment.userRole === 'Supervisor'
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/10' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}>
                          {comment.userRole}
                        </span>
                        {comment.isInternal && (
                          <span className="text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold px-1.5 rounded uppercase flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Internal Note
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-450 font-bold">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-350 text-xs leading-relaxed select-text whitespace-pre-wrap font-medium">
                      {comment.commentText}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form Composer */}
            {!canTakeAction ? (
              <div id="restricted-box" className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm">
                <span className="text-amber-400 font-bold text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  Point 4 Guard: Commenting is locked. Only the ticket creator or assignee can take actions on this ticket.
                </span>
              </div>
            ) : (
              <form onSubmit={handlePostComment} className="bg-[#0d1527] rounded-2xl p-4 border border-slate-800/85 shadow-sm space-y-4">
                <div>
                  <textarea
                    required
                    rows={3}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder={
                      isInternal 
                        ? "Write an internal IT-only worklog note..." 
                        : "Write a message to reply..."
                    }
                    className="w-full px-4 py-3 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-100 leading-relaxed placeholder-slate-505"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {isPrivilegedWriter && (
                      <button
                        type="button"
                        onClick={() => setIsInternal(!isInternal)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition cursor-pointer select-none border ${
                          isInternal 
                            ? 'bg-[#fbbf24]/10 text-amber-400 border-amber-500/20 shadow-sm' 
                            : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700/80'
                        }`}
                      >
                        {isInternal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {isInternal ? 'Locked to IT Internal Note' : 'Send as Public Comment'}
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Post Comment
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

        {/* Right Side: Admin action panel & logs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Action Control Panel */}
          <div className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-sm text-slate-100">Support Attributes</span>
            </div>

            {/* Support Staff Controls */}
            {!canTakeAction ? (
              <div className="space-y-4 bg-slate-900/60 p-4.5 rounded-2xl border border-dashed border-slate-805">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#fbbf24] flex items-center gap-1.5 leading-none">
                  <Lock className="w-3.5 h-3.5" /> Core Actions Locked
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Your identity is neither the creator ({ticket.userName}) nor assigned recipient department/user. Point 4 prevents modifications.
                </p>
                <div className="space-y-4 text-xs pt-1 border-t border-slate-800/40">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Queue Status</span>
                    <span className="text-xs font-bold text-blue-450 uppercase">{ticket.status}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Assigned Specialist</span>
                    <span className="text-xs font-semibold text-slate-300">{ticket.assignedTo || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status select - available to Agent, Supervisor, Super Admin if canTakeAction is verified */}
                <div>
                  <label className="block text-[10px] font-extrabold text-[#c2185b] uppercase tracking-widest mb-1.5">
                    Modify Ticket Status
                  </label>
                  <select
                    value={stagedStatus}
                    onChange={handleStatusChange}
                    className="w-full px-3 py-2.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-100 font-bold cursor-pointer"
                  >
                    <option value="Open" className="bg-[#141f35]">🔵 Open Queue</option>
                    <option value="In Progress" className="bg-[#141f35]">🟡 In Progress</option>
                    <option value="On Hold" className="bg-[#141f35]">🟣 On Hold</option>
                    <option value="Resolved" className="bg-[#141f35]">🟢 Resolved</option>
                    <option value="Closed" className="bg-[#141f35]">⚪ Closed</option>
                  </select>

                  {stagedStatus !== ticket.status && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <p className="text-[10px] font-bold text-amber-300 leading-normal">
                        ⚠️ Status modified locally. Click "Submit" to save.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleStatusSubmit}
                          className="flex-1 py-1.5 px-3 bg-[#c2185b] hover:bg-[#ad144e] active:bg-[#880e4f] text-white text-[11px] font-extrabold rounded-lg shadow hover:scale-[1.01] transition duration-150 cursor-pointer"
                        >
                          Submit Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setStagedStatus(ticket.status)}
                          className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition border border-slate-700/60 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {statusSaveSuccess && (
                    <div className="mt-2 p-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-lg text-center animate-feed">
                      ✓ Status updated successfully!
                    </div>
                  )}
                </div>

                {/* Assignment - only available to Super Admin and Supervisor */}
                {['Super Admin', 'Supervisor'].includes(currentUser?.role || '') ? (
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#38bdf8] uppercase tracking-widest mb-1.5">
                      Assign IT Specialist
                    </label>
                    <select
                      value={ticket.assignedTo || ''}
                      onChange={handleAssignChange}
                      className="w-full px-3 py-2.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-100 font-bold"
                    >
                      <option value="" className="bg-[#141f35]">👤 Unassigned</option>
                      {users.map(u => (
                        <option key={u.id} value={u.name} className="bg-[#141f35]">
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">
                      Assigned IT Specialist
                    </span>
                    <div className="p-3 bg-[#10192d] border border-slate-800/80 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400">Specialist:</span>
                      <span className="text-xs font-semibold text-slate-300">{ticket.assignedTo || 'Unassigned'}</span>
                    </div>
                  </div>
                )}

                {/* Individual close action for ticket creator */}
                {isCreatedByMe && ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                  <button
                    onClick={() => updateTicketStatus(ticket.id, 'Closed')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-205 text-xs font-bold rounded-lg transition border border-slate-700/60 cursor-pointer"
                  >
                    Close Support Ticket
                  </button>
                )}
              </div>
            )}

            {(ticket.assignedBy || ticket.assignedDepartment) && (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                {ticket.assignedBy && (
                  <div>
                    <span className="block text-[10px] font-bold text-slate-450 tracking-wider uppercase mb-1">
                      Assigned User
                    </span>
                    <div className="p-3 bg-[#10192d] border border-slate-800 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-455 font-bold">Assigned To:</span>
                      <span className="text-xs font-bold text-slate-200">{ticket.assignedBy}</span>
                    </div>
                  </div>
                )}

                {ticket.assignedDepartment && (
                  <div>
                    <span className="block text-[10px] font-bold text-slate-450 tracking-wider uppercase mb-1">
                      Assigned Department
                    </span>
                    <div className="p-3 bg-[#10192d] border border-slate-850 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-455 font-bold">Department:</span>
                      <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                        {ticket.assignedDepartment}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audit Action Log Panel */}
          <div className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Audit Log History</span>
            
            <div className="relative border-l-2 border-slate-800 ml-2.5 pl-4 space-y-4">
              {ticketLogs.map((log) => (
                <div key={log.id} className="relative">
                  <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#121c32]" />
                  <p className="text-[11px] font-extrabold text-slate-200 leading-none">{log.action}</p>
                  <div className="flex items-center gap-1 text-[9px] text-slate-450 mt-1">
                    <span>By {log.performedBy}</span>
                    <span>•</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
