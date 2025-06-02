// app/confirm/page.js
import React from 'react';

export default async function Confirm({ searchParams }) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return <div>Missing token</div>;
  }

  let success = false;
  let message = '';

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/confirm?token=${token}`, {
      method: 'POST',
      cache: 'no-store',  // evita cache in SSR
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      message = data.message || 'Confirmation error';
    } else {
      success = true;
      message = 'Email successfully confirmed!';
    }
  } catch (error) {
    message = 'Netwirk error: ' + error.message;
  }

  return (
    <div>
      {success ? (
        <div style={{ color: 'green' }}>
          <h2>Successo!</h2>
          <p>{message}</p>
        </div>
      ) : (
        <div style={{ color: 'red' }}>
          <h2>Errore</h2>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
