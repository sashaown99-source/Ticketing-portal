import React, { useState } from 'react';
import { 
  BLUEPRINT_SQL, 
  BLUEPRINT_PHP_CONN, 
  BLUEPRINT_PHP_AUTH, 
  BLUEPRINT_PHP_TICKET, 
  BLUEPRINT_PHP_ADMIN, 
  BLUEPRINT_INSTRUCTIONS 
} from '../data/exportBlueprints';
import { 
  FileText, 
  Database, 
  Download, 
  Copy, 
  Check, 
  Code, 
  BookOpen, 
  FolderTree, 
  ChevronRight,
  ShieldCheck 
} from 'lucide-react';

export default function BlueprintDownloader() {
  const [activeTab, setActiveTab] = useState<'sql' | 'php_conn' | 'php_auth' | 'php_ticket' | 'php_admin' | 'instructions'>('instructions');
  const [copied, setCopied] = useState(false);

  const getActiveContent = () => {
    switch (activeTab) {
      case 'sql': return BLUEPRINT_SQL;
      case 'php_conn': return BLUEPRINT_PHP_CONN;
      case 'php_auth': return BLUEPRINT_PHP_AUTH;
      case 'php_ticket': return BLUEPRINT_PHP_TICKET;
      case 'php_admin': return BLUEPRINT_PHP_ADMIN;
      case 'instructions': return BLUEPRINT_INSTRUCTIONS;
    }
  };

  const getFileName = () => {
    switch (activeTab) {
      case 'sql': return 'schema.sql';
      case 'php_conn': return 'db_conn.php';
      case 'php_auth': return 'auth.php';
      case 'php_ticket': return 'create_ticket.php';
      case 'php_admin': return 'admin_dashboard.php';
      case 'instructions': return 'SETUP_GUIDE.md';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([getActiveContent()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = getFileName();
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Quick download helper for ALL files as single block or zip notes
  const downloadAllBlueprints = () => {
    const allText = `# IT Support Ticket Web Portal Blueprint Deliverables

=========================================
1. DATABASE SQL SCHEMA (schema.sql)
=========================================
${BLUEPRINT_SQL}

=========================================
2. DATABASE CONNECTION (db_conn.php)
=========================================
${BLUEPRINT_PHP_CONN}

=========================================
3. AUTH MODULE (auth.php)
=========================================
${BLUEPRINT_PHP_AUTH}

=========================================
4. TICKET CREATION (create_ticket.php)
=========================================
${BLUEPRINT_PHP_TICKET}

=========================================
5. ADMIN ENDPOINT (admin_dashboard.php)
=========================================
${BLUEPRINT_PHP_ADMIN}

=========================================
6. SETUP INSTRUCTIONS (SETUP_GUIDE.md)
=========================================
${BLUEPRINT_INSTRUCTIONS}
`;
    const element = document.createElement("a");
    const file = new Blob([allText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "id_support_all_blueprints.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            PHP & MySQL Production Blueprints
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Deliverables & Source Blueprints</h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-4">
            Below you will find the complete set of deliverables requested. Each component follows standard best practices: Secure PDO prepared statements to defend against SQL injections, standard BCrypt password hashing, and clean Bootstrap 5 structural formatting.
          </p>
          <button
            onClick={downloadAllBlueprints}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-900 border border-transparent font-medium rounded-xl text-xs hover:bg-blue-50 hover:shadow-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-900" />
            Download Consolidated Source Package (.TXT)
          </button>
        </div>
        
        {/* Decorative Grid SVG in background */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-12 translate-x-12">
          <Database className="w-96 h-96" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Side: Folder Tree & Blueprint Navigation */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Deliverables Structure Blueprint */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <FolderTree className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-sm text-slate-800">Project Folder Structure</h3>
            </div>
            
            <div className="font-mono text-xs text-slate-600 space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-slate-800 font-semibold text-blue-900">📂 it-support-portal/</div>
              <div className="pl-4">├── 📂 uploads/ <span className="text-slate-400 text-[10px]">(R/W screenshot store)</span></div>
              <div className="pl-4">├── 📄 schema.sql <span className="text-slate-400 text-[10px]">(Tables & seeds)</span></div>
              <div className="pl-4">├── 📄 db_conn.php <span className="text-slate-400 text-[10px]">(PDO Connector)</span></div>
              <div className="pl-4">├── 📄 auth.php <span className="text-slate-400 text-[10px]">(Role & Sign-in logic)</span></div>
              <div className="pl-4">├── 📄 create_ticket.php <span className="text-slate-400 text-[10px]">(User upload)</span></div>
              <div className="pl-4 font-semibold text-blue-700">├── 📄 ticket_details.php <span className="text-slate-400 text-[10px]">(Staff & User review)</span></div>
              <div className="pl-4">├── 📄 admin_dashboard.php <span className="text-slate-400 text-[10px]">(IT Stats & Queue)</span></div>
              <div className="pl-4">├── 📄 login.php <span className="text-slate-400 text-[10px]">(Authorization form)</span></div>
              <div className="pl-4">├── 📂 css/</div>
              <div className="pl-8">└── 📄 bootstrap.min.css</div>
              <div className="pl-4">📂 instructions/</div>
              <div className="pl-8">└── 📄 SETUP_GUIDE.md</div>
            </div>
          </div>

          {/* Files List Navigation */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-2">Source Files Blueprint</span>
            
            <button
              onClick={() => setActiveTab('instructions')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                activeTab === 'instructions' 
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-105' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                SETUP_GUIDE.md
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                activeTab === 'sql' 
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-105' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                schema.sql
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('php_conn')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                activeTab === 'php_conn' 
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-105' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5" />
                db_conn.php
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('php_auth')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                activeTab === 'php_auth' 
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-105' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5" />
                auth.php
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('php_ticket')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                activeTab === 'php_ticket' 
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-105' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5" />
                create_ticket.php
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('php_admin')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                activeTab === 'php_admin' 
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-105' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5" />
                admin_dashboard.php
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

          </div>
        </div>

        {/* Right Side: Code Viewer Panel */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
            <div>
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-800">{getFileName()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1 px-3 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Code
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1 px-3 text-xs bg-blue-600 text-white border border-transparent rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                </div>
              </div>

              {/* Code Panel */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 overflow-x-auto max-h-[550px]">
                <pre className="font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {getActiveContent()}
                </pre>
              </div>
            </div>

            {/* Note about real stack integration */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50/50 border border-blue-105 text-xs text-slate-600 leading-relaxed">
              <strong>💡 Production Architecture Advice:</strong> The database model provides automatic audit indices, standard enum blocks, and sets explicit cascades. When converting files, remember to set custom uploads folders write-permissions as explained in the <strong>SETUP_GUIDE.md</strong> instructions tab on your server container.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
