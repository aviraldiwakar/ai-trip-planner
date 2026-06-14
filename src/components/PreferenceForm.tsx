import React, { useState } from "react";
import { PlaneTakeoff, Calendar, Sparkles, Sliders } from "lucide-react";

interface PreferenceFormProps {
  onSubmit: (data: { destinationName: string; fromDate: string; toDate: string; priorityScore: number }) => Promise<void>;
  isSubmitting: boolean;
}

const PRESET_DESTINATIONS = [
  { name: "Bali", icon: "🌴" },
  { name: "Kyoto", icon: "🏮" },
  { name: "Rome", icon: "🏛️" },
  { name: "Paris", icon: "🗼" },
  { name: "Queenstown", icon: "🏔️" },
  { name: "Petra", icon: "🏺" }
];

export default function PreferenceForm({ onSubmit, isSubmitting }: PreferenceFormProps) {
  const [destinationName, setDestinationName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [priorityScore, setPriorityScore] = useState<number>(3);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!destinationName || !destinationName.trim()) {
      setFormError("Please provide a departure or destination place name.");
      return;
    }
    if (!fromDate) {
      setFormError("A matching 'From' date input timeline is required.");
      return;
    }
    if (!toDate) {
      setFormError("A matching 'To' date input timeline is required.");
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (start > end) {
      setFormError("The Start date is after the End date. Please review dates.");
      return;
    }

    try {
      await onSubmit({
        destinationName: destinationName.trim(),
        fromDate,
        toDate,
        priorityScore
      });
      // Clear inputs
      setDestinationName("");
      setFromDate("");
      setToDate("");
      setPriorityScore(3);
    } catch (err: any) {
      setFormError(err.message || "Preference submission failed.");
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-2xl space-y-4">
      <div className="mb-1.5 flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PlaneTakeoff className="h-4.5 w-4.5 text-indigo-400" />
          Propose Destination & Timeline
        </h3>
        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] text-indigo-300 border border-indigo-500/20">Preferences</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-lg bg-rose-950/40 p-2.5 text-xs font-semibold text-rose-300 border border-rose-500/20">
            {formError}
          </div>
        )}

        {/* Preset Suggestions */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Preset Suggestions:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_DESTINATIONS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setDestinationName(preset.name)}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                  destinationName === preset.name
                    ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-medium"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Destination Target */}
        <div>
          <label htmlFor="input_dest" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Destination Place Name:
          </label>
          <div className="relative">
            <input
              id="input_dest"
              type="text"
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              placeholder="e.g. Kyoto, Bali, Rome"
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 pl-9 text-xs placeholder-slate-500 text-white focus:border-indigo-500/50 focus:bg-slate-950/60 focus:outline-none transition-all"
            />
            <PlaneTakeoff className="absolute left-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="input_from" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              From Date:
            </label>
            <div className="relative">
              <input
                id="input_from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-2 py-2 text-xs text-white focus:border-indigo-500/50 focus:bg-slate-950/60 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
          <div>
            <label htmlFor="input_to" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              To Date:
            </label>
            <div className="relative">
              <input
                id="input_to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-2 py-2 text-xs text-white focus:border-indigo-500/50 focus:bg-slate-950/60 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
        </div>

        {/* Priority Slider */}
        <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input_priority" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sliders className="h-3.5 w-3.5 text-slate-500" />
              Priority Score (Weight):
            </label>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-bold leading-none bg-indigo-500/20 text-indigo-300 border border-indigo-500/15">
              {priorityScore} / 5
            </span>
          </div>
          <input
            id="input_priority"
            type="range"
            min="1"
            max="5"
            step="1"
            value={priorityScore}
            onChange={(e) => setPriorityScore(parseInt(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-indigo-500 focus:outline-none"
          />
          <div className="flex justify-between text-[9px] font-mono font-medium text-slate-500 mt-1">
            <span>Low (1)</span>
            <span>Medium (3)</span>
            <span>High (5)</span>
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-500/50 hover:bg-indigo-500 focus:outline-none active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          disabled={isSubmitting}
          id="btn_submit_pref"
        >
          {isSubmitting ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Registering preference...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Submit Preference
            </>
          )}
        </button>
      </form>
    </div>
  );
}
