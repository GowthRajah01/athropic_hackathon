export const theme = {
  colors: {
    background:      '#F5F0E8',  // cream/manila
    surface:         '#FAF7F2',  // off-white (inputs, secondary surfaces)
    memoTint:        '#FDF8EC',  // memo/chat card background
    primary:         '#1B3A6B',  // corporate navy
    primaryDark:     '#122848',
    red:             '#C0392B',  // faded red (stamps, alerts)
    grey:            '#8C8276',  // warm mid-grey (metadata, secondary text)
    text:            '#2d2d2d',
    textMuted:       '#8C8276',
    textLight:       '#aaa49c',
    border:          '#1B3A6B',  // navy borders on memo cards
    borderGrey:      '#C8C2B8',  // grey dotted dividers
    userBubble:      '#FAF7F2',  // secondary (user) card — off-white
    userBubbleText:  '#2d2d2d',
    white:           '#ffffff',
    error:           '#C0392B',
  },
  fonts: {
    display:  "'Playfair Display', 'Georgia', serif",
    serif:    "Georgia, 'Times New Roman', serif",
    mono:     "'Courier New', Courier, monospace",
    // body defaults to mono per spec
    body:     "'Courier New', Courier, monospace",
    heading:  "Georgia, 'Times New Roman', serif",
  },
  radii: {
    sm:   '2px',
    md:   '2px',
    lg:   '2px',
    pill: '2px',
  },
  shadows: {
    memo: '2px 2px 0 rgba(27,58,107,0.08)',
    sm:   '1px 1px 0 rgba(27,58,107,0.06)',
  },
};
