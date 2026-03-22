import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createRun, previewNegativeTests } from '../../api/runs';
import { SectionCard } from '../../components/common/SectionCard';

export function RunTriggerForm() {
  const [inputValue, setInputValue] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [selfHealing, setSelfHealing] = useState(false);
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

  const negativePreviewMutation = useMutation({
    mutationFn: previewNegativeTests,
    onSuccess: (data) => {
      const existing = inputValue
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
      const merged = [...new Set([...existing, ...data.generated_requirements])];
      setInputValue(merged.join('\n'));
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate negative tests');
    },
  });

  function getRequirements() {
    return inputValue
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    const requirements = getRequirements();

    if (requirements.length === 0) {
      setErrorMessage('Please enter at least one requirement.');
      return;
    }

    mutation.mutate({
      requirements,
      base_url: baseUrl.trim() || undefined,
      self_healing: selfHealing,
    });
  }

  function handleGenerateNegativeTests() {
    setErrorMessage('');
    const requirements = getRequirements();
    if (requirements.length === 0) {
      setErrorMessage('Enter at least one base requirement before generating negative tests.');
      return;
    }
    negativePreviewMutation.mutate({ requirements });
  }

  return (
    <SectionCard title="Start New Run">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
        <div style={{ color: '#64748b', fontSize: '14px' }}>
          Enter one requirement per line. You can also optionally set a base URL and enable self-healing metadata for this run.
        </div>

        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={6}
          placeholder={`User should be able to login with valid credentials
User should see an error message when password is incorrect
Force fail registration test`}
          style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', font: 'inherit', resize: 'vertical' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, alignItems: 'end' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Base URL</span>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://practicetestautomation.com"
              style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10 }}>
            <input type="checkbox" checked={selfHealing} onChange={(e) => setSelfHealing(e.target.checked)} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Self-healing</span>
          </label>
        </div>

        {errorMessage ? <div style={{ color: '#b91c1c', fontSize: '14px' }}>{errorMessage}</div> : null}

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="submit" disabled={mutation.isPending} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 14px', cursor: mutation.isPending ? 'not-allowed' : 'pointer', opacity: mutation.isPending ? 0.7 : 1, fontWeight: 600 }}>
            {mutation.isPending ? 'Starting...' : 'Start Run'}
          </button>

          <button type="button" onClick={handleGenerateNegativeTests} disabled={negativePreviewMutation.isPending || mutation.isPending} style={{ background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 14px', cursor: negativePreviewMutation.isPending ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            {negativePreviewMutation.isPending ? 'Generating...' : 'Generate negative variants'}
          </button>

          <button type="button" onClick={() => { setInputValue(''); setBaseUrl(''); setSelfHealing(false); }} disabled={mutation.isPending} style={{ background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 14px', cursor: mutation.isPending ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            Clear
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
