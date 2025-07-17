import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Server as ServerIcon,
  Database,
  Save,
  Network
} from 'lucide-react';
import { BRAND_COLOR } from '../config';
import Alert from '../components/Alert';

const iconColor = "#fc6b05";

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
  expires_at?: string;
  plan?: string;
}

const Servers: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetch('/api/servers', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => setServers(data))
      .catch(err => {
        console.error('Failed to load servers:', err);
        setLoadError('Failed to load servers.');
      });
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

    setTimeout(() => setAlertMessage(''), 3000);
  };

  return (
    <>
      <div className="min-h-screen bg-[#0C0E14] px-6 py-10 text-white">
        {alertMessage && <Alert type={alertType} message={alertMessage} />}

        <h1 className="text-4xl font-bold text-center mb-2 text-brand">
          Your Servers
        </h1>
        <p className="text-center text-gray-400 mb-8 text-base">
          View and manage all the servers you've created.
        </p>
        {loadError && <Alert type="error" message={loadError} />}
        <p className="text-center text-sm text-gray-400 mb-6">
          Ensure you have enough tokens when your server renews or it will be downgraded to the free plan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {servers.map(server => (
            <div
              key={server.id}
              className="card rounded-3xl border-2 hover:border-orange-400 transition-all duration-200 p-8 flex flex-col mb-2"
            >
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <ServerIcon size={22} color={iconColor} /> {server.name}
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Server ID: <span className="text-[var(--brand-color)]">{server.identifier}</span>
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Cpu size={18} color={iconColor} />
                  <span><strong>CPU:</strong> {server.cpu}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <MemoryStick size={18} color={iconColor} />
                  <span><strong>RAM:</strong> {server.memory} MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive size={18} color={iconColor} />
                  <span><strong>Disk:</strong> {server.disk} MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <Network size={18} color={iconColor} />
                  <span><strong>Ports:</strong> {server.ports?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database size={18} color={iconColor} />
                  <span><strong>Databases:</strong> {server.databases?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Save size={18} color={iconColor} />
                  <span><strong>Backups:</strong> {server.backups?.length || 0}</span>
                </div>
                {server.expires_at && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-orange-400">Renews:</span>
                    <span>
                      {new Date(server.expires_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
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
            <div className="card w-full max-w-md text-white rounded-3xl">
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
