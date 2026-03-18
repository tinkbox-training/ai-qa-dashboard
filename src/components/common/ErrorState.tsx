interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div style={{ color: '#b91c1c', padding: '12px 0' }}>
      <div>{message}</div>
      {onRetry ? (
        <button onClick={onRetry} style={{ marginTop: '8px' }}>
          Retry
        </button>
      ) : null}
    </div>
  );
}