import type { ReactNode } from 'react';

interface Props {
  enabled: boolean;
  title: string;
  summary: ReactNode;
  children: ReactNode;
}

/**
 * On small screens, folds a sidebar panel into a one-line summary so the results stay near the
 * top of the page. On wide screens it renders the panel as is.
 */
export function Collapsible({ enabled, title, summary, children }: Props) {
  if (!enabled) return <>{children}</>;
  return (
    <details className="collapse">
      <summary>
        <span className="collapse-title">{title}</span>
        <span className="collapse-summary">{summary}</span>
      </summary>
      {children}
    </details>
  );
}
