import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AssistantPanel from '../components/AssistantPanel';

// Effy AI lives in the shell, but pages open it too — "Ask Effy" on a campaign opens
// the panel with its question already asked (launch plan 5.1).
const AssistantContext = createContext({ open: false, question: '', askEffy: () => {}, closeAssistant: () => {} });

export function AssistantProvider({ children }) {
  const [state, setState] = useState({ open: false, question: '', asked: 0 });

  // `asked` changes on every ask, so the same question twice still runs.
  const askEffy = useCallback((question = '') => setState((s) => ({ open: true, question, asked: s.asked + 1 })), []);
  const closeAssistant = useCallback(() => setState((s) => ({ ...s, open: false, question: '' })), []);
  const value = useMemo(() => ({ ...state, askEffy, closeAssistant }), [state, askEffy, closeAssistant]);

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export const useAssistant = () => useContext(AssistantContext);

// The panel itself, wired to the context — rendered once by the shell.
export function AssistantSurface() {
  const { open, question, asked, closeAssistant } = useAssistant();
  return <AssistantPanel open={open} question={question} asked={asked} onClose={closeAssistant} />;
}
