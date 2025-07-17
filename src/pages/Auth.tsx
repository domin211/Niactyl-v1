import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME, BRAND_COLOR, TOS_URL, DISCORD_COLOR } from '../config';
import { lightenColor } from '../utils/color';

const CURRENT_YEAR = new Date().getFullYear();

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) navigate('/dashboard');
      })
      .catch(() => {});
  }, [navigate]);

  return (
    <>
      <style>{`
        :root {
          --brand-color: ${BRAND_COLOR};
          --brand-color-light: ${lightenColor(BRAND_COLOR, 20)};
        }
      `}</style>

      <div className="min-h-screen bg-[#0C0E14] flex flex-col items-center justify-center px-4">
        <div className="card text-center p-10 w-full max-w-md">
          <h1 className="text-3xl font-bold text-[#F7F7F7] mb-1">
            Welcome to
          </h1>
          <h2 className="text-4xl font-extrabold mb-6 text-brand">
            {APP_NAME}
          </h2>

          {/* Perfectly centered button */}
          <button
            onClick={() => (window.location.href = '/api/auth/discord')}
            className="btn btn-discord flex items-center justify-center gap-3 mx-auto mt-6 mb-6 px-6 py-3"
          >
            <img
              src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d80db9971f10a9757c99_Symbol.svg"
              alt="Discord"
              className="w-5 h-5"
            />
            Login with Discord
          </button>

          <p className="text-[#aaaaaa] text-xs font-normal">
            By continuing, you agree to our{' '}
            <a
              href={TOS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-brand"
            >
              Terms of Service
            </a>
            .
          </p>
        </div>

        <p className="mt-4 text-sm font-normal text-brand">
          © {CURRENT_YEAR} {APP_NAME} | Powered by Niactyl
        </p>
      </div>
    </>
  );
}

export default Login;
