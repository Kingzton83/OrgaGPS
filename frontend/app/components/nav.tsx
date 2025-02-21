"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DataFetcher } from "./get_data";
import { User } from "./interfaces";

declare global {
  interface Window {
    hcaptcha: any;
    onHCaptchaSuccess: (token: string) => void;
  }
}

/**
 * 1) PROFILE OVERLAY: "Hello, xyz" + Logout
 */
export function OpenNavProfile({
  toggleOpen,
  user,
}: {
  toggleOpen: () => void;
  user: User;
}) {
  const router = useRouter();

  async function logout() {
    try {
      const dataFetcher = new DataFetcher();
      const refreshToken = localStorage.getItem("refresh_token");

      // Optional: Call logout endpoint on the backend
      if (refreshToken) {
        await fetch(`${dataFetcher.rootPath}/dj-rest-auth/logout/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      toggleOpen();
      router.push("/");
    }
  }

  return (
    <div className="open-nav">
      <div className="a">
        <h3>Hello, {user?.first_name || "Guest"}</h3>
        <Link href="#" onClick={logout}>
          Logout
        </Link>
      </div>
    </div>
  );
}

/**
 * 2) SIGN UP FORM
 */
export function OpenNavSignup({
  toggleForm,
}: {
  toggleForm: (targetForm?: "login" | "signup" | "resend") => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPw, setConfirmedPw] = useState("");
  const [error, setError] = useState("");
  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const captchaWidgetId = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);

  const dataFetcher = new DataFetcher();

  useEffect(() => {
    if (window.hcaptcha && captchaWidgetId.current === null) {
      // Render hCaptcha only once
      captchaWidgetId.current = window.hcaptcha.render("hcaptcha-signup", {
        sitekey: "e102ebca-5564-4b4e-9632-72bc3c908326",
        size: "compact",
        callback: (token: string) => {
          console.log("hCaptcha (Signup) token:", token);
          setHcaptchaToken(token);
        },
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmedPw) {
      setError("Passwords do not match.");
      return;
    }
    if (!hcaptchaToken) {
      setError("Please complete the hCAPTCHA.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("h-captcha-response", hcaptchaToken);

    try {
      const res = await fetch(`${dataFetcher.rootPath}/api/accounts/register/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
      } else {
        // Registration successful, switch back to login form
        toggleForm("login");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="open-nav">
      <h3>Sign Up</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirm_pw">Confirm Password</label>
        <input
          type="password"
          name="confirm_pw"
          value={confirmedPw}
          onChange={(e) => setConfirmedPw(e.target.value)}
          required
        />

        {error && <p className="error-msg">{error}</p>}

        <div id="hcaptcha-signup" style={{ minHeight: "78px" }} />

        <input type="hidden" name="h-captcha-response" value={hcaptchaToken} />

        <button className="dark-btn" type="submit" disabled={loading}>
          {loading ? "Check your email" : "Sign Up"}
        </button>
      </form>

      <Link href="#" onClick={() => toggleForm("login")} className="login-a">
        Already a member?
      </Link>
    </div>
  );
}

/**
 * 3) LOGIN FORM
 *    - Wenn der Server meldet: "Your account is not activated yet", zeigen wir den Link
 *      "Need a new activation link?" im Error-Bereich an.
 *    - "Not yet a member?" bleibt *immer* sichtbar, auch bei Fehlern.
 */
export function OpenNavLogin({
  toggleOpen,
  toggleForm,
}: {
  toggleOpen: () => void;
  toggleForm: (targetForm?: "login" | "signup" | "resend") => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const captchaWidgetId = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);
  const dataFetcher = new DataFetcher();
  const router = useRouter();

  useEffect(() => {
    if (window.hcaptcha && captchaWidgetId.current === null) {
      // Render hCaptcha only once
      captchaWidgetId.current = window.hcaptcha.render("hcaptcha-login", {
        sitekey: "e102ebca-5564-4b4e-9632-72bc3c908326",
        size: "compact",
        callback: (token: string) => {
          console.log("hCaptcha (Login) token:", token);
          setHcaptchaToken(token);
        },
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!hcaptchaToken) {
      setError("Please complete the hCAPTCHA.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${dataFetcher.rootPath}/api/accounts/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          "h-captcha-response": hcaptchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save tokens
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);

        // Navigate away (e.g. to dashboard)
        router.push("/dashboard");
      } else {
        // Show error from backend
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Prüfen, ob die Fehlermeldung auf ein inaktives Konto hinweist (z.B. "Your account is not activated yet.")
  const showResendActivationLink = error.includes("not activated");

  return (
    <div className="open-nav">
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Error-Bereich */}
        {error && (
          <div className="error-area">
            <p className="error-msg">{error}</p>
            {showResendActivationLink && (
              <Link
                href="#"
                onClick={() => toggleForm("resend")}
                className="login-a"
              >
                Need a new activation link?
              </Link>
            )}
          </div>
        )}

        {/* Der Forgot password? Link immer sichtbar */}
        <Link href="#" onClick={() => toggleForm("resetpassword")} className="login-a">
          Forgot password?
        </Link>

        <div id="hcaptcha-login" style={{ minHeight: "78px" }} />

        <input type="hidden" name="h-captcha-response" value={hcaptchaToken} />

        <button className="dark-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Dieser Link bleibt IMMER sichtbar, egal ob Error oder nicht */}
      <Link href="#" onClick={() => toggleForm("signup")} className="login-a">
        Not yet a member?
      </Link>
    </div>

  );
}

// In nav.tsx oder in einer separaten Datei (z. B. components/OpenNavResetPassword.tsx)

export function OpenNavResetPassword({
  toggleForm,
}: {
  toggleForm: (targetForm?: "login" | "signup" | "resend" | "resetpassword") => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const captchaWidgetId = useRef<number | null>(null);
  const dataFetcher = new DataFetcher();

  useEffect(() => {
    if (window.hcaptcha && captchaWidgetId.current === null) {
      captchaWidgetId.current = window.hcaptcha.render("hcaptcha-reset", {
        sitekey: "e102ebca-5564-4b4e-9632-72bc3c908326",
        size: "compact",
        callback: (token: string) => {
          setHcaptchaToken(token);
        },
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!hcaptchaToken) {
      setError("Please complete the hCAPTCHA.");
      return;
    }
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${dataFetcher.rootPath}/api/accounts/password-reset-request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          "h-captcha-response": hcaptchaToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to request password reset.");
      } else {
        setInfo("A password reset link has been sent. Please check your email.");
      }
    } catch (err) {
      console.error("Error requesting password reset:", err);
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="open-nav">
      <h3>Reset Password</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Your Email</label>
        <input
          type="email"
          name="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="error-msg">{error}</p>}
        {info && <p style={{ color: "darkgreen" }}>{info}</p>}
        <div id="hcaptcha-reset" style={{ minHeight: "78px" }} />
        <button className="dark-btn" type="submit" disabled={loading}>
          {loading ? "Requesting..." : "Reset Password"}
        </button>
      </form>
      <Link href="#" onClick={() => toggleForm("login")} className="login-a">
        back to login
      </Link>
    </div>
  );
}


/**
 * 4) RESEND ACTIVATION FORM
 */
export function OpenNavResendActivation({
  toggleOpen,
  toggleForm,
}: {
  toggleOpen: () => void;
  toggleForm: (targetForm?: "login" | "signup" | "resend") => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const captchaWidgetId = useRef<number | null>(null);

  const dataFetcher = new DataFetcher();

  useEffect(() => {
    if (window.hcaptcha && captchaWidgetId.current === null) {
      captchaWidgetId.current = window.hcaptcha.render("hcaptcha-resend", {
        sitekey: "e102ebca-5564-4b4e-9632-72bc3c908326",
        size: "compact",
        callback: (token: string) => {
          setHcaptchaToken(token);
        },
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!hcaptchaToken) {
      setError("Please complete the hCAPTCHA.");
      return;
    }
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${dataFetcher.rootPath}/api/accounts/resend-activation/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          "h-captcha-response": hcaptchaToken,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend activation link.");
      } else {
        setInfo("A new activation link has been sent. Please check your email.");
      }
    } catch (err) {
      console.error("Error requesting new activation link:", err);
      setError("An error occured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="open-nav">
      <h3>Request new Activation Link</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Your Email</label>
        <input
          type="email"
          name="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p className="error-msg">{error}</p>}
        {info && <p style={{ color: "darkgreen" }}>{info}</p>}

        <div id="hcaptcha-resend" style={{ minHeight: "78px" }} />

        <button className="dark-btn" type="submit" disabled={loading}>
          {loading ? "Requesting..." : "Request activation link"}
        </button>
      </form>

      <Link href="#" onClick={() => toggleForm("login")} className="login-a">
        back to login
      </Link>
    </div>
  );
}

/**
 * Activate Account Page
 */
export function ActivateAccountPage({
  toggleForm,
}: {
  toggleForm: (targetForm?: "login" | "signup" | "resend" | "activate") => void;
}) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const searchParams = useSearchParams();

  const uidb64 = searchParams.get("uidb64");
  const token = searchParams.get("token");

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await fetch("/api/accounts/activate/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uidb64, token }),
        });
        const data = await response.json();
        if (response.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };
  
    if (uidb64 && token) {
      activateAccount();
    } else {
      setStatus("error");
    }
  }, [uidb64, token]);


  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status !== "loading" && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            timerRef.current = null;
            if (status === "success") {
              router.push("/");  // Weiterleitung zum Login-Formular
            } else {
              router.push("/");       // Weiterleitung zur Homepage
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

  return (
    <div className="open-nav">
      {status === "loading" && <h3>Validating your activation link...</h3>}

      {status === "success" && (
        <>
          <h3>Your account has been successfully activated!</h3>
          <p>You are being redirected to the login in {countdown} seconds.</p>
          <Link href="#" onClick={() => toggleForm("login")}>
            or click here
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <h3>Your activation link is invalid or has expired.</h3>
          <p>You are being redirected to OrgaGPS in {countdown} seconds.</p>
          <Link href="/">or click here</Link>

        </>
      )}
    </div>
  );
}

/**
 * Main Overlay Component
 */
// In OpenNav (im nav.tsx)
export function OpenNav({
  toggleOpen,
  dataFetcher,
  user,
}: {
  toggleOpen: () => void;
  dataFetcher: any;
  user: User | null;
}) {
  const [form, setForm] = useState<"login" | "signup" | "resend" | "activate" | "resetpassword">("login");

  function toggleForm(targetForm?: "login" | "signup" | "resend" | "activate" | "resetpassword") {
    if (targetForm) {
      setForm(targetForm);
    } else {
      setForm((prev) => (prev === "login" ? "signup" : "login"));
    }
  }

  if (user) {
    return <OpenNavProfile toggleOpen={toggleOpen} user={user} />;
  }

  return (
    <div>
      {form === "login" && <OpenNavLogin toggleOpen={toggleOpen} toggleForm={toggleForm} />}
      {form === "signup" && <OpenNavSignup toggleForm={toggleForm} />}
      {form === "resend" && <OpenNavResendActivation toggleOpen={toggleOpen} toggleForm={toggleForm} />}
      {form === "activate" && <ActivateAccountPage toggleForm={toggleForm} />}
      {form === "resetpassword" && <OpenNavResetPassword toggleForm={toggleForm} />}
    </div>
  );
}


/**
 * 6) BOTTOM NAV: Normal site navigation + link to overlay
 */
export function BottomNav({
  toggleOpen,
  user,
}: {
  toggleOpen: () => void;
  user: User | null;
}) {
  return (
    <div className="bottom-nav">
      <div className="left">
        <Link href="/">Orgagps</Link>
      </div>
      <div className="right">
        <Link href="/#vision" scroll>
          Our Vision
        </Link>
        <Link href="/#faq" scroll>
          FAQs
        </Link>
        <Link href="/#aboutus" scroll>
          About Us
        </Link>
        {user && user.product_owner && (
          <>
            <Link href="/users">Users</Link>
            <Link href="/locations">Locations</Link>
            <Link href="/schedules">Schedules</Link>
            <Link href="/groups">Groups</Link>
          </>
        )}
        {user ? (
          <Link href="#" onClick={toggleOpen} className="logged">
            {user.first_name ? user.first_name.slice(0, 2).toUpperCase() : "User"}
          </Link>
        ) : (
          <Link href="#" onClick={toggleOpen} className="login">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * 7) TOP-LEVEL NAVBAR COMPONENT: Toggles open/close the overlay
 */
export function NavBar({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  const dataFetcher = new DataFetcher();

  return !isOpen ? (
    <nav className="closed">
      <BottomNav toggleOpen={toggleOpen} user={user} />
    </nav>
  ) : (
    <nav className="open">
      <button className="x-btn" onClick={toggleOpen}>
        x
      </button>
      <div className="overlay">
        <div className="overlay-content">
          <OpenNav toggleOpen={toggleOpen} dataFetcher={dataFetcher} user={user} />
        </div>
      </div>
    </nav>
  );
}
