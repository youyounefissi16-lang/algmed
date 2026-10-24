import React from 'react';

const Spinner = React.memo(({ size = 24, text = 'Loading...' }) => (
  <div role="status" aria-label={text} className="flex items-center justify-center gap-2.5 p-5">
    <div className="conic-spinner" style={{ width: size, height: size }} />
    <span className="text-sm text-muted">{text}</span>
  </div>
));

Spinner.displayName = 'Spinner';

export default Spinner;
