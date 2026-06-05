import { useState, useRef, useEffect } from 'react';
import { theme } from '../styles/theme';

const PLACEHOLDERS = [
  'Ask the Scranton branch anything…',
  'What can Dunder Mifflin help you with?',
  'Need a paper quote? A compliance check? HR advice?',
  'The world\'s best boss is listening…',
  'How can we help you today?',
];

interface InputBarProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState('');
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  // Auto-resize textarea
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  }

  return (
    <div style={{
      padding: '12px 16px',
      background: theme.colors.surface,
      borderTop: `1px solid ${theme.colors.border}`,
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
        background: theme.colors.white,
        border: `1.5px solid ${disabled ? theme.colors.border : theme.colors.primary}`,
        borderRadius: theme.radii.lg,
        padding: '8px 8px 8px 16px',
        boxShadow: theme.shadows.sm,
        transition: 'border-color 0.2s ease',
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'The team is working on it…' : placeholder}
          rows={1}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            fontSize: '14px',
            lineHeight: '1.6',
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
            minHeight: '24px',
            maxHeight: '140px',
            overflowY: 'auto',
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          style={{
            background: disabled || !value.trim() ? theme.colors.border : theme.colors.accent,
            color: theme.colors.white,
            border: 'none',
            borderRadius: theme.radii.md,
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            transition: 'background 0.2s ease',
            height: '36px',
            alignSelf: 'flex-end',
          }}
        >
          Send
        </button>
      </div>
      <div style={{
        fontSize: '10px',
        color: theme.colors.textLight,
        marginTop: '6px',
        paddingLeft: '4px',
      }}>
        Enter to send · Shift+Enter for new line
      </div>
    </div>
  );
}
