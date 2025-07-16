import React, { useState } from 'react';

const Admin = () => {
  const [discordId, setDiscordId] = useState('');
  const [addTokens, setAddTokens] = useState(0);
  const [setTokens, setSetTokens] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddTokens = async () => {
    const res = await fetch('/api/admin/add-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discord_id: discordId, tokens: Number(addTokens) })
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`✅ Added ${addTokens} tokens to user ${discordId}`);
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  const handleSetTokens = async () => {
    const res = await fetch('/api/admin/set-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discord_id: discordId, tokens: Number(setTokens) })
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`✅ Set tokens of user ${discordId} to ${setTokens}`);
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] p-6 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-brand">Admin Panel</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Add Tokens Box */}
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold text-white mb-2">Add Tokens</h2>
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
              <label className="block text-sm text-muted mb-1">Tokens to Add</label>
              <input
                type="number"
                value={addTokens}
                onChange={(e) => setAddTokens(parseInt(e.target.value))}
                className="w-full bg-[#2c2c2c] text-white p-2 rounded-lg border border-transparent focus:border-[var(--brand-color)]"
              />
            </div>
            <button onClick={handleAddTokens} className="btn btn-brand w-full">
              Add Tokens
            </button>
          </div>

          {/* Set Tokens Box */}
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold text-white mb-2">Set Tokens</h2>
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
              <label className="block text-sm text-muted mb-1">New Token Amount</label>
              <input
                type="number"
                value={setTokens}
                onChange={(e) => setSetTokens(parseInt(e.target.value))}
                className="w-full bg-[#2c2c2c] text-white p-2 rounded-lg border border-transparent focus:border-[var(--brand-color)]"
              />
            </div>
            <button onClick={handleSetTokens} className="btn btn-warning w-full">
              Set Tokens
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
