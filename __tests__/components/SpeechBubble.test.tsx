import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpeechBubble } from '@/components/SpeechBubble';

describe('SpeechBubble', () => {
  it('renders its children', () => {
    render(<SpeechBubble>hello</SpeechBubble>);
    expect(screen.getByText('hello')).toBeTruthy();
  });

  it('renders no tail by default', () => {
    render(<SpeechBubble>x</SpeechBubble>);
    expect(screen.queryByTestId('speech-bubble-tail')).toBeNull();
  });

  it('renders a down-pointing tail when tail="down"', () => {
    render(<SpeechBubble tail="down">x</SpeechBubble>);
    const tail = screen.getByTestId('speech-bubble-tail');
    expect(tail.getAttribute('data-tail')).toBe('down');
    expect(tail.className).toContain('-bottom-[7px]');
  });

  it('renders an up-pointing tail when tail="up"', () => {
    render(<SpeechBubble tail="up">x</SpeechBubble>);
    const tail = screen.getByTestId('speech-bubble-tail');
    expect(tail.getAttribute('data-tail')).toBe('up');
    expect(tail.className).toContain('-top-[7px]');
  });

  it('applies size classes', () => {
    const { container, rerender } = render(<SpeechBubble size="sm">x</SpeechBubble>);
    expect(container.firstChild).toBeTruthy();
    expect((container.firstChild as HTMLElement).className).toContain('text-xs');
    rerender(<SpeechBubble size="md">x</SpeechBubble>);
    expect((container.firstChild as HTMLElement).className).toContain('text-sm');
  });
});
