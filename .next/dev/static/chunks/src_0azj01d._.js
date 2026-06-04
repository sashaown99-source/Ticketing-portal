(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/data/dummyData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DUMMY_AUDIT_LOGS",
    ()=>DUMMY_AUDIT_LOGS,
    "DUMMY_COMMENTS",
    ()=>DUMMY_COMMENTS,
    "DUMMY_TICKETS",
    ()=>DUMMY_TICKETS,
    "DUMMY_USERS",
    ()=>DUMMY_USERS
]);
const DUMMY_USERS = [
    {
        id: 'emp1',
        name: 'Sasha',
        email: 'sashaown99@gmail.com',
        role: 'Admin access',
        username: 'sashaown',
        employeeId: 'EMP-001',
        department: 'Corporate Admin',
        password: 'password',
        avatarUrl: undefined
    }
];
const DUMMY_TICKETS = [];
const DUMMY_COMMENTS = [];
const DUMMY_AUDIT_LOGS = [];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/supabaseClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseConfig",
    ()=>getSupabaseConfig,
    "recreateSupabaseClient",
    ()=>recreateSupabaseClient,
    "resetSupabaseConfig",
    ()=>resetSupabaseConfig,
    "setSupabaseConfig",
    ()=>setSupabaseConfig,
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
// Default user-provided credentials
const DEFAULT_PROJECT_ID = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.VITE_SUPABASE_PROJECT_ID || 'savzqksbvknxrcxctfto';
const DEFAULT_ANON_KEY = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdnpxa3NidmtueHJjeGN0ZnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNzQ1ODgsImV4cCI6MjA5NTk1MDU4OH0.XyO-HGIKUtTRV57KaM-K13ThrRZcApaRg1yBN-5IxoU") || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_oRrGv5TW-0LU6xE5N2aHiA_jSO-hMea';
const getSupabaseConfig = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const savedId = localStorage.getItem('supabase_project_id');
    const savedKey = localStorage.getItem('supabase_anon_key');
    const projectId = savedId || DEFAULT_PROJECT_ID;
    const anonKey = savedKey || DEFAULT_ANON_KEY;
    const url = `https://${projectId}.supabase.co`;
    return {
        projectId,
        anonKey,
        url
    };
};
const setSupabaseConfig = (projectId, anonKey)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        localStorage.setItem('supabase_project_id', projectId);
        localStorage.setItem('supabase_anon_key', anonKey);
    }
};
const resetSupabaseConfig = ()=>{
    if ("TURBOPACK compile-time truthy", 1) {
        localStorage.removeItem('supabase_project_id');
        localStorage.removeItem('supabase_anon_key');
    }
};
const config = getSupabaseConfig();
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(config.url, config.anonKey, {
    auth: {
        persistSession: true
    }
});
const recreateSupabaseClient = (projectId, anonKey)=>{
    const url = `https://${projectId}.supabase.co`;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, anonKey, {
        auth: {
            persistSession: true
        }
    });
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/AppContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$dummyData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/dummyData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabaseClient.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
// One-time migration to clean up legacy data structures safely at the module level
if ("TURBOPACK compile-time truthy", 1) {
    const migrated = localStorage.getItem('it_migration_v2');
    if (!migrated) {
        localStorage.removeItem('it_current_user');
        localStorage.removeItem('it_users');
        localStorage.removeItem('it_tickets');
        localStorage.removeItem('it_comments');
        localStorage.removeItem('it_audit_logs');
        localStorage.setItem('it_migration_v2', 'done');
    }
}
const AppProvider = ({ children })=>{
    _s();
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$dummyData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_USERS"]);
    const [tickets, setTickets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$dummyData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_TICKETS"]);
    const [comments, setComments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$dummyData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_COMMENTS"]);
    const [auditLogs, setAuditLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$dummyData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DUMMY_AUDIT_LOGS"]);
    const fetchDataFromSupabase = async ()=>{
        try {
            const { data: dbUsers, error: uErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_users').select('*');
            if (uErr) throw uErr;
            const { data: dbTickets, error: tErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_tickets').select('*').order('createdAt', {
                ascending: false
            });
            if (tErr) throw tErr;
            const { data: dbComments, error: cErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_comments').select('*').order('createdAt', {
                ascending: true
            });
            if (cErr) throw cErr;
            const { data: dbAudit, error: aErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_audit_logs').select('*').order('createdAt', {
                ascending: false
            });
            if (aErr) throw aErr;
            setUsers(dbUsers || []);
            setTickets(dbTickets || []);
            setComments(dbComments || []);
            setAuditLogs(dbAudit || []);
            console.log('Successfully synchronized state with Supabase PostgreSQL tables.');
        } catch (err) {
            console.warn('Supabase fetch failed:', err.message);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            // 1. Initial check of session
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession().then({
                "AppProvider.useEffect": ({ data: { session } })=>{
                    handleAuthSession(session);
                }
            }["AppProvider.useEffect"]);
            // 2. Auth State Change Listener
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "AppProvider.useEffect": async (event, session)=>{
                    handleAuthSession(session);
                }
            }["AppProvider.useEffect"]);
            async function handleAuthSession(session) {
                if (session?.user) {
                    const { data: profile, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_users').select('*').eq('id', session.user.id).maybeSingle();
                    if (!error && profile) {
                        setCurrentUser(profile);
                    } else {
                        const fallbackProfile = {
                            id: session.user.id,
                            email: session.user.email || '',
                            name: session.user.email?.split('@')[0] || 'Auth User',
                            role: 'agent',
                            isActive: true
                        };
                        setCurrentUser(fallbackProfile);
                    }
                    fetchDataFromSupabase();
                } else {
                    setCurrentUser(null);
                }
            }
            return ({
                "AppProvider.useEffect": ()=>{
                    subscription.unsubscribe();
                }
            })["AppProvider.useEffect"];
        }
    }["AppProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            localStorage.setItem('it_current_user', currentUser ? JSON.stringify(currentUser) : '');
        }
    }["AppProvider.useEffect"], [
        currentUser
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            localStorage.setItem('it_users', JSON.stringify(users));
        }
    }["AppProvider.useEffect"], [
        users
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            localStorage.setItem('it_tickets', JSON.stringify(tickets));
        }
    }["AppProvider.useEffect"], [
        tickets
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            localStorage.setItem('it_comments', JSON.stringify(comments));
        }
    }["AppProvider.useEffect"], [
        comments
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            localStorage.setItem('it_audit_logs', JSON.stringify(auditLogs));
        }
    }["AppProvider.useEffect"], [
        auditLogs
    ]);
    const registerUser = async (name, email, role, username, employeeId, department, password)=>{
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                role,
                username,
                employeeId,
                department,
                password
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to register user');
        await fetchDataFromSupabase();
        return data;
    };
    const updateUser = async (id, name, email, role, username, employeeId, department, password, isActive)=>{
        const res = await fetch('/api/users', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id,
                name,
                email,
                role,
                username,
                employeeId,
                department,
                password,
                isActive
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update user');
        await fetchDataFromSupabase();
    };
    const deleteUser = async (id)=>{
        const res = await fetch(`/api/users?id=${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete user');
        await fetchDataFromSupabase();
    };
    const addTicket = (subject, description, category, priority, screenshotUrl, assignedBy, assignedDepartment, assignedRole)=>{
        if (!currentUser) return;
        const newId = `TCK-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(3, '0')}`;
        const newTicket = {
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
        // Create audit log
        const newLog = {
            id: `LOG-${Date.now()}`,
            ticketId: newId,
            action: `Created ticket assigned to role: ${assignedRole || 'Unassigned'}`,
            performedBy: currentUser.name,
            createdAt: new Date().toISOString()
        };
        // Send to Supabase directly
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_tickets').insert(newTicket).then(({ error })=>{
            if (error) {
                console.error('Supabase error during addTicket (ticket):', error);
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_audit_logs').insert(newLog).then(({ error })=>{
                    if (error) console.error('Supabase error during addTicket (audit):', error);
                    fetchDataFromSupabase();
                });
            }
        });
    };
    const addComment = (ticketId, commentText, isInternal)=>{
        if (!currentUser) return;
        const currentTimestamp = new Date().toISOString();
        const newComment = {
            id: `COM-${Date.now()}`,
            ticketId,
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            commentText,
            isInternal,
            createdAt: currentTimestamp
        };
        // Audit log
        const newLog = {
            id: `LOG-${Date.now()}`,
            ticketId,
            action: isInternal ? 'Added Internal Comment' : 'Added Public Comment',
            performedBy: currentUser.name,
            createdAt: currentTimestamp
        };
        // Send to Supabase directly
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_comments').insert(newComment).then(({ error })=>{
            if (error) {
                console.error('Supabase error during addComment (comment):', error);
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_tickets').update({
                    updatedAt: currentTimestamp
                }).eq('id', ticketId).then(()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_audit_logs').insert(newLog).then(()=>{
                        fetchDataFromSupabase();
                    });
                });
            }
        });
    };
    const updateTicketStatus = (ticketId, newStatus)=>{
        if (!currentUser) return;
        const currentTimestamp = new Date().toISOString();
        // Audit log
        const newLog = {
            id: `LOG-${Date.now()}`,
            ticketId,
            action: `Status changed to ${newStatus}`,
            performedBy: currentUser.name,
            createdAt: currentTimestamp
        };
        // Send to Supabase directly
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_tickets').update({
            status: newStatus,
            updatedAt: currentTimestamp
        }).eq('id', ticketId).then(({ error })=>{
            if (error) {
                console.error('Supabase error during updateTicketStatus (ticket):', error);
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_audit_logs').insert(newLog).then(()=>{
                    fetchDataFromSupabase();
                });
            }
        });
    };
    const assignTicket = (ticketId, assignedToName)=>{
        if (!currentUser) return;
        const currentTimestamp = new Date().toISOString();
        // Audit Log
        const newLog = {
            id: `LOG-${Date.now()}`,
            ticketId,
            action: `Assigned to ${assignedToName}`,
            performedBy: currentUser.name,
            createdAt: currentTimestamp
        };
        // Send to Supabase directly
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_tickets').update({
            assignedTo: assignedToName,
            updatedAt: currentTimestamp
        }).eq('id', ticketId).then(({ error })=>{
            if (error) {
                console.error('Supabase error during assignTicket (ticket):', error);
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sheba_audit_logs').insert(newLog).then(()=>{
                    fetchDataFromSupabase();
                });
            }
        });
    };
    const resetState = ()=>{
        setCurrentUser(null);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
        setUsers([]);
        setTickets([]);
        setComments([]);
        setAuditLogs([]);
    };
    const importDatabaseState = (data)=>{
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
            const existsInNew = data.users.find((u)=>u.id === currentUser.id);
            if (existsInNew) {
                setCurrentUser(existsInNew);
            }
        }
    };
    const addUserToLocalState = (newUser)=>{
        setUsers((prev)=>{
            const match = prev.find((u)=>u.id === newUser.id || u.email.toLowerCase() === newUser.email.toLowerCase());
            if (match) {
                return prev.map((u)=>u.id === newUser.id || u.email.toLowerCase() === newUser.email.toLowerCase() ? newUser : u);
            }
            return [
                ...prev,
                newUser
            ];
        });
    };
    // Filter tickets by user's role access to ensure they only see what is relevant:
    // "jake jei role er access dawha hobe tara sudu er related ticket nia kaj korte parbe"
    const visibleTickets = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "AppProvider.useMemo[visibleTickets]": ()=>{
            if (!currentUser) return [];
            // Master Admin access role can see everything
            if (currentUser.role === 'Admin access') return tickets;
            // Let's filter tickets:
            // 1. Author of the ticket (can always see their own creations)
            // 2. The ticket is assigned to their specific Role (e.g., 'IT', 'HR', 'Finance', 'Manager', 'Supervisor', 'Admin', 'agent')
            // 3. Or they are explicitly designated as the assignee (assignedTo === currentUser.name)
            return tickets.filter({
                "AppProvider.useMemo[visibleTickets]": (t)=>{
                    const isOwner = t.userId === currentUser.id;
                    const isRoleMatched = t.assignedRole === currentUser.role;
                    const isExplicitAssignee = t.assignedTo === currentUser.name;
                    return isOwner || isRoleMatched || isExplicitAssignee;
                }
            }["AppProvider.useMemo[visibleTickets]"]);
        }
    }["AppProvider.useMemo[visibleTickets]"], [
        tickets,
        currentUser
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
        value: {
            currentUser,
            users,
            tickets: visibleTickets,
            comments,
            auditLogs,
            setCurrentUser,
            registerUser,
            updateUser,
            deleteUser,
            addTicket,
            addComment,
            updateTicketStatus,
            assignTicket,
            resetState,
            importDatabaseState,
            addUserToLocalState
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AppContext.tsx",
        lineNumber: 414,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AppProvider, "oAQcc80/uTss55BQcIYwkQYXc4Q=");
_c = AppProvider;
const useApp = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
    if (!context) {
        throw new Error('useApp must be used inside AppProvider');
    }
    return context;
};
_s1(useApp, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AppProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0azj01d._.js.map