import { useState } from 'react';

const STATUS_STYLES = {
  available: 'text-green-600 bg-green-50',
  busy:      'text-orange-600 bg-orange-50',
  off_duty:  'text-slate-500 bg-slate-100',
};

const INITIAL_TEAMS = [
  { id: 1, name: 'Alpha Repair Squad',     supervisor: 'Ravi Kumar',  zone: 'North Zone',  members: 2, completed: 12, status: 'available', specialty: 'Pothole Repair' },
  { id: 2, name: 'Beta Road Team',          supervisor: 'Priya Sharma', zone: 'South Zone',  members: 1, completed: 8,  status: 'available', specialty: 'Road Resurfacing' },
  { id: 3, name: 'Emergency Response Unit', supervisor: 'Anil Singh',  zone: 'City Center', members: 0, completed: 25, status: 'available', specialty: 'Emergency' },
];

function AddTeamModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '', supervisor: '', zone: '', members: 1, specialty: 'Pothole Repair',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd({ ...form, id: Date.now(), status: 'available', completed: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-slate-800">Add New Team</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { label: 'Team Name',   key: 'name',       type: 'text' },
            { label: 'Supervisor',  key: 'supervisor', type: 'text' },
            { label: 'Zone',        key: 'zone',       type: 'text' },
            { label: 'Members',     key: 'members',    type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Specialty
            </label>
            <select
              value={form.specialty}
              onChange={e => setForm(prev => ({ ...prev, specialty: e.target.value }))}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {['Pothole Repair', 'Road Resurfacing', 'Emergency', 'General Maintenance'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Add Team
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const [teams,      setTeams]      = useState(INITIAL_TEAMS);
  const [filter,     setFilter]     = useState('All');
  const [showModal,  setShowModal]  = useState(false);

  const handleAdd    = (team)    => setTeams(prev => [...prev, team]);
  const handleDelete = (id)      => setTeams(prev => prev.filter(t => t.id !== id));

  const available = teams.filter(t => t.status === 'available').length;
  const busy      = teams.filter(t => t.status === 'busy').length;

  const filtered = filter === 'All'
    ? teams
    : teams.filter(t => t.status === filter.toLowerCase());

  return (
    <div className="p-8 space-y-5">
      {showModal && <AddTeamModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Repair Teams</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {available} available · {busy} busy · {teams.length} total
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Add Team
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Available',     value: available,    icon: '✅', color: '#22c55e' },
          { label: 'Currently Busy', value: busy,        icon: '🔧', color: '#f97316' },
          { label: 'Total Teams',   value: teams.length, icon: '👷', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border-l-4" style={{ borderLeftColor: s.color }}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{s.label}</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{s.value}</p>
              </div>
              <span className="text-3xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['All', 'Available', 'Busy', 'Off_duty'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
              ${filter === f
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Team cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(team => (
          <div key={team.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-3">
            {/* Card header */}
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-slate-800">{team.name}</h3>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[team.status]}`}>
                {team.status.replace('_', ' ')}
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <p className="text-slate-400 uppercase tracking-wide font-semibold">Supervisor</p>
                <p className="text-slate-700 font-medium mt-0.5">{team.supervisor}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wide font-semibold">Zone</p>
                <p className="text-slate-700 font-medium mt-0.5">{team.zone}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wide font-semibold">Members</p>
                <p className="text-slate-700 font-medium mt-0.5">{team.members} people</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wide font-semibold">Completed</p>
                <p className="text-green-600 font-semibold mt-0.5">{team.completed} jobs</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">{team.specialty}</span>
              <button
                onClick={() => handleDelete(team.id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
