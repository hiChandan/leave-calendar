import { useState, useEffect } from "react";

export default function EventModal({ onSave, onClose }) {
  const todayISO = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(todayISO);
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!memberId) return alert("Select member");
    if (endDate < startDate) {
      return alert("End date cannot be before start date");
    }

    setLoading(true);

    try {
      const res = await fetch("api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          name: members.find((m) => m.id === memberId)?.name,
          startDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      onSave(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("api/members")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data.map((m) => m));
      });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Add Leave</h3>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Person
          </label>
          <div className="relative">
            <select
              value={memberId}
              onChange={(e) => setMemberId(Number(e.target.value))}
              className="
                            w-full appearance-none rounded-xl
                            border border-slate-300
                            px-4 py-2.5
                            text-sm text-slate-800
                            shadow-sm transition
                            hover:border-slate-400
                            focus:border-blue-500 focus:bg-white
                            focus:outline-none focus:ring-4 focus:ring-blue-100
                          "
            >
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                const v = e.target.value;
                setStartDate(v);
                if (endDate < v) setEndDate(v);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              End date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-md hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
