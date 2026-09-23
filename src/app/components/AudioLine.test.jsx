import React from 'react';
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AudioLine from './AudioLine';

// The app's own audio player: play/pause, a seekable bar, and — for a film line — a mark
// where the scene ends, so a read that spills past its beat can be seen, not just read off
// a number.
// jsdom has no media engine: play/pause never change `paused` on their own, so the fake
// keeps that state itself, as a browser would.
beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
    configurable: true,
    get() { return this._paused !== false; },
  });
  HTMLMediaElement.prototype.play = vi.fn(function play() {
    this._paused = false;
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  HTMLMediaElement.prototype.pause = vi.fn(function pause() {
    this._paused = true;
    this.dispatchEvent(new Event('pause'));
  });
});

const load = (seconds) => {
  const audio = document.querySelector('audio');
  Object.defineProperty(audio, 'duration', { value: seconds, configurable: true });
  fireEvent.loadedMetadata(audio);
  return audio;
};

describe('AudioLine', () => {
  it('plays and pauses the line', async () => {
    render(<AudioLine src="/media/aud_1.mp3" label="scene 1" />);
    load(6);
    const play = screen.getByRole('button', { name: 'Play scene 1' });
    await userEvent.click(play);
    expect(await screen.findByRole('button', { name: 'Pause scene 1' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Pause scene 1' }));
    expect(await screen.findByRole('button', { name: 'Play scene 1' })).toBeInTheDocument();
  });

  it('shows how far through the line is, and seeks with the keyboard', async () => {
    render(<AudioLine src="/media/aud_1.mp3" label="scene 1" />);
    const audio = load(8);
    const bar = screen.getByRole('slider', { name: 'Seek scene 1' });
    expect(bar).toHaveAttribute('aria-valuemax', '8');
    expect(screen.getByText('0:00 / 0:08')).toBeInTheDocument();

    audio.currentTime = 3;
    fireEvent.timeUpdate(audio);
    expect(screen.getByText('0:03 / 0:08')).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuetext', '0:03 of 0:08');

    bar.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(Math.round(audio.currentTime)).toBe(4);
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(Math.round(audio.currentTime)).toBe(2);
  });

  it('marks where the scene ends when the read runs past it', () => {
    const { container, rerender } = render(<AudioLine src="/media/aud_1.mp3" window={4} label="scene 1" />);
    load(6);   // a 6-second read in a 4-second scene: the mark sits two thirds along
    expect(container.querySelector('[title="The scene ends at 4s"]')).toBeInTheDocument();

    rerender(<AudioLine src="/media/aud_2.mp3" window={4} label="scene 1" />);
    load(3.2);  // fits its scene: nothing to mark
    expect(container.querySelector('[title="The scene ends at 4s"]')).not.toBeInTheDocument();
  });
});
