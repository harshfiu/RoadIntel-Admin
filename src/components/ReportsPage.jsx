import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { URGENCY_COLORS, STATUS_COLORS } from '../utils/ml';

const MOCK_TEAMS = ['Alpha Repair Squad', 'Beta Road Team', 'Emergency Response Unit'];

// ── Report detail modal ──────────────────────────────────────────
function ReportModal({ report, onClose }) {
  const [selectedTeam, setSelectedTeam] = useState(MOCK_TEAMS[0]);
  const [saving, setSaving]             = useState(false);

  const handleAssign = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'pothole_reports', report.id), {
        status:     'Assigned',
        assignedTo: selectedTeam,
      });
      onClose();
    } catch (e) {
      console.error(e);
      alert('Update failed. Check Firestore rules.');
    } finally {
      setSaving(false);
    }
  };

  const uc = URGENCY_COLORS[report.ml?.urgency] ?? URGENCY_COLORS.Low;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-slate-800">Report Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Photo */}
          {report.imageUrl && (
            <img
              src={report.imageUrl}
              alt="Pothole"
              className="w-full h-48 object-cover rounded-xl border border-slate-200"
            />
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-semibold uppercase">Location</p>
              <p className="font-mono text-slate-700 mt-1">
                {report.latitude?.toFixed(6)}<br />{report.longitude?.toFixed(6)}
              </p>
              <a
                href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                target="_blank" rel="noreferrer"
                className="text-blue-500 text-xs hover:underline"
              >
                View on Maps →
              </a>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-semibold uppercase">Timestamp</p>
              <p className="text-slate-700 mt-1">
                {report.timestamp
                  ? report.timestamp.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                  : '—'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-semibold uppercase">Urgency</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${uc.bg} ${uc.text}`}>
                {report.ml?.urgency}
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-semibold uppercase">Priority Score (J)</p>
              <p className="text-slate-800 font-bold text-lg mt-1">{report.ml?.J}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-semibold uppercase">Pothole Area (Ap)</p>
              <p className="text-slate-700 mt-1">{report.ml?.Ap} cm²</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-semibold uppercase">Road Width (Rw)</p>
              <p className="text-slate-700 mt-1">{report.ml?.Rw} m</p>
            </div>
          </div>

          {/* Assign team */}
          {report.status === 'Reported' && (
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700">Assign Repair Team</p>
              <select
                value={selectedTeam}
                onChange={e => setSelectedTeam(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MOCK_TEAMS.map(t => <option key={t}>{t}</option>)}
              </select>
              <button
                onClick={handleAssign}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                {saving ? 'Saving…' : 'Confirm Assignment'}
              </button>
            </div>
          )}

          {report.status === 'Assigned' && (
            <div className="border-t pt-4">
              <p className="text-sm text-slate-500">
                Assigned to: <span className="font-semibold text-slate-700">{report.assignedTo ?? '—'}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reports page ──────────────────────────────────────────────────
export default function ReportsPage({ reports, loading }) {
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('All Status');
  const [urgencyF,  setUrgencyF]  = useState('All Urgency');
  const [sortBy,    setSortBy]    = useState('Highest Priority');
  const [selected,  setSelected]  = useState(null);

  const filtered = reports
    .filter(r => {
      const coords = `${r.latitude?.toFixed(4)} ${r.longitude?.toFixed(4)} ${r.id}`.toLowerCase();
      if (search && !coords.includes(search.toLowerCase())) return false;
      if (statusF  !== 'All Status'  && r.status          !== statusF)       return false;
      if (urgencyF !== 'All Urgency' && r.ml?.urgency     !== urgencyF)      return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest First') return (b.timestamp ?? 0) - (a.timestamp ?? 0);
      if (sortBy === 'Oldest First') return (a.timestamp ?? 0) - (b.timestamp ?? 0);
      return b.ml.J - a.ml.J; // Highest Priority (default)
    });

  return (
    <div className="p-8 space-y-5">
      {selected && <ReportModal report={selected} onClose={() => setSelected(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pothole Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">{reports.length} total reports</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by location or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {[
          { value: statusF,  set: setStatusF,  options: ['All Status', 'Reported', 'Assigned', 'Resolved'] },
          { value: urgencyF, set: setUrgencyF, options: ['All Urgency', 'Critical', 'High', 'Medium', 'Low'] },
          { value: sortBy,   set: setSortBy,   options: ['Highest Priority', 'Newest First', 'Oldest First'] },
        ].map((f, i) => (
          <select
            key={i}
            value={f.value}
            onChange={e => f.set(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {f.options.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading reports…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No reports match your filters.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Pothole Size</th>
                <th className="px-4 py-3">Road Type</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => {
                const uc = URGENCY_COLORS[r.ml?.urgency] ?? URGENCY_COLORS.Low;
                const sc = STATUS_COLORS[r.status] ?? STATUS_COLORS.Reported;
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      #{r.id.slice(0, 6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-slate-700">
                        {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.ml?.size}</td>
                    <td className="px-4 py-3 text-slate-600">{r.ml?.roadType}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${uc.bg} ${uc.text}`}>
                        {r.ml?.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${r.ml?.priority}%`, background: uc.hex }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{r.ml?.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {r.assignedTo ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {r.timestamp
                        ? r.timestamp.toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(r)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
