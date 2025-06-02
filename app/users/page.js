'use client';

import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`)
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          setUsers(data.users);
        }
      });
  }, []);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUserIds(new Set());
    } else {
      const allIds = filteredUsers.map(user => user.id);
      setSelectedUserIds(new Set(allIds));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedUserIds);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedUserIds(newSelected);
  };

  const handleKillSelected = async () => {
    const idsToKill = Array.from(selectedUserIds);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToKill }),
      });

      if (!res.ok) {
        console.error('Errore durante l’eliminazione degli utenti');
        return;
      }

      const remainingUsers = users.filter(user => !selectedUserIds.has(user.id));
      setUsers(remainingUsers);
      setSelectedUserIds(new Set());
      setSelectAll(false);
    } catch (err) {
      console.error('Errore nella richiesta DELETE:', err);
    }
  };

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setSelectedUserIds(new Set());
    setSelectAll(false);
  };

  const filteredUsers = users.filter(user => {
    if (statusFilter === 'all') return true;
    return user.status === statusFilter;
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Users</h1>

      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            className="btn btn-error"
            onClick={handleKillSelected}
            disabled={selectedUserIds.size === 0}
          >
            Delete
          </button>

          <select
            className="select select-bordered"
            value={statusFilter}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <span className="text-sm text-gray-500">
          Visible: {filteredUsers.length} / Total: {users.length}
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
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Roles</th>
              <th>Last access</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => {
              const isSelected = selectedUserIds.has(user.id);
              return (
                <tr
                  key={user.id}
                  className={`transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-base-100' : 'bg-base-200'
                  } ${isSelected ? 'ring-2 ring-primary/40' : ''}`}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(user.id)}
                    />
                  </td>
                  <td>{user.user_name}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        user.status === 'enabled' ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>{user.roles}</td>
                  <td>{new Date(user.last_access).toLocaleString()}</td>
                  <td>{new Date(user.created).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
