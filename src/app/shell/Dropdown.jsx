import React from 'react';
import { cn } from '../../lib/cn';

// A menu panel under a top-bar button; a click anywhere outside closes it.
export default function Dropdown({ open, onClose, children, className }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className={cn('absolute z-40 mt-2 rounded-lg border border-line bg-surface shadow-e3 py-1.5', className)}>
        {children}
      </div>
    </>
  );
}
