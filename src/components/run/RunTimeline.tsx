import { formatDateTime } from '../../lib/format';

interface RunTimelineProps {
  status?: string;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
}

type StepStatus = 'done' | 'active' | 'pending' | 'failed';

interface TimelineStep {
  key: string;
  label: string;
  time?: string;
  state: StepStatus;
}

function getStepStyle(state: StepStatus) {
  switch (state) {
    case 'done':
      return {
        circleBg: '#16a34a',
        circleColor: '#ffffff',
        lineBg: '#16a34a',
        textColor: '#166534',
      };
    case 'active':
      return {
        circleBg: '#2563eb',
        circleColor: '#ffffff',
        lineBg: '#93c5fd',
        textColor: '#1d4ed8',
      };
    case 'failed':
      return {
        circleBg: '#dc2626',
        circleColor: '#ffffff',
        lineBg: '#fca5a5',
        textColor: '#991b1b',
      };
    default:
      return {
        circleBg: '#e2e8f0',
        circleColor: '#475569',
        lineBg: '#e2e8f0',
        textColor: '#64748b',
      };
  }
}

function buildSteps(
  status?: string,
  created_at?: string,
  started_at?: string,
  completed_at?: string
): TimelineStep[] {
  const normalized = status?.toLowerCase();

  const queuedState: StepStatus =
    normalized === 'queued'
      ? 'active'
      : normalized === 'running' || normalized === 'completed' || normalized === 'failed'
      ? 'done'
      : 'pending';

  const runningState: StepStatus =
    normalized === 'running'
      ? 'active'
      : normalized === 'completed' || normalized === 'failed'
      ? 'done'
      : 'pending';

  const finalState: StepStatus =
    normalized === 'failed'
      ? 'failed'
      : normalized === 'completed'
      ? 'done'
      : 'pending';

  const finalLabel = normalized === 'failed' ? 'Failed' : 'Completed';

  return [
    {
      key: 'queued',
      label: 'Queued',
      time: created_at,
      state: queuedState,
    },
    {
      key: 'running',
      label: 'Running',
      time: started_at,
      state: runningState,
    },
    {
      key: 'final',
      label: finalLabel,
      time: completed_at,
      state: finalState,
    },
  ];
}

export function RunTimeline({
  status,
  created_at,
  started_at,
  completed_at,
}: RunTimelineProps) {
  const steps = buildSteps(status, created_at, started_at, completed_at);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <h2 style={{ margin: '0 0 18px', fontSize: '18px' }}>Run Timeline</h2>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        {steps.map((step, index) => {
          const style = getStepStyle(step.state);
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                flex: 1,
              }}
            >
              <div style={{ minWidth: 110 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '999px',
                    background: style.circleBg,
                    color: style.circleColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    marginBottom: 10,
                    animation: step.state === 'active' ? 'pulse 1.2s infinite' : undefined,
                  }}
                >
                  {index + 1}
                </div>

                <div style={{ fontWeight: 700, color: style.textColor, marginBottom: 4 }}>
                  {step.label}
                </div>

                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {step.time ? formatDateTime(step.time) : '-'}
                </div>
              </div>

              {!isLast ? (
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: style.lineBg,
                    borderRadius: 999,
                    marginTop: 16,
                    marginLeft: 8,
                    marginRight: 8,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}