import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { BRAND_COLOR } from '../config';

interface Plan {
  price: number;
  resources: {
    cpu: number;
    memory: number;
    disk: number;
    ports: number;
    backups: number;
    databases: number;
  };
}

const EditServer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [serverPlan, setServerPlan] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch('/api/servers/meta')
      .then(res => res.json())
      .then(data => setPlans(data.plans || {}));

    fetch(`/api/servers/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setServerPlan(data.plan || '');
      });
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    const res = await fetch(`/api/servers/${id}/edit-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ plan: serverPlan })
    });
    const data = await res.json();
    if (res.ok) {
      setAlert({ type: 'success', msg: '✅ Plan updated!' });
      setTimeout(() => navigate('/servers', { replace: true }), 1000);
    } else {
      setAlert({ type: 'error', msg: `❌ ${data.error || 'Failed to update plan'}` });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0C0E14] px-6 py-10 text-white">
        <h1 className="text-3xl font-bold mb-6 text-brand">Edit Plan</h1>
        {alert && <Alert type={alert.type} message={alert.msg} />}
        <div className="card space-y-6 max-w-md">
          <div>
            <label className="block mb-1 text-sm text-gray-400">Plan</label>
            <select
              value={serverPlan}
              onChange={e => setServerPlan(e.target.value)}
              className="input">
              {Object.entries(plans).map(([key]) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSave} className="btn btn-brand w-full py-2 font-semibold">Save</button>
        </div>
      </div>
    </>
  );
};

export default EditServer;
