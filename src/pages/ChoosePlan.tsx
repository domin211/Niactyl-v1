import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Server,
  Database,
  Save,
  Clock,
  CheckCircle,
  XCircle,
  Coins,
} from "lucide-react";

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

const iconColor = "#fc6b05";

const ChoosePlan: React.FC = () => {
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/create-server/meta")
      .then((res) => res.json())
      .then((data) => setPlans(data.plans || {}));
  }, []);

  const selectPlan = (name: string) => {
    navigate(`/servers/create?plan=${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen bg-[#0C0E14] px-6 py-12 font-sans">
      <h1 className="text-4xl font-bold text-center mb-2 text-brand">
        Choose a Plan
      </h1>
      <p className="text-center text-muted mb-8 text-base">
        Select a plan for your new server.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {Object.entries(plans).map(([key, p]) => (
          <div
            key={key}
            className={`card relative rounded-3xl shadow-lg transition-all duration-200 p-8 flex flex-col gap-6 border-2 hover:border-orange-400 hover:scale-[1.03]`}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-extrabold text-white">{key}</h2>
              <span className="flex items-center gap-1 font-semibold text-orange-400 text-xl">
                <Coins size={20} color={iconColor} /> {p.price}
              </span>
            </div>
            <div className="text-base space-y-3">
              <div className="flex items-center gap-2 text-gray-300">
                <Cpu size={20} color={iconColor} />
                <span>
                  <span className="font-semibold">vCPU:</span> {p.resources.cpu}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MemoryStick size={20} color={iconColor} />
                <span>
                  <span className="font-semibold">RAM:</span> {p.resources.memory} MB
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <HardDrive size={20} color={iconColor} />
                <span>
                  <span className="font-semibold">Disk:</span> {p.resources.disk} MB
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Server size={20} color={iconColor} />
                <span>
                  <span className="font-semibold">Ports:</span> {p.resources.ports}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Database size={20} color={iconColor} />
                <span>
                  <span className="font-semibold">Databases:</span> {p.resources.databases}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Save size={20} color={iconColor} />
                <span>
                  <span className="font-semibold">Backups:</span> {p.resources.backups}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock size={20} color={iconColor} />
                <span>
                  <span className="font-semibold">24/7:</span>{" "}
                  {p.is24_7 ? (
                    <CheckCircle size={18} className="inline" color="#22c55e" />
                  ) : (
                    <XCircle size={18} className="inline" color="#ef4444" />
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={() => selectPlan(key)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-400 text-lg font-bold text-white shadow hover:from-orange-500 hover:to-yellow-500 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle size={22} color="#fff" /> Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoosePlan;
