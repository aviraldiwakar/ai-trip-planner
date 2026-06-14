import React from "react";
import { Compass, Users, LogOut, RefreshCw, UserCheck } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onQuickSwitch: (userId: number) => void;
  availableUsers: User[];
}

export default function Navbar({ currentUser, onLogout, onQuickSwitch, availableUsers }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Compass className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">CoRoute <span className="text-indigo-400">AI</span></h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Collaborative Trip Planning</p>
          </div>
        </div>

        {/* Dynamic User Profile and Switcher Controls */}
        {currentUser && (
          <div className="flex items-center gap-4">
            {/* Quick Switch Sandbox Control */}
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-white/5 p-1.5 border border-white/10">
              <span className="text-[11px] font-semibold text-indigo-400 px-2 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" />
                Quick-Switch Persona:
              </span>
              <div className="flex gap-1">
                {availableUsers.map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => onQuickSwitch(user.userId)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      currentUser.userId === user.userId
                        ? "bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {user.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Active Badge */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{currentUser.email}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-slate-300 border border-white/10">
                {currentUser.name[0]}
              </div>
            </div>

            {/* Logout Trigger */}
            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition"
              title="Logout session"
              id="btn_logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Personas Bar */}
      {currentUser && (
        <div className="md:hidden flex items-center justify-between border-t border-white/5 bg-slate-950/40 px-4 py-2">
          <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
            <Users className="h-3 w-3" /> Personas:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 max-w-[70%]">
            {availableUsers.map((user) => (
              <button
                key={user.userId}
                onClick={() => onQuickSwitch(user.userId)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all ${
                  currentUser.userId === user.userId
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 border border-white/10 text-slate-400"
                }`}
              >
                {user.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
