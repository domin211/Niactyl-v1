import React, { useEffect, useState } from 'react';
import { BRAND_COLOR } from '../config';

interface LeaderboardEntry {
  ptero_username: string;
  tokens: number;
}

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(err => console.error('Failed to fetch leaderboard:', err));
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
          --brand-color: ${BRAND_COLOR};
        }
      `}</style>

      <div className="min-h-screen bg-[#0C0E14] px-6 py-10 text-white" style={{ fontFamily: 'Rubik, sans-serif' }}>
        <h1 className="text-4xl font-bold text-center mb-2" style={{ color: 'var(--brand-color)' }}>
          Leaderboard
        </h1>
        <p className="text-center text-gray-400 mb-8 text-base">
          Top 10 users with the most tokens.
        </p>

        <div className="max-w-3xl mx-auto bg-[#14171F] rounded-2xl shadow-lg p-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-2 pr-4 w-10"></th>
                <th className="py-2 px-4">Username</th>
                <th className="py-2 px-4">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="py-3 pr-4 font-semibold text-white">{index + 1}.</td>
                  <td className="px-4 text-white">{entry.ptero_username}</td>
                  <td className="px-4 text-white">{entry.tokens}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 py-4">No leaderboard data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
