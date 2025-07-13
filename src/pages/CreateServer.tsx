import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND_COLOR } from '../config';
import Alert from '../components/Alert';

const CreateServer = () => {
  const [name, setName] = useState('');
  const [cpu, setCpu] = useState(200);
  const [memory, setMemory] = useState(1024);
  const [disk, setDisk] = useState(5120);
  const [ports, setPorts] = useState(1);
  const [databases, setDatabases] = useState(0);
  const [backups, setBackups] = useState(0);
  const [egg, setEgg] = useState('');
  const [location, setLocation] = useState('');
  const [eggs, setEggs] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any>({});
  const [limits, setLimits] = useState<any>({});
  const [cost, setCost] = useState(0);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [successPopup, setSuccessPopup] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/create-server/meta')
      .then(res => res.json())
      .then(data => {
        const fetchedEggs = data.eggs || [];
        const fetchedLocations = data.locations || [];
        setEggs(fetchedEggs);
        setLocations(fetchedLocations);
        setPricing(data.pricing || {});
        setLimits(data.limits || {});

        if (fetchedEggs.length > 0) setEgg(fetchedEggs[0].id);
        if (fetchedLocations.length > 0) setLocation(fetchedLocations[0].id);
      });
  }, []);

  useEffect(() => {
    const total =
      cpu * (pricing.cpu || 0) +
      memory * (pricing.memory || 0) +
      disk * (pricing.disk || 0) +
      ports * (pricing.port || 0) +
      databases * (pricing.database || 0) +
      backups * (pricing.backup || 0);
    setCost(Math.round(total));
  }, [cpu, memory, disk, ports, databases, backups, pricing]);

  const handleCreate = async () => {
    setErrorAlert(null);

    try {
      const res = await fetch('/api/create-server/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cpu, memory, disk, ports, databases, backups, egg, location }),
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

  const getSliderStyle = (value: number, min: number, max: number) => {
    const percent = ((value - min) / (max - min)) * 100;
    return {
      background: `linear-gradient(to right, var(--brand-color) 0%, var(--brand-color) ${percent}%, #3B3F4A ${percent}%, #3B3F4A 100%)`,
    };
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`:root { --brand-color: ${BRAND_COLOR}; }`}</style>

      {successPopup && (
        <div className="fixed top-6 right-6 z-50">
          <Alert type="success" message={successPopup} />
        </div>
      )}

      <div className="min-h-screen bg-[#0C0E14] px-6 py-10 text-white" style={{ fontFamily: 'Rubik, sans-serif' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2" style={{ color: 'var(--brand-color)' }}>
            Create Server
          </h1>
          <p className="text-center text-gray-400 mb-4 text-base">
            Customize your server before launching it.
          </p>

          {errorAlert && <Alert type="error" message={errorAlert} />}

          <div className="bg-[#14171F] rounded-3xl shadow-lg p-8 space-y-8 mt-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Server Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#1E212B] text-white p-3 rounded-xl border border-transparent focus:border-[var(--brand-color)]"
                placeholder="My awesome server"
              />
            </div>

            <div className="space-y-6">
              <label className="block text-sm text-gray-400">CPU: {cpu}%
                <input
                  type="range"
                  min={100}
                  max={limits.cpu || 2000}
                  step={100}
                  value={cpu}
                  onChange={e => setCpu(+e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={getSliderStyle(cpu, 100, limits.cpu || 2000)}
                />
              </label>
              <label className="block text-sm text-gray-400">Memory: {memory} MB
                <input
                  type="range"
                  min={512}
                  max={limits.memory || 32768}
                  step={512}
                  value={memory}
                  onChange={e => setMemory(+e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={getSliderStyle(memory, 512, limits.memory || 32768)}
                />
              </label>
              <label className="block text-sm text-gray-400">Disk: {disk} MB
                <input
                  type="range"
                  min={1024}
                  max={limits.disk || 51200}
                  step={1024}
                  value={disk}
                  onChange={e => setDisk(+e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={getSliderStyle(disk, 1024, limits.disk || 51200)}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-sm text-gray-400">Ports</label>
                <select value={ports} onChange={e => setPorts(+e.target.value)}
                  className="w-full bg-[#1E212B] text-white p-2 rounded-xl border border-transparent focus:border-[var(--brand-color)]">
                  {[0, 1, 2, 3].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-400">Databases</label>
                <select value={databases} onChange={e => setDatabases(+e.target.value)}
                  className="w-full bg-[#1E212B] text-white p-2 rounded-xl border border-transparent focus:border-[var(--brand-color)]">
                  {[0, 1, 2].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-400">Backups</label>
                <select value={backups} onChange={e => setBackups(+e.target.value)}
                  className="w-full bg-[#1E212B] text-white p-2 rounded-xl border border-transparent focus:border-[var(--brand-color)]">
                  {[0, 1, 2].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-gray-400">Egg</label>
                <select value={egg} onChange={e => setEgg(e.target.value)}
                  className="w-full bg-[#1E212B] text-white p-2 rounded-xl border border-transparent focus:border-[var(--brand-color)]">
                  {eggs.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-400">Location</label>
                <select value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full bg-[#1E212B] text-white p-2 rounded-xl border border-transparent focus:border-[var(--brand-color)]">
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-lg text-center text-gray-300">
              Estimated cost: <span className="text-white font-semibold">{cost}</span> coins / renewal
            </div>

            <button
              onClick={handleCreate}
              className="w-full py-3 text-sm font-semibold rounded-xl text-white transition"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Create Server
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateServer;
