import React from 'react';

const Earn: React.FC = () => {
  const boxes = [
    { title: 'Lootlabs', onClick: () => alert('Lootlabs logic coming soon!') },
    { title: 'Linkvertise', onClick: () => alert('Linkvertise logic coming soon!') },
    { title: 'Linkpays', onClick: () => alert('Linkpays logic coming soon!') },
    { title: 'Exe.io', onClick: () => alert('Exe.io logic coming soon!') },
  ];

  return (
    <div className="min-h-screen bg-[var(--background-color)] px-6 py-10 text-white select-none">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-brand">Earn Coins</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {boxes.map(({ title, onClick }) => (
            <div
              key={title}
              className="bg-[var(--surface-color)] rounded-2xl shadow-lg p-6 flex flex-col justify-between"
            >
              <h2 className="text-2xl font-semibold mb-4 text-white">{title}</h2>
              <button
                onClick={onClick}
                className="self-start px-3 py-1.5 rounded-md text-xs font-medium text-white transition"
                style={{ backgroundColor: 'var(--brand-color)' }}
              >
                Start Earning
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Earn;
