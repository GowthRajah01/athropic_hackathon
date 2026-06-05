import { useState, useRef, useEffect } from 'react';
import { theme } from '../styles/theme';

const PLACEHOLDERS = [
  'Type your memo here…',
  'What can Dunder Mifflin help you with?',
  'Need a paper quote? A compliance check? HR advice?',
  'The World\'s Best Boss is listening…',
  'Submit your request to the Scranton Branch…',
];

interface InputBarProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState('');
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  const [focused, setFocused] = useState(false);
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
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  }

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div style={{
      padding: '14px 24px 16px',
      background: theme.colors.surface,
      borderTop: `1px dashed ${theme.colors.borderGrey}`,
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
      }}>
        {/* Textarea styled as a form field */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={disabled ? 'The team is working on it…' : placeholder}
          rows={1}
          style={{
            flex: 1,
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.primary}`,
            borderRadius: theme.radii.sm,
            outline: 'none',
            boxShadow: focused ? `inset 0 0 0 2px ${theme.colors.primary}` : 'none',
            resize: 'none',
            padding: '10px 14px',
            fontFamily: theme.fonts.mono,
            fontSize: '14px',
            lineHeight: 1.6,
            color: theme.colors.text,
            minHeight: '44px',
            maxHeight: '140px',
            overflowY: 'auto',
            transition: 'box-shadow 0.15s ease',
          }}
        />

        {/* Send Memo button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            background: canSend ? theme.colors.primary : theme.colors.borderGrey,
            color: theme.colors.surface,
            border: 'none',
            borderRadius: theme.radii.sm,
            padding: '10px 18px',
            fontFamily: theme.fonts.serif,
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: canSend ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            height: '44px',
            opacity: canSend ? 1 : 0.5,
            transition: 'background 0.15s ease, opacity 0.15s ease',
          }}
          onMouseEnter={e => {
            if (canSend) (e.currentTarget as HTMLButtonElement).style.background = '#122848';
          }}
          onMouseLeave={e => {
            if (canSend) (e.currentTarget as HTMLButtonElement).style.background = theme.colors.primary;
          }}
        >
          Send Memo
        </button>

        {/* CLEAR FILE stamp button */}
        <button
          onClick={() => setValue('')}
          disabled={!value.trim()}
          title="Clear draft"
          style={{
            background: 'rgba(255,255,255,0.5)',
            border: `2px solid ${theme.colors.red}`,
            borderRadius: theme.radii.sm,
            padding: '6px 12px',
            fontFamily: theme.fonts.mono,
            fontSize: '10px',
            fontWeight: 'bold',
            letterSpacing: '0.18em',
            color: theme.colors.red,
            cursor: value.trim() ? 'pointer' : 'not-allowed',
            opacity: value.trim() ? 1 : 0.35,
            transform: 'rotate(-4deg)',
            height: '44px',
            flexShrink: 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          CLEAR<br />FILE
        </button>
      </div>

      <div style={{
        fontFamily: theme.fonts.serif,
        fontSize: '11px',
        color: theme.colors.textLight,
        marginTop: '6px',
        fontStyle: 'italic',
      }}>
        Enter to send memo · Shift+Enter for new line
      </div>
    </div>
  );
}
