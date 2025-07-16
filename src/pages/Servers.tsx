import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND_COLOR } from '../config';
import Alert from '../components/Alert';

interface Server {
  id: number;
  uuid: string;
  identifier: string;
  name: string;
  cpu: number;
  memory: number;
  disk: number;
  ports: any[];
  databases: any[];
  backups: any[];
}

const Servers: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetch('/api/servers', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setServers(data))
      .catch(err => console.error('Failed to load servers:', err));
  }, []);

  const confirmDelete = (id: number, name: string) => {
    setDeletingId(id);
    setConfirmName(name);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingId === null) return;

    const res = await fetch(`/api/servers/${deletingId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    setConfirmOpen(false);
    setConfirmName('');
    const deletedId = deletingId;
    setDeletingId(null);

    if (res.ok) {
      setServers(prev => prev.filter(server => server.id !== deletedId));
      setAlertType('success');
      setAlertMessage('✅ Server deleted.');
    } else {
      const data = await res.json();
      setAlertType('error');
      setAlertMessage(`❌ Failed to delete server: ${data.error}`);
    }

    setTimeout(() => setAlertMessage(''), 3000); // Clear alert after 3s
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`:root { --brand-color: ${BRAND_COLOR}; }`}</style>

      <div className="min-h-screen bg-[#0C0E14] px-6 py-10 text-white" style={{ fontFamily: 'Rubik, sans-serif' }}>
        {alertMessage && <Alert type={alertType} message={alertMessage} />}

        <h1 className="text-4xl font-bold text-center mb-2" style={{ color: 'var(--brand-color)' }}>
          Your Servers
        </h1>
        <p className="text-center text-gray-400 mb-8 text-base">
          View and manage all the servers you've created.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {servers.map(server => (
            <div key={server.id} className="card">
              <h2 className="text-xl font-semibold text-white mb-2">{server.name}</h2>
              <p className="text-sm text-gray-400 mb-4">
                Server ID: <span className="text-[var(--brand-color)]">{server.identifier}</span>
              </p>
              <div className="space-y-1 text-sm text-gray-300">
                <p><strong>CPU:</strong> {server.cpu}%</p>
                <p><strong>RAM:</strong> {server.memory} MB</p>
                <p><strong>Disk:</strong> {server.disk} MB</p>
                <p><strong>Ports:</strong> {server.ports?.length || 0}</p>
                <p><strong>Databases:</strong> {server.databases?.length || 0}</p>
                <p><strong>Backups:</strong> {server.backups?.length || 0}</p>
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <a
                  href={`https://panel.firecone.eu/server/${server.identifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-brand"
                >
                  Open in Panel
                </a>
                <Link to={`/servers/edit/${server.id}`}>
                  <button className="btn btn-warning">
                    Edit
                  </button>
                </Link>
                <button onClick={() => confirmDelete(server.id, server.name)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {confirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="card w-full max-w-md text-white">
              <h2 className="text-2xl font-bold mb-3 text-white">Are you sure?</h2>
              <p className="text-sm text-gray-300 mb-6">
                You are about to delete{' '}
                <span className="font-semibold text-[var(--brand-color)]">"{confirmName}"</span>. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmOpen(false)} className="btn btn-muted">
                  Cancel
                </button>
                <button onClick={handleConfirmDelete} className="btn btn-danger">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Servers;
