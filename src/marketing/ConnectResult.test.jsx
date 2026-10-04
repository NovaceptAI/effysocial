import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import ConnectResult from './ConnectResult';
import { listenForResults } from '../lib/connectTab';

// Where a provider sends a connection opened in its own tab (lib/connectTab.js).
function Where() {
  const l = useLocation();
  return <p data-testid="where">{l.pathname}{l.search}</p>;
}

function at(url) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/connected/:back" element={<ConnectResult />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );
}

let stop = () => {};
afterEach(() => { stop(); stop = () => {}; vi.restoreAllMocks(); });

describe('/connected', () => {
  it('tells the page that opened the tab, then closes', async () => {
    const close = vi.spyOn(window, 'close').mockImplementation(() => {});
    const heard = [];
    stop = listenForResults((r) => heard.push(r));
    at('/connected/onboarding?connected=linkedin&status=exchange_failed&reason=The%20code%20has%20expired');
    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(heard).toEqual([{ provider: 'linkedin', status: 'exchange_failed', reason: 'The code has expired' }]);
    expect(await screen.findByText(/^Done — you can close this tab/)).toBeInTheDocument();
  });

  it('with nobody listening (the tab was blocked), carries on to the page with the result', async () => {
    const close = vi.spyOn(window, 'close').mockImplementation(() => {});
    at('/connected/onboarding?connected=linkedin&status=success');
    expect(await screen.findByTestId('where', {}, { timeout: 2000 })).toHaveTextContent('/onboarding?connected=linkedin&status=success');
    expect(close).not.toHaveBeenCalled();
  });

  it('an unknown page goes to Integrations', async () => {
    at('/connected/elsewhere?connected=instagram&status=denied');
    expect(await screen.findByTestId('where', {}, { timeout: 2000 })).toHaveTextContent('/app/integrations?connected=instagram&status=denied');
  });
});
