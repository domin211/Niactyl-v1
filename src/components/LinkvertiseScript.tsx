// components/LinkvertiseScript.tsx
import React, { useEffect } from 'react';
import { LINKVERTISE_ID } from '../config';

const LinkvertiseScript: React.FC = () => {
  useEffect(() => {
    const existing = document.getElementById('linkvertise-script');
    if (existing) return; // avoid re-adding

    const script = document.createElement('script');
    script.id = 'linkvertise-script';
    script.src = 'https://publisher.linkvertise.com/cdn/linkvertise.js';
    script.async = true;
    script.setAttribute('data-userid', LINKVERTISE_ID);
    script.setAttribute('data-observer-mode', 'true');
    document.body.appendChild(script);
  }, []);

  return null;
};

export default LinkvertiseScript;
