"use client";

export default function GlobalError({ error, reset }) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '40px 20px',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ fontSize: '22px', marginBottom: '12px', color: '#ffa116' }}>
                Something went wrong
            </h2>
            <p style={{
                fontSize: '14px',
                color: '#999',
                maxWidth: '400px',
                lineHeight: '1.6',
                marginBottom: '24px',
            }}>
                This may be caused by an outdated browser cache. Try clearing your cache
                or opening this page in a private/incognito window.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={() => reset()}
                    style={{
                        padding: '12px 24px',
                        background: '#ffa116',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                    }}
                >
                    Try Again
                </button>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '12px 24px',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        fontWeight: '500',
                        fontSize: '14px',
                        cursor: 'pointer',
                    }}
                >
                    Reload Page
                </button>
            </div>
        </div>
    );
}
