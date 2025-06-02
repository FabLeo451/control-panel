'use client';

import { useEffect, useState } from 'react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sessions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions) {
          setSessions(data.sessions);
        }
      });
  }, []);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSessions(new Set());
    } else {
      const allKeys = filteredSessions.map((session) => session.key);
      setSelectedSessions(new Set(allKeys));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (key) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedSessions(newSelected);
  };

  const handleKillSelected = async () => {
    const idsToKill = Array.from(selectedSessions);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sessions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToKill }),
      });

      if (!res.ok) {
        console.error('Errore durante l’eliminazione delle sessioni');
        return;
      }

      const remaining = sessions.filter((s) => !selectedSessions.has(s.key));
      setSessions(remaining);
      setSelectedSessions(new Set());
      setSelectAll(false);
    } catch (err) {
      console.error('Errore nella richiesta DELETE:', err);
    }
  };

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setSelectedSessions(new Set()); // reset selezione al cambio filtro
    setSelectAll(false);
  };

  // Applica il filtro sulle sessioni
  const filteredSessions = sessions.filter((session) => {
    if (statusFilter === 'all') return true;
    return session.data.status === statusFilter;
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Sessions</h1>

      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            className="btn btn-error"
            onClick={handleKillSelected}
            disabled={selectedSessions.size === 0}
          >
            Kill
          </button>

          <select
            className="select select-bordered"
            value={statusFilter}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="idle">Inactive</option>
          </select>
        </div>

        <span className="text-sm text-gray-500">
          Visualizzate: {filteredSessions.length} / Totali: {sessions.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-lg bg-base-100 rounded-box shadow">
          <thead className="bg-base-200 text-base-content">
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Utente</th>
              <th>Email</th>
              <th>IP</th>
              <th>Agent</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session, index) => {
              const isSelected = selectedSessions.has(session.key);
              return (
                <tr
                  key={session.key}
                  className={`transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-base-100' : 'bg-base-200'
                  } ${isSelected ? 'ring-2 ring-primary/40' : ''}`}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(session.key)}
                    />
                  </td>
                  <td>{session.data.user.name}</td>
                  <td>{session.data.user.email}</td>
                  <td>{session.data.ip}</td>
                  <td className="max-w-xs truncate">{session.data.agent}</td>
                  <td>{session.data.platform}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        session.data.status === 'online'
                          ? 'badge-success'
                          : 'badge-ghost'
                      }`}
                    >
                      {session.data.status}
                    </span>
                  </td>
                  <td>{new Date(session.data.updated).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
