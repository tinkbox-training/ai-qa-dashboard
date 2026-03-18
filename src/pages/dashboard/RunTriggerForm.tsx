import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createRun } from '../../api/runs';
import { SectionCard } from '../../components/common/SectionCard';

export function RunTriggerForm() {
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createRun,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      navigate(`/runs/${data.run_id}`);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start run');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    const requirements = inputValue
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    if (requirements.length === 0) {
      setErrorMessage('Please enter at least one requirement.');
      return;
    }

    mutation.mutate({ requirements });
  }

  return (
    <SectionCard title="Start New Run">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
        <div style={{ color: '#64748b', fontSize: '14px' }}>
          Enter one requirement per line.
        </div>

        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={6}
          placeholder={`User should be able to login with valid credentials
User should see an error message when password is incorrect
Force fail registration test`}
          style={{
            width: '100%',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '12px',
            font: 'inherit',
            resize: 'vertical',
          }}
        />

        {errorMessage ? (
          <div style={{ color: '#b91c1c', fontSize: '14px' }}>{errorMessage}</div>
        ) : null}

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 14px',
              cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              opacity: mutation.isPending ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {mutation.isPending ? 'Starting...' : 'Start Run'}
          </button>

          <button
            type="button"
            onClick={() => setInputValue('')}
            disabled={mutation.isPending}
            style={{
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 14px',
              cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            Clear
          </button>
        </div>
      </form>
    </SectionCard>
  );
}