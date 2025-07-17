import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BRAND_COLOR } from '../config';
import Alert from '../components/Alert';

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
  eggs: number[];
  is24_7?: boolean;
}

const CreateServer = () => {
  const [name, setName] = useState('');
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [plan, setPlan] = useState('');
  const [egg, setEgg] = useState('');
  const [location, setLocation] = useState('');
  const [eggs, setEggs] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [eula, setEula] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [successPopup, setSuccessPopup] = useState<string | null>(null);

  const navigate = useNavigate();
  const locationHook = useLocation();

  useEffect(() => {
    fetch('/api/create-server/meta')
      .then(res => res.json())
      .then(data => {
        setEggs(data.eggs || []);
        setLocations(data.locations || []);
        setPlans(data.plans || {});

        const params = new URLSearchParams(locationHook.search);
        const planParam = params.get('plan');
        let initialPlan = planParam && data.plans[planParam] ? planParam : undefined;
        if (!initialPlan) {
          initialPlan = Object.keys(data.plans || {})[0];
        }
        if (initialPlan) setPlan(initialPlan);
      });
  }, [locationHook.search]);

  const filteredEggs = plans[plan]?.eggs || [];

  useEffect(() => {
    if (filteredEggs.length > 0) {
      setEgg(String(filteredEggs[0]));
    }
  }, [plan, plans]);

  const handleCreate = async () => {
    setErrorAlert(null);

    try {
      const res = await fetch('/api/create-server/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          plan,
          egg: Number(egg),
          location,
          eulaAccepted: eula,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessPopup('✅ Server created successfully!');
        navigate('/servers', { replace: true });
      } else {
        setErrorAlert(`❌ ${data.error || 'Failed to create server'}`);
      }
    } catch (err) {
      console.error(err);
      setErrorAlert('❌ Failed to create server. Please try again.');
    }
  };

  return (
    <>
      {successPopup && (
        <div className="fixed top-6 right-6 z-50">
          <Alert type="success" message={successPopup} />
        </div>
      )}

      <div className="min-h-screen bg-[#0C0E14] px-6 py-10 text-white">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2" style={{ color: 'var(--brand-color)' }}>
            Create Server
          </h1>
          <p className="text-center text-gray-400 mb-4 text-base">Select a plan and create your server.</p>

          {errorAlert && <Alert type="error" message={errorAlert} />}

          <div className="card mt-6 space-y-8">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Server Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                placeholder="My awesome server"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-400">Plan</label>
              <select
                value={plan}
                onChange={e => setPlan(e.target.value)}
                className="input">
                {Object.entries(plans).map(([key, p]) => (
                  <option key={key} value={key}>
                    {key} - {p.price} tokens
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-gray-400">Egg</label>
                <select
                  value={egg}
                  onChange={e => setEgg(e.target.value)}
                  className="input">
                  {eggs.filter(e => filteredEggs.includes(e.egg_id)).map(e => (
                    <option key={e.egg_id} value={e.egg_id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-400">Location</label>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="input">
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="eula" checked={eula} onChange={e => setEula(e.target.checked)} />
              <label htmlFor="eula" className="text-sm text-gray-300">I agree to the Minecraft EULA</label>
            </div>

            <button onClick={handleCreate} className="btn btn-brand w-full py-3 text-sm font-semibold">
              Create Server
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateServer;
