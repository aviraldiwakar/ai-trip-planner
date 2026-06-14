import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  Plus, 
  UserPlus, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Info,
  ChevronsRight,
  ClipboardList,
  LogIn,
  KeyRound
} from "lucide-react";
import Navbar from "./components/Navbar";
import PreferenceForm from "./components/PreferenceForm";
import TripResults from "./components/TripResults";
import { User, Group, Preference, TripResult, GroupMember } from "./types";

const MOCK_PRESET_USERS: User[] = [
  { userId: 1, name: "Aviral", email: "aviralj193@gmail.com" },
  { userId: 2, name: "John Doe", email: "john@example.com" },
  { userId: 3, name: "Alice Smith", email: "alice@example.com" }
];

export default function App() {
  // Session / Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_PRESET_USERS[0]);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Group States
  const [groupsList, setGroupsList] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMembersList, setGroupMembersList] = useState<GroupMember[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinGroupIdInput, setJoinGroupIdInput] = useState("");
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardSuccess, setDashboardSuccess] = useState<string | null>(null);

  // Preference & Calculation States
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [isSubmittingPref, setIsSubmittingPref] = useState(false);
  const [tripResult, setTripResult] = useState<TripResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [calculationStatus, setCalculationStatus] = useState<"idle" | "error" | "success">("idle");
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Fetch all groups user belongs to or list of overall groups
  const fetchGroups = async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}/groups`);
      if (res.ok) {
        const data = await res.json();
        setGroupsList(data);
        if (data.length > 0 && !currentGroup) {
          // Default to first group
          setCurrentGroup(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching user groups:", err);
    }
  };

  // Fetch preferences for the currently active group
  const fetchPreferences = async (groupId: number) => {
    try {
      const res = await fetch(`/api/preferences/group/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (err) {
      console.error("Error fetching group preferences:", err);
    }
  };

  // Fetch members of currently active group
  const fetchGroupMembers = async (groupId: number) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`);
      if (res.ok) {
        const data = await res.json();
        setGroupMembersList(data);
      }
    } catch (err) {
      console.error("Error fetching group members:", err);
    }
  };

  // Fetch everything upon group changes or user login
  useEffect(() => {
    if (currentUser) {
      fetchGroups(currentUser.userId);
    } else {
      setGroupsList([]);
      setCurrentGroup(null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentGroup) {
      fetchPreferences(currentGroup.groupId);
      fetchGroupMembers(currentGroup.groupId);
      // Reset prior generation display
      setTripResult(null);
      setCalculationStatus("idle");
      setCalculationError(null);
    } else {
      setPreferences([]);
      setGroupMembersList([]);
    }
  }, [currentGroup]);

  // Handle Switching active sandbox role
  const handleQuickSwitch = (userId: number) => {
    const selected = MOCK_PRESET_USERS.find(u => u.userId === userId);
    if (selected) {
      setCurrentUser(selected);
      setDashboardSuccess(`Role updated! You are now viewing the application as ${selected.name}.`);
      setTimeout(() => setDashboardSuccess(null), 3000);
    }
  };

  // Auth Submit Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (authMode === "register") {
      if (!authName || !authEmail || !authPassword) {
        setAuthError("Please fill out name, email, and password to register.");
        return;
      }
      if (!emailPattern.test(authEmail)) {
        setAuthError("Please enter a valid email address.");
        return;
      }

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: authName, email: authEmail, password: authPassword })
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser({ userId: data.userId, name: data.name, email: data.email });
          setAuthName("");
          setAuthEmail("");
          setAuthPassword("");
        } else {
          setAuthError(data.message || "Registration failed.");
        }
      } catch {
        setAuthError("Network error. Registration offline.");
      }
    } else {
      // Login
      if (!authEmail || !authPassword) {
        setAuthError("Both email and password credentials are required.");
        return;
      }

      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser({ userId: data.userId, name: data.name, email: data.email });
          setAuthEmail("");
          setAuthPassword("");
        } else {
          setAuthError(data.message || "Invalid credentials.");
        }
      } catch {
        setAuthError("Network connection failed.");
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTripResult(null);
    setCalculationStatus("idle");
  };

  // Group Management Action Handlers
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setDashboardError(null);
    setDashboardSuccess(null);

    if (!newGroupName || !newGroupName.trim()) {
      setDashboardError("Please input a valid group name to create.");
      return;
    }
    if (!currentUser) return;

    try {
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName: newGroupName, userId: currentUser.userId })
      });
      const data = await res.json();
      if (res.ok) {
        setDashboardSuccess(`Group "${newGroupName}" successfully created!`);
        setNewGroupName("");
        // Reload groups
        await fetchGroups(currentUser.userId);
        // Set newly created group as current
        setCurrentGroup({ groupId: data.group_id, groupName: data.group_name, createdBy: data.created_by });
      } else {
        setDashboardError(data.message || "Failed to create group.");
      }
    } catch {
      setDashboardError("Error connecting to server.");
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setDashboardError(null);
    setDashboardSuccess(null);

    if (!joinGroupIdInput || !joinGroupIdInput.trim()) {
      setDashboardError("Please enter a Group ID number to join.");
      return;
    }
    const groupId = parseInt(joinGroupIdInput);
    if (isNaN(groupId)) {
      setDashboardError("Group ID must be an integer sequence.");
      return;
    }
    if (!currentUser) return;

    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, userId: currentUser.userId })
      });
      const data = await res.json();
      if (res.ok) {
        setDashboardSuccess(`Successfully joined Group: "${data.group_name}"`);
        setJoinGroupIdInput("");
        await fetchGroups(currentUser.userId);
        setCurrentGroup({ groupId: data.group_id, groupName: data.group_name, createdBy: 1 });
      } else {
        setDashboardError(data.message || "Failed to enrol in group.");
      }
    } catch {
      setDashboardError("Error connecting to group registry database.");
    }
  };

  // Preference submission handler
  const handlePreferenceSubmit = async (prefData: { destinationName: string; fromDate: string; toDate: string; priorityScore: number }) => {
    if (!currentUser || !currentGroup) return;
    setIsSubmittingPref(true);

    try {
      const res = await fetch("/api/preferences/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: currentGroup.groupId,
          userId: currentUser.userId,
          ...prefData
        })
      });
      const data = await res.json();
      if (res.ok) {
        setDashboardSuccess(`Preference for "${prefData.destinationName}" successfully added!`);
        setTimeout(() => setDashboardSuccess(null), 3000);
        // Refresh preferences table
        await fetchPreferences(currentGroup.groupId);
      } else {
        throw new Error(data.message || "Failed to submit preference.");
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmittingPref(false);
    }
  };

  // Trip consensus calculation trigger
  const handleCalculateConsensus = async () => {
    if (!currentGroup) return;
    setIsGenerating(true);
    setCalculationError(null);
    setCalculationStatus("idle");

    try {
      const res = await fetch("/api/trips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: currentGroup.groupId })
      });
      const data = await res.json();

      if (res.ok) {
        setTripResult(data);
        setCalculationStatus("success");
      } else {
        setCalculationStatus("error");
        setCalculationError(data.message || "Failed to compute group overlap analytics.");
      }
    } catch (err) {
      setCalculationStatus("error");
      setCalculationError("Connection timeout. Failed to fetch Python ML Recommendations.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col font-sans mb-10 text-slate-100">
      
      {/* Navbar Container with swift user swappers */}
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onQuickSwitch={handleQuickSwitch} 
        availableUsers={MOCK_PRESET_USERS}
      />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ======================================================== */}
        {/* LOGGED OUT GATE SCREEN (AUTH SYSTEM)                     */}
        {/* ======================================================== */}
        {!currentUser ? (
          <div className="mx-auto max-w-md mt-10">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                  <Compass className="h-6 w-6" />
                </div>
                <h2 className="mt-3 text-xl font-bold text-white">Welcome to CoRoute AI</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Collaborative data-driven trip planner with date overlap models & intelligent attribute matching.
                </p>
              </div>

              {authError && (
                <div className="mb-4 rounded-lg bg-rose-950/40 p-3 text-xs font-semibold text-rose-300 border border-rose-500/20">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" && (
                  <div>
                    <label id="lbl_reg_name" htmlFor="reg_name" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Full Name:
                    </label>
                    <input
                      id="reg_name"
                      type="text"
                      placeholder="Your name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-xs text-white focus:border-indigo-500/50 focus:bg-slate-950/60 focus:outline-none placeholder-slate-600"
                    />
                  </div>
                )}

                <div>
                  <label id="lbl_reg_email" htmlFor="reg_email" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Account:
                  </label>
                  <input
                    id="reg_email"
                    type="email"
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-xs text-white focus:border-indigo-500/50 focus:bg-slate-950/60 focus:outline-none placeholder-slate-600"
                  />
                </div>

                <div>
                  <label id="lbl_reg_pass" htmlFor="reg_pass" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex justify-between">
                    <span>Password:</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg_pass"
                      type="password"
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 pl-9 text-xs text-white focus:border-indigo-500/50 focus:bg-slate-950/60 focus:outline-none placeholder-slate-600"
                    />
                    <KeyRound className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-500/40 hover:bg-indigo-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  id="btn_auth_submit"
                >
                  <LogIn className="h-4 w-4" />
                  {authMode === "login" ? "Authenticate Account" : "Register Credentials"}
                </button>
              </form>

              {/* Toggle controls */}
              <div className="mt-5 text-center border-t border-white/5 pt-4">
                <button
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  {authMode === "login" 
                    ? "Don't have an account? Sign up" 
                    : "Already registered? Login to account"}
                </button>
              </div>

              {/* Demo Mode bypass helper */}
              <div className="mt-6 rounded-lg bg-slate-950/40 p-3 text-center border border-white/5">
                <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-2">Sandbox Bypass Login:</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {MOCK_PRESET_USERS.map((user) => (
                    <button
                      key={user.userId}
                      onClick={() => setCurrentUser(user)}
                      className="rounded bg-slate-900 border border-white/15 hover:border-indigo-500/50 hover:bg-slate-900/70 font-semibold px-2 py-1 text-[11px] text-slate-200 transition"
                    >
                      Login as <strong>{user.name}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          
          // ========================================================
          // LOGGED IN VIEWPORT                                       
          // ========================================================
          <div className="space-y-6">
            
            {/* Global Success / Warning Toasting Banner */}
            {dashboardSuccess && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-3 text-xs font-semibold text-emerald-400 shadow-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                {dashboardSuccess}
              </div>
            )}

            {/* A. Dashboard Row - Group switcher + creator */}
            <div className="grid gap-6 lg:grid-cols-3">
              
              {/* Group Quick switcher selectors */}
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-indigo-400" />
                    Collaborative Circles (Groups)
                  </h3>
                  <span className="rounded bg-indigo-500/20 border border-indigo-500/35 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                    Active Session Area
                  </span>
                </div>

                {groupsList.length === 0 ? (
                  <div className="py-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-white/10">
                    <Users className="mx-auto h-8 w-8 text-slate-500" />
                    <p className="mt-2 text-xs text-slate-400 font-medium">You are not joined in any travel group yet.</p>
                    <p className="text-[10px] text-slate-550 mt-1">Create or Join a group below to start planning.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label id="lbl_group_select" htmlFor="group_select" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Choose Planning Group:
                    </label>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {groupsList.map((group) => {
                        const isActive = currentGroup?.groupId === group.groupId;
                        return (
                          <button
                            key={group.groupId}
                            onClick={() => setCurrentGroup(group)}
                            className={`text-left p-3.5 rounded-xl border transition-all flex justify-between items-center ${
                              isActive
                                ? "bg-indigo-600 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                                : "bg-slate-950/40 border-white/10 text-slate-200 hover:border-white/20 hover:bg-white/5"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold">{group.groupName}</p>
                              <p className={`text-[9px] font-mono mt-0.5 ${isActive ? "text-indigo-200" : "text-slate-500"}`}>
                                GROUP ID: #{group.groupId}
                              </p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              isActive ? "bg-indigo-700/50 text-indigo-200" : "bg-slate-900 border border-white/5 text-slate-400"
                            }`}>
                              Active
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Group Creator & Joiner panel */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-2xl space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-slate-400" /> Manage Groups
                </h3>

                {dashboardError && (
                  <div className="rounded-lg bg-rose-955/40 p-2 text-[11px] font-semibold text-rose-300 border border-rose-500/20">
                    {dashboardError}
                  </div>
                )}

                {/* Create Form */}
                <form onSubmit={handleCreateGroup} className="space-y-2 pb-3.5 border-b border-white/5">
                  <label htmlFor="crt_name" className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                    Create New Circle:
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="crt_name"
                      type="text"
                      placeholder="e.g. Winter Skiing"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="flex-grow rounded-lg border border-white/10 bg-slate-950/40 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 placeholder-slate-600"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.4)] border border-indigo-500/40"
                      id="btn_create_grp"
                    >
                      Create
                    </button>
                  </div>
                </form>

                {/* Join Form */}
                <form onSubmit={handleJoinGroup} className="space-y-2">
                  <label htmlFor="jn_id" className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                    Join Existing (By ID):
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="jn_id"
                      type="text"
                      placeholder="Group ID #"
                      value={joinGroupIdInput}
                      onChange={(e) => setJoinGroupIdInput(e.target.value)}
                      className="flex-grow rounded-lg border border-white/10 bg-slate-950/40 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 placeholder-slate-600"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-800 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-750"
                      id="btn_join_grp"
                    >
                      Join
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* B. Main Application Core Workspace */}
            {currentGroup ? (
              <div className="space-y-6">

                {/* Subheader tracking group specifics */}
                <div className="flex items-center justify-between bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 shadow-2xl flex-wrap gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>Circle Active:</span>
                      <span className="text-indigo-400 font-extrabold">{currentGroup.groupName}</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Group Members enrolled ({groupMembersList.length}): {" "}
                      <span className="font-semibold text-slate-200">
                        {groupMembersList.map(m => m.name).join(", ")}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-slate-500 uppercase leading-none">Access Key</p>
                      <p className="text-xs font-mono font-extrabold text-indigo-400 leading-none mt-1">
                        Group ID #{currentGroup.groupId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Left/Right Workspace grid */}
                <div className="grid gap-6 md:grid-cols-5">
                  
                  {/* Left Column - Input Preference builder */}
                  <div className="md:col-span-2 space-y-6">
                    <PreferenceForm 
                      onSubmit={handlePreferenceSubmit} 
                      isSubmitting={isSubmittingPref} 
                    />

                    {/* Quick Helper Tips Panel */}
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 shrink-0 text-slate-400 text-xs leading-relaxed space-y-2">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1">
                        <Info className="h-4 w-4 text-indigo-600" /> Sandbox Collaborative Playground:
                      </h4>
                      <p>
                        To simulate different people adding trip requests, try registering or quick-switching accounts in the top navigation! Each user can submit a unique destination with preferred dates and priority scoring.
                      </p>
                      <p>
                        <strong>Note:</strong> Set overlapping timeline parameters (e.g. ranges inside August 2026) to see scheduling resolve successfully. If date calendars are completely decoupled, the Overlap Engine flags alignment validation warnings.
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Results, Calculations & AI Recommendations */}
                  <div className="md:col-span-3">
                    <TripResults 
                      result={tripResult} 
                      errorMsg={calculationError} 
                      isGenerating={isGenerating} 
                      onGenerate={handleCalculateConsensus} 
                      status={calculationStatus} 
                    />
                  </div>

                </div>

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/10 px-6 py-12 text-center max-w-lg mx-auto">
                <Compass className="mx-auto h-12 w-12 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-300 mt-3">Select or Create a Circle</h3>
                <p className="text-xs text-slate-455 mt-1">
                  Choose an existing group, join one with an ID key, or establish a brand-new planning room above to align schedules and unlock similarity algorithms.
                </p>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
