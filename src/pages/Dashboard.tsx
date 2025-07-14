import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Infinity as InfinityIcon } from 'lucide-react';
import { PANEL_URL } from '../config';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmName, setConfirmName] = useState('');

  // Delay fallback display
  useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard. Redirecting...');
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const confirmDelete = (id: number, name: string) => {
    setDeletingId(id);
    setConfirmName(name);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingId === null) return;
    setConfirmOpen(false);

    try {
      const res = await fetch(`/api/servers/${deletingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        const updated = await fetch('/api/dashboard').then(r => r.json());
        setDashboardData(updated);
      } else {
        const data = await res.json();
        alert('❌ Failed to delete server: ' + data.error);
      }
    } catch (err) {
      alert('❌ Error deleting server');
      console.error(err);
    } finally {
      setDeletingId(null);
      setConfirmName('');
    }
  };

  const tokens = useMemo(() => dashboardData?.tokens || 0, [dashboardData]);
  const spending = useMemo(() => dashboardData?.spending || 0, [dashboardData]);
  const interval = useMemo(() => dashboardData?.interval || 1, [dashboardData]);
  const enoughTime = useMemo(() => dashboardData?.enoughTime, [dashboardData]);
  const servers = useMemo(() => dashboardData?.servers || [], [dashboardData]);

  if (error) return <p className="text-white p-6">{error}</p>;
  if (loading && showFallback) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-[var(--background-color)] p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-brand">Dashboard</h1>
        <p className="text-center text-muted mb-8 text-base">View your resources & other things here.</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Tokens" value={tokens} />
          <StatCard label="Token Spending" value={spending === 0 ? '0' : `${spending} tokens / ${interval}h`} />
          <StatCard label="Enough Tokens For" value={spending === 0 ? <InfinityIcon size={24} strokeWidth={2.5} /> : enoughTime} />
        </div>

        {/* Action Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <ActionCard title="Create Server" desc="Ready to host? You can create a server here." to="/servers/plans" label="Create Server" />
        </div>

        {/* Server Table */}
        <div className="bg-[var(--surface-color)] rounded-lg p-6 shadow overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-4">Your Servers</h2>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-muted border-b border-gray-700">
                <th className="py-2 pr-4">Name</th>
                <th className="px-4">CPU</th>
                <th className="px-4">RAM</th>
                <th className="px-4">Disk</th>
                <th className="text-center px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {servers.length > 0 ? (
                servers.map((server: any) => (
                  <tr key={server.id} className="border-b border-gray-700">
                    <td className="py-3 pr-4 text-white">{server.name}</td>
                    <td className="px-4">{server.cpu}%</td>
                    <td className="px-4">{server.memory} MB</td>
                    <td className="px-4">{server.disk} MB</td>
                    <td className="px-4">
                      <div className="flex justify-center gap-2">
                        <a
                          href={`${PANEL_URL}/server/${server.identifier}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded text-white text-xs font-medium"
                          style={{ backgroundColor: 'var(--brand-color)' }}
                        >
                          Open
                        </a>
                        <Link to={`/servers/edit/${server.id}`}>
                          <button className="px-3 py-1 rounded text-white text-xs font-medium" style={{ backgroundColor: 'var(--warning-color)' }}>
                            Edit
                          </button>
                        </Link>
                        <button onClick={() => confirmDelete(server.id, server.name)} className="px-3 py-1 rounded text-white text-xs font-medium" style={{ backgroundColor: 'var(--danger-color)' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">No servers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-[var(--surface-color)] p-6 rounded-2xl w-full max-w-md shadow-xl text-white">
              <h2 className="text-2xl font-bold mb-3">Are you sure?</h2>
              <p className="text-sm text-muted mb-6">
                You are about to delete{' '}
                <span className="font-semibold text-brand">"{confirmName}"</span>. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: '#2e2e2e' }}>
                  Cancel
                </button>
                <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: 'var(--danger-color)' }}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="bg-[var(--surface-color)] rounded-lg p-6 shadow text-left">
    <h3 className="text-sm text-muted mb-1">{label}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const ActionCard = ({ title, desc, to, label }: { title: string; desc: string; to: string; label: string }) => (
  <div className="bg-[var(--surface-color)] rounded-lg p-6 shadow text-left">
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-muted mb-4">{desc}</p>
    <Link to={to}>
      <button className="py-1.5 px-4 text-sm font-medium rounded-md text-white" style={{ backgroundColor: 'var(--brand-color)' }}>
        {label}
      </button>
    </Link>
  </div>
);

export default Dashboard;
