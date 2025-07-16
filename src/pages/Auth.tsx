import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME, BRAND_COLOR, TOS_URL, DISCORD_COLOR } from '../config';

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
      {/* Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Rubik:wght@500;700&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-[#0C0E14] flex flex-col items-center justify-center px-4 font-[Inter]">
        <div className="card text-center p-10 w-full max-w-md">
          <h1
            className="text-3xl font-bold text-[#F7F7F7] mb-1"
            style={{ fontFamily: 'Rubik, sans-serif' }}
          >
            Welcome to
          </h1>
          <h2
            className="text-4xl font-extrabold mb-6"
            style={{ fontFamily: 'Rubik, sans-serif', color: BRAND_COLOR }}
          >
            {APP_NAME}
          </h2>

          {/* Perfectly centered button */}
          <button
            onClick={() => (window.location.href = '/api/auth/discord')}
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-lg text-sm font-semibold transition hover:bg-[#1e1e1e] mx-auto mt-6 mb-6"
            style={{
              backgroundColor: 'transparent',
              border: `2.5px solid ${DISCORD_COLOR}`,
              color: DISCORD_COLOR,
            }}
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
              className="hover:underline"
              style={{ color: BRAND_COLOR }}
            >
              Terms of Service
            </a>
            .
          </p>
        </div>

        <p className="mt-4 text-sm font-normal" style={{ color: BRAND_COLOR }}>
          © {CURRENT_YEAR} {APP_NAME} | Powered by Niactyl
        </p>
      </div>
    </>
  );
}

export default Login;
