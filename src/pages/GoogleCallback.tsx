import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../components/shared/Icon';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // StrictMode runs useEffect twice, so we use a ref to prevent double calls
  const hasCalled = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const authError = searchParams.get('error');

    if (authError) {
      setError(`Google login failed: ${authError}`);
      return;
    }

    if (!code) {
      setError('No authorization code provided by Google.');
      return;
    }

    if (!hasCalled.current) {
      hasCalled.current = true;
      
      // Use native fetch instead of useMutation so the promise resolves and redirects
      // even if React StrictMode unmounts the original component instance.
      import('../api/client').then(({ default: client }) => {
        client.post('/auth/google', { code })
          .then((res) => {
            const data = res.data;
            import('js-cookie').then(({ default: Cookies }) => {
              Cookies.set("access_token", data.access_token, { expires: 1 / 48 });
              Cookies.set("refresh_token", data.refresh_token, { expires: 7 });
              if (data.name) Cookies.set("user_name", data.name, { expires: 7 });
              // Force a hard reload to the dashboard so auth context properly refreshes.
              window.location.replace('/dashboard');
            });
          })
          .catch((err: any) => {
            setError(err.response?.data?.detail || 'Failed to authenticate with Google. Please try again.');
          });
      });
    }
  }, [searchParams, navigate]);

  return (
    <div className="login-page">
      <div className="login-panel" style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="brand" style={{ padding: 0, marginBottom: 32 }}>
          <div className="brand-mark" style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.08)' }} />
          <div>
            <div className="brand-name" style={{ color: 'white' }}>Creator OS</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', maxWidth: 400, background: 'rgba(255,255,255,0.05)', padding: 40, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
          {error ? (
            <>
              <div style={{ color: 'var(--accent)', marginBottom: 16 }}>
                <Icon name="alertCircle" size={48} />
              </div>
              <h2 className="h2" style={{ marginBottom: 12 }}>Authentication Failed</h2>
              <p className="muted" style={{ marginBottom: 24 }}>{error}</p>
              <button className="btn secondary" onClick={() => navigate('/login')}>
                Return to Login
              </button>
            </>
          ) : (
            <>
              <div style={{ color: 'var(--accent)', marginBottom: 24 }} className="animate-spin">
                <Icon name="loader" size={48} />
              </div>
              <h2 className="h2" style={{ marginBottom: 12 }}>Authenticating</h2>
              <p className="muted">Please wait while we securely sign you in with Google...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
