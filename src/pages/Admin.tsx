import React, { useState } from 'react';

const Admin = () => {
  const [discordId, setDiscordId] = useState('');
  const [addCoins, setAddCoins] = useState(0);
  const [setCoins, setSetCoins] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddCoins = async () => {
    const res = await fetch('/api/admin/add-coins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discord_id: discordId, coins: Number(addCoins) })
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`✅ Added ${addCoins} coins to user ${discordId}`);
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  const handleSetCoins = async () => {
    const res = await fetch('/api/admin/set-coins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discord_id: discordId, coins: Number(setCoins) })
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`✅ Set coins of user ${discordId} to ${setCoins}`);
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] p-6 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-brand">Admin Panel</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Add Coins Box */}
          <div className="bg-[var(--surface-color)] rounded-2xl p-6 shadow space-y-4">
            <h2 className="text-xl font-semibold text-white mb-2">Add Coins</h2>
            <div>
              <label className="block text-sm text-muted mb-1">Discord ID</label>
              <input
                type="text"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                className="w-full bg-[#2c2c2c] text-white p-2 rounded-lg border border-transparent focus:border-[var(--brand-color)]"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Coins to Add</label>
              <input
                type="number"
                value={addCoins}
                onChange={(e) => setAddCoins(parseInt(e.target.value))}
                className="w-full bg-[#2c2c2c] text-white p-2 rounded-lg border border-transparent focus:border-[var(--brand-color)]"
              />
            </div>
            <button onClick={handleAddCoins} className="btn btn-brand w-full">
              Add Coins
            </button>
          </div>

          {/* Set Coins Box */}
          <div className="bg-[var(--surface-color)] rounded-2xl p-6 shadow space-y-4">
            <h2 className="text-xl font-semibold text-white mb-2">Set Coins</h2>
            <div>
              <label className="block text-sm text-muted mb-1">Discord ID</label>
              <input
                type="text"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                className="w-full bg-[#2c2c2c] text-white p-2 rounded-lg border border-transparent focus:border-[var(--brand-color)]"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">New Coin Amount</label>
              <input
                type="number"
                value={setCoins}
                onChange={(e) => setSetCoins(parseInt(e.target.value))}
                className="w-full bg-[#2c2c2c] text-white p-2 rounded-lg border border-transparent focus:border-[var(--brand-color)]"
              />
            </div>
            <button onClick={handleSetCoins} className="btn btn-warning w-full">
              Set Coins
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-6 text-center text-sm text-muted">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
