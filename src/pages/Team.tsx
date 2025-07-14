import React from 'react';

const Team: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--background-color)] p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-brand">Team</h1>
        <p className="text-center text-muted mb-8 text-base">
          Manage your team and boost your earnings together.
        </p>

        <div className="bg-[var(--surface-color)] rounded-2xl shadow-lg p-6 space-y-6">
          <p className="text-base text-muted">
            This is your team area. You can invite other users to join your team and earn tokens on your behalf.
            Team members will contribute to your total earnings through linked tasks.
          </p>

          <div className="flex justify-start">
            <button className="btn btn-brand text-sm px-5 py-2">
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
