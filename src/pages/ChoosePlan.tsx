import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  eggs: number[];
  is24_7?: boolean;
}

const ChoosePlan: React.FC = () => {
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/create-server/meta')
      .then(res => res.json())
      .then(data => setPlans(data.plans || {}));
  }, []);

  const selectPlan = (name: string) => {
    navigate(`/servers/create?plan=${encodeURIComponent(name)}`);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`:root { --brand-color: ${BRAND_COLOR}; }`}</style>

      <div className="min-h-screen bg-[#0C0E14] px-6 py-10 text-white" style={{ fontFamily: 'Rubik, sans-serif' }}>
        <h1 className="text-4xl font-bold text-center mb-2" style={{ color: 'var(--brand-color)' }}>
          Choose a Plan
        </h1>
        <p className="text-center text-gray-400 mb-8 text-base">Select a plan for your new server.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {Object.entries(plans).map(([key, p]) => (
            <div key={key} className="bg-[#14171F] p-6 rounded-2xl shadow space-y-3">
              <h2 className="text-xl font-semibold">{key}</h2>
              <p className="text-sm text-gray-400">{p.price} tokens</p>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>vCPU:</strong> {p.resources.cpu}%</p>
                <p><strong>RAM:</strong> {p.resources.memory} MB</p>
                <p><strong>Disk:</strong> {p.resources.disk} MB</p>
                <p><strong>Ports:</strong> {p.resources.ports}</p>
                <p><strong>Databases:</strong> {p.resources.databases}</p>
                <p><strong>Backups:</strong> {p.resources.backups}</p>
                <p><strong>24/7:</strong> {p.is24_7 ? 'Yes' : 'No'}</p>
              </div>
              <button
                onClick={() => selectPlan(key)}
                className="w-full py-2 rounded-xl text-white"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChoosePlan;
