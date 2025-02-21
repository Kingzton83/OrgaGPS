'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function PasswordReset() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [countdown, setCountdown] = useState(7);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const uidb64 = searchParams.get('uidb64');
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setStatus("loading");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/accounts/password-reset-confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uidb64, token, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setInfo("Password has been reset successfully. Redirecting to login...");
        setStatus("success");
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      } else {
        setError(data.error || "Password reset failed.");
        setStatus("error");
      }
    } catch (err) {
      console.error('Error during password reset:', err);
      setError("An unexpected error occurred.");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status === "error" && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            timerRef.current = null;
            router.push('/');
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

  if (status === "loading" || status === "idle") {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#fff'
      }}>
        <h3>Reset Your Password</h3>
        <form onSubmit={handleSubmit} style={{
          width: '300px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={status === "loading"} style={{ marginTop: '1rem' }}>
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <Link href="/login" style={{ marginTop: '1rem' }}>Back to Login</Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#fff'
      }}>
        <h3>Password Reset Successful!</h3>
        <p>{info}</p>
        <p>Redirecting to login in 5 seconds...</p>
        <Link href="/login">or click here</Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#fff'
      }}>
        <h3>Your password reset link is invalid or has expired.</h3>
        <p>You are being redirected in {countdown} seconds.</p>
        <Link href="/">or click here</Link>
      </div>
    );
  }

  return null;
}
