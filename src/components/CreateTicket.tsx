import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TicketCategory, TicketPriority } from '../types';
import { FileUp, Clipboard, ShieldAlert, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'motion/react';

interface CreateTicketComponentProps {
  onSuccess: () => void;
}

export default function CreateTicket({ onSuccess }: CreateTicketComponentProps) {
  const { addTicket, users } = useApp();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Software');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [assignedBy, setAssignedBy] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState<'IT' | 'Admin' | 'HR' | 'Finance' | 'Manager' | ''>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!subject.trim() || !description.trim()) return;
 
     // Call state creator
     addTicket(
       subject.trim(),
       description.trim(),
       category,
       priority,
       previewImage || undefined,
       assignedBy || undefined,
       assignedDepartment || undefined
     );
 
     // Reset standard states
     setSubject('');
     setDescription('');
     setCategory('Software');
     setPriority('Medium');
     setAssignedBy('');
     setAssignedDepartment('');
     setPreviewImage('');
     setFileName('');
 
     onSuccess();
   };

  // Preset mock images for quick demonstration files
  const choosePresetMockImg = (url: string, name: string) => {
    setPreviewImage(url);
    setFileName(name);
  };

  const BACKGROUND_MOCK_ATTACHMENTS = [
    { name: 'screen_crash.png', url: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=600' },
    { name: 'vpn_err_log.png', url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600' },
    { name: 'battery_swall.png', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' },
  ];

  return (
    <div className="bg-[#0d1527] rounded-2xl border border-slate-800/80 p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/10">
          <Clipboard className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-slate-100">Create a New Ticket</h3>
          <p className="text-slate-400 text-xs font-medium">Raise a new support ticket. Our team responds within 2 hours.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* Main Form Fields */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2" htmlFor="ticket_subject">
                Issue Summary / Subject <span className="text-red-400">*</span>
              </label>
              <input
                id="ticket_subject"
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Broken keyboard layout on row 3 or Outlook crash..."
                className="w-full px-4 py-2.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-100 font-semibold placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2" htmlFor="ticket_desc">
                Detailed Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="ticket_desc"
                required
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please describe what occurred, when it started, and steps to reproduce. Add any error messages displayed."
                className="w-full px-4 py-2.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-200 leading-relaxed placeholder-slate-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Category Reference
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as TicketCategory)}
                  className="w-full px-3 py-2.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-200 font-semibold"
                >
                  <option value="Hardware" className="bg-[#141f35]">🔌 Hardware Configuration</option>
                  <option value="Software" className="bg-[#141f35]">💿 Software Installation</option>
                  <option value="Network" className="bg-[#141f35]">🌐 Network & VPN Access</option>
                  <option value="admin portal issue" className="bg-[#141f35]">🖥️ admin portal issue</option>
                  <option value="Desk Issue" className="bg-[#141f35]">🗂️ Desk Issue</option>
                  <option value="Others" className="bg-[#141f35]">🧩 Others / Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Priority Urgency
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-200 font-semibold"
                >
                  <option value="Low" className="bg-[#141f35]">🟢 Low - Standard Request</option>
                  <option value="Medium" className="bg-[#141f35]">🟡 Medium - General Support</option>
                  <option value="High" className="bg-[#141f35]">🟠 High - Disrupting Workflow</option>
                  <option value="Urgent" className="bg-[#141f35]">🔴 Urgent - System Locked / Dead</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Assign by (User)
                </label>
                <select
                  value={assignedBy}
                  onChange={e => setAssignedBy(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-200 font-semibold"
                >
                  <option value="" className="bg-[#141f35]">👤 Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.name} className="bg-[#141f35]">
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Assign Department
                </label>
                <select
                  value={assignedDepartment}
                  onChange={e => setAssignedDepartment(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] transition text-slate-200 font-semibold"
                >
                  <option value="" className="bg-[#141f35]">🏢 Unassigned</option>
                  <option value="IT" className="bg-[#141f35]">IT</option>
                  <option value="Admin" className="bg-[#141f35]">Admin</option>
                  <option value="HR" className="bg-[#141f35]">HR</option>
                  <option value="Finance" className="bg-[#141f35]">Finance</option>
                  <option value="Manager" className="bg-[#141f35]">Manager</option>
                </select>
              </div>
            </div>
          </div>

          {/* Screenshot Upload Block */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <span className="block text-xs font-bold text-slate-300 mb-2">
                Screenshot / Evidence
              </span>
              
              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col items-center justify-center min-h-[160px] relative cursor-pointer ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-slate-800 hover:border-blue-500 bg-[#141f35]'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {previewImage ? (
                  <div className="relative w-full h-full min-h-[140px] flex items-center justify-center">
                    <img 
                      src={previewImage} 
                      alt="Upload Preview" 
                      className="max-h-[140px] rounded-lg object-contain border border-slate-750 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-750 transition cursor-pointer shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <FileUp className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-xs font-bold text-slate-300">Drag & drop image here</span>
                    <span className="text-[10px] text-slate-450 mt-1">Accepts PNG, JPG (Max 5MB)</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Presets helper */}
            {!previewImage && (
              <div className="rounded-xl border border-slate-800 bg-[#121c33]/40 p-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block mb-2">Simulate upload attaching</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {BACKGROUND_MOCK_ATTACHMENTS.map((at, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => choosePresetMockImg(at.url, at.name)}
                      className="p-1 text-[9px] font-bold text-slate-300 bg-[#1a253e] border border-slate-700/50 rounded hover:bg-[#253254] transition text-center truncate cursor-pointer"
                    >
                      {at.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {previewImage && (
              <div className="flex items-center gap-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 font-semibold">
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate flex-1 font-mono">{fileName || 'screenshot_file.png'} uploaded</span>
              </div>
            )}

          </div>

        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-500/10 cursor-pointer"
          >
            Create Support Ticket
          </button>
        </div>
      </form>
    </div>
  );
}
