import { useEffect } from 'react';

export default function useDocumentTitle(title, suffix = 'algmed') {
  useEffect(() => {
    document.title = title ? `${title} — ${suffix}` : 'algmed';
  }, [title, suffix]);
}
