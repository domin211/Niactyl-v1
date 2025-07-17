import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';

interface UserData {
  discord: {
    username: string;
    email: string;
    id: string;
    avatar?: string;
  };
  created_at?: string;
  ptero_username?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [cooldownAlert, setCooldownAlert] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setUser({
          discord: data.discord,
          created_at: data.created_at || null,
          ptero_username: data.ptero_username || null,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch user info:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const resetPassword = async () => {
    if (cooldown > 0) {
      setCooldownAlert('Please wait 60 seconds before resetting your password again.');
      return;
    }

    try {
      const res = await fetch('/api/user/reset-password', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setNewPassword(data.newPassword);
        setCooldown(60);
        setCooldownAlert(null);
      } else {
        setNewPassword(null);
        setCooldownAlert(`Failed to reset password: ${data.error}`);
      }
    } catch (err) {
      setNewPassword(null);
      setCooldownAlert('An error occurred while resetting the password.');
      console.error(err);
    }
  };

  const refreshData = () => {
    fetch('/api/auth/logout', { credentials: 'include' }).then(() => {
      window.location.href = '/api/auth/discord';
    });
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    setCooldownAlert('Account deletion not implemented yet.');
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-white px-6 py-10 select-none">
      <div className="max-w-3xl mx-auto mb-4 text-center">
        <h1 className="text-4xl font-bold text-brand mb-2">User Settings</h1>
        <p className="text-muted text-base">View your login information & manage your account.</p>
      </div>

      {cooldownAlert && (
        <div className="max-w-3xl mx-auto mb-4">
          <Alert message={cooldownAlert} type="warning" />
        </div>
      )}

      <div className="max-w-3xl mx-auto card space-y-8">
        {loading || !user ? (
          <p className="text-muted text-center">Loading user settings...</p>
        ) : (
          <>
            <div className="flex flex-col space-y-6 text-muted">
              <div>
                <h3 className="text-sm">Username</h3>
                <p className="text-lg font-semibold text-white select-text">
                  {user.ptero_username || user.discord.username}
                </p>
              </div>

              <div>
                <h3 className="text-sm">Email</h3>
                <p className="text-lg font-semibold text-white select-text">
                  {user.discord.email}
                </p>
              </div>

              {user.created_at && (
                <div>
                  <h3 className="text-sm">Account Created</h3>
                  <p className="text-lg font-semibold text-white">
                    {new Date(user.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button onClick={resetPassword} className="btn btn-brand flex-1">
                Reset Password
              </button>

              <button onClick={refreshData} className="btn btn-muted flex-1">
                Refresh Data
              </button>

              <button onClick={() => setConfirmOpen(true)} className="btn btn-danger flex-1">
                Delete Account
              </button>
            </div>

            {newPassword && (
              <div className="mt-6 p-4 bg-[#0C0E14] rounded-xl text-center">
                <p className="text-sm text-muted">Your new password:</p>
                <p className="text-lg font-semibold text-white tracking-wider select-text">
                  {newPassword}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="card w-full max-w-md text-white">
            <h2 className="text-2xl font-bold mb-3">Are you sure?</h2>
            <p className="text-sm text-muted mb-6">
              You are about to{' '}
              <span className="text-red-400 font-semibold">delete your account</span>. This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} className="btn btn-muted">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="btn btn-danger">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
