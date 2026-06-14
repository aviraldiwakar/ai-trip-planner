import React from "react";
import { Award, Calendar, Users, Cpu, ArrowRight, Star, ShieldAlert, CheckCircle } from "lucide-react";
import { TripResult } from "../types";

interface TripResultsProps {
  result: TripResult | null;
  errorMsg: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
  status: "idle" | "error" | "success";
}

export default function TripResults({ result, errorMsg, isGenerating, onGenerate, status }: TripResultsProps) {
  
  // Format standard date representations for a polished human-readable display
  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        const dateObj = new Date(Date.UTC(parseInt(year), month, day));
        return dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC"
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Trigger Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/30 to-slate-900/40 p-5 shadow-2xl text-center">
        <h3 className="text-base font-bold text-white">Consensus & Recs Engine</h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-450">
          Trigger the date overlap scheduler, group priority voter, and run similarity recommendations over Python.
        </p>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-500/50 hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.6)] active:scale-[0.98] transition-all disabled:opacity-50"
          id="btn_trigger_engine"
        >
          {isGenerating ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Running Consensus & AI Module...
            </>
          ) : (
            <>
              <Cpu className="h-4 w-4" />
              Calculate & Generate Trip
            </>
          )}
        </button>
      </div>

      {/* 2. Error Display (Overlap Failures or Empty Prefs) */}
      {status === "error" && errorMsg && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-5 shadow-2xl">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/25 text-rose-300">
              <ShieldAlert className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-300">Consensus Interrupted</h4>
              <p className="mt-1 text-xs text-rose-200/90 leading-relaxed max-w-xl">
                {errorMsg}
              </p>
              <div className="mt-3.5 flex flex-col gap-2 rounded-lg bg-slate-950/50 p-3 border border-rose-550/20 text-[11px] text-slate-400">
                <p className="font-semibold text-rose-355 text-rose-300">Resolution Guidelines:</p>
                <p>1. Check if any member has added distinct non-overlapping dates.</p>
                <p>2. Ask members to widen tentative date horizons to guarantee matching intervals.</p>
                <p>3. Use the <strong>Quick-Switch Persona</strong> bar to enter dates that share an overlapping range.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Successful Consensus Output */}
      {status === "success" && result && (
        <div className="space-y-6">
          {/* A. Winning Highlight Deck */}
          <div className="grid gap-4 md:grid-cols-2">
            
            {/* Target Recommendation winner */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-t from-slate-950 to-slate-900 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 mb-3 uppercase tracking-wider">
                  <Award className="h-3.5 w-3.5" /> Consensus Destination
                </span>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Winning Place</p>
                <h4 className="text-3xl font-black text-white tracking-tight mt-1">
                  {result.winningDestination}
                </h4>
              </div>
              <p className="mt-4 text-xs text-slate-450 italic max-w-sm">
                Determined by the Priority Engine. This destination received the highest summed voting score across all submitted user preferences.
              </p>
            </div>

            {/* Overlap schedule */}
            <div className="rounded-2xl border border-emerald-550/10 bg-slate-900/30 backdrop-blur p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 mb-3 uppercase tracking-wider">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Date Alignment Active
                </span>
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest leading-none">Best Travel Timeline</p>
                <div className="mt-2.5 flex items-center gap-2 text-white">
                  <Calendar className="h-6 w-6 text-emerald-400 shrink-0" />
                  <div className="text-base font-bold tracking-tight">
                    <span>{formatDateStr(result.commonStartDate)}</span>
                    <span className="text-slate-500 font-normal px-2">to</span>
                    <span>{formatDateStr(result.commonEndDate)}</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-emerald-450 font-medium leading-relaxed bg-emerald-950/40 border border-emerald-500/10 rounded-lg p-2.5 shrink-0">
                Calculated by the Overlap Engine using: <code className="bg-slate-950/80 border border-white/5 px-1 py-0.5 rounded font-mono text-[9px] text-emerald-300">MAX(from_dates) = {result.commonStartDate}</code> to <code className="bg-slate-950/80 border border-white/5 px-1 py-0.5 rounded font-mono text-[9px] text-emerald-300">MIN(to_dates) = {result.commonEndDate}</code>.
              </p>
            </div>
          </div>

          {/* B. All Places Submitted List Table */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-indigo-400" />
                Submitted Preference Matrix
              </h4>
              <span className="rounded bg-white/5 border border-white/10 px-2.5 py-0.5 font-mono text-[10px] text-slate-400">
                {result.userProposals.length} Submissions
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5">User</th>
                    <th className="py-2.5">Proposed Place</th>
                    <th className="py-2.5">Preferred Calendar Timeline</th>
                    <th className="py-2.5 text-right">Priority Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                  {result.userProposals.map((prop, idx) => (
                    <tr key={prop.prefId || idx} className="hover:bg-white/5 transition">
                      <td className="py-2.5 font-medium text-slate-200 pr-2">
                        {prop.userName || `User #${prop.userId}`}
                        {prop.userId === 1 && <span className="ml-1.5 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 px-1 py-0.2 text-[9px] font-bold">You</span>}
                      </td>
                      <td className="py-2.5 font-semibold text-indigo-400 pr-2">
                        {prop.destinationName}
                      </td>
                      <td className="py-2.5 text-slate-350 font-mono pr-2">
                        {formatDateStr(prop.fromDate)} <span className="text-slate-500 px-1">→</span> {formatDateStr(prop.toDate)}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-slate-200">{prop.priorityScore}</span>
                          <span className="text-slate-550 font-normal text-slate-500">/5</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* C. AI Recommendations (Python Similarity) Section */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/40 to-slate-950 p-6 text-white shadow-xl relative overflow-hidden">
            {/* Background decoration elements */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
            <div className="absolute left-0 bottom-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />

            <div className="mb-5 flex items-center justify-between border-b border-indigo-900 pb-3.5 relative z-10">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-indigo-300 animate-spin-slow" />
                <span>AI Collaborative Suggestions</span>
              </h4>
              <span className="rounded bg-indigo-950/80 border border-indigo-900 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-indigo-300">
                Python similarity algorithm
              </span>
            </div>

            <p className="text-xs text-indigo-200/95 mb-5 relative z-10 leading-relaxed max-w-xl">
              Based on the places submitted by your group (<strong>{result.userProposals.map(p => p.destinationName).join(", ")}</strong>), our Python module calculated similarity weights using weighted attribute distance representing terrain theme alignments, budget bracket parameters, and regions.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 relative z-10">
              {result.aiSuggestions && result.aiSuggestions.length > 0 ? (
                result.aiSuggestions.map((rec, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/5 bg-slate-950/50 p-4 hover:border-indigo-500/50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-white text-sm">{rec.name}</h5>
                        <span className="rounded-full bg-indigo-950 px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-400 border border-indigo-900/60">
                          {Math.round(rec.similarity_score * 100)}% Sim
                        </span>
                      </div>
                      
                      {/* Capsules */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[9px] font-mono text-slate-300 uppercase tracking-wide">
                          🏞️ {rec.terrain}
                        </span>
                        <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[9px] font-mono text-slate-300 uppercase tracking-wide">
                          📍 {rec.region}
                        </span>
                        <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[9px] font-mono text-slate-300 uppercase tracking-wide">
                          💰 {rec.budget}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[11px] text-indigo-300 font-medium pt-3.5 border-t border-white/5">
                      <span>Explore this alternative</span>
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-xs text-indigo-300 py-3">
                  No AI recommended alternatives returned. Run calculations to query.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Not Generated Empty State */}
      {status === "idle" && !isGenerating && (
        <div className="rounded-2xl border-2 border-dashed border-white/10 bg-slate-900/10 p-10 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-500" />
          <h4 className="text-sm font-bold text-slate-300 mt-3">Ready for Decision Calculation</h4>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
            Click <strong>Calculate & Generate Trip</strong> above to run user priority summing, find overlapping dates, and run the Python recommender over our custom content-based matching dataset.
          </p>
        </div>
      )}
    </div>
  );
}
