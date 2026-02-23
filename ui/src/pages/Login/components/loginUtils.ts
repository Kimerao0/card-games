export const isSafeInternalPath = (path: string): boolean => {
  // Allow only app-internal, absolute paths. Prevents open redirects.
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  return true;
};

export const extractErrorMessage = (error: unknown): string => {
  // RTK Query commonly returns FetchBaseQueryError or SerializedError.
  // This safely digs out a server "message" while falling back.
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data: unknown }).data;
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message: unknown }).message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.join(', ');
    }
  }
  return 'Si è verificato un errore. Riprova.';
};
