import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// A guide only: the engine decides what is accepted (length, common passwords, email or name).
export function passwordStrength(password) {
  if (!password) return null;
  if (password.length < 8) return { level: 0, label: 'Too short' };
  const kinds = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  const samey = /^(.)\1+$/.test(password) || /^[0-9]+$/.test(password);
  const score = samey ? 0
    : (password.length >= 12) + (password.length >= 16) + (kinds >= 2) + (kinds >= 3);
  if (score <= 1) return { level: 1, label: 'Weak' };
  if (score === 2) return { level: 2, label: 'Fair' };
  return { level: 3, label: 'Strong' };
}

const BAR = ['bg-error', 'bg-error', 'bg-warning', 'bg-success'];
const TEXT = ['text-error', 'text-error', 'text-warning', 'text-success'];

// A password input with a show/hide button and, for new passwords, a strength meter.
export default function PasswordField({ value, onChange, showStrength = false, className = '', ...rest }) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? passwordStrength(value) : null;
  return (
    <div>
      <div className="relative">
        <input {...rest} type={visible ? 'text' : 'password'} value={value} onChange={onChange} className={className + ' pr-11'} />
        <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid place-items-center w-11 text-ink-faint hover:text-ink bg-transparent">
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {strength && (
        <div className="mt-2 flex items-center gap-2" aria-live="polite">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3].map((i) => (
              <span key={i} className={'h-1 flex-1 rounded-full ' + (strength.level >= i ? BAR[strength.level] : 'bg-line')} />
            ))}
          </div>
          <span className={'text-xs font-semibold ' + TEXT[strength.level]}>Strength: {strength.label}</span>
        </div>
      )}
      {strength && strength.level > 0 && strength.level < 3 && (
        <p className="mt-1 text-xs text-ink-faint">Longer is stronger. Try a short phrase of a few words.</p>
      )}
    </div>
  );
}
