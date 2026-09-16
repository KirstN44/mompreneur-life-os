import React, { useState } from 'react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-stone-200"
    >
      <span>{copied ? '✓ Link Copied!' : '🔗 Share App'}</span>
    </button>
  );
}
