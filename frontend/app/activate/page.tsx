'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Activate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(7);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Extrahiere uidb64 und token aus den Query-Parametern
  const uidb64 = searchParams.get('uidb64');
  const token = searchParams.get('token');

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/accounts/activate/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uidb64, token }),
        });
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error('Error during activation:', err);
        setStatus("error");
      }
    };

    if (uidb64 && token) {
      activateAccount();
    } else {
      setStatus("error");
    }
  }, [uidb64, token]);

  useEffect(() => {
    if (status !== "loading" && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            timerRef.current = null;
            // Je nach Status weiterleiten:
            if (status === "success") {
              router.push('/'); // oder an eine andere Seite weiterleiten
            } else {
              router.push('/');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, router]);

  // Während der Aktivierung anzeigen
  if (status === "loading") {
    return <div>Validating your activation link...</div>;
  }

  // Bei Fehler anzeigen
  if (status === "error") {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h3>Your activation link is invalid or has expired.</h3>
        <p>You are being redirected to OrgaGPS in {countdown} seconds.</p>
        <Link href="/">or click here</Link>
      </div>
    );
  }

  // Bei Erfolg anzeigen
  if (status === "success") {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h3>Your account has been successfully activated!</h3>
        <p>You are being redirected to the login page in {countdown} seconds.</p>
        <Link href="/login">or click here</Link>
      </div>
    );
  }

  return null;
}
