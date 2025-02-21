// frontend/app/components/get_data.tsx

import { User, UUID, RefreshTokenResponse, Schedule } from "./interfaces";

/** JWT-Payload Interface (benötigst du, um exp etc. auszuwerten) */
interface JwtPayload {
    exp: number; // Ablaufzeit des Tokens (Unix Timestamp)
    // Weitere Felder nach Bedarf
}

/**
 * Nimmt einen JWT-String entgegen und decodiert dessen Payload.
 * @param token JWT (z.B. "xxxxx.yyyyy.zzzzz")
 * @returns Decodiertes JSON oder `null` bei Fehler
 */
function parseJwt(token: string): JwtPayload | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error parsing JWT:", error);
        return null;
    }
}

/**
 * Zentraler DataFetcher, der sämtliche API-Requests kapselt.
 * Er kümmert sich um:
 * - Token-Speicherung (access/refresh)
 * - Token-Aktualisierung (refresh)
 * - Aufruf diverser Endpoints (get/post/patch/delete)
 */
export class DataFetcher {
    rootPath: string = process.env.NEXT_PUBLIC_API_ROOT || "http://localhost:8000/";
    accessToken: string | null = null;
    refreshToken: string | null = null;
    private refreshTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        if (typeof window !== "undefined") {
            this.accessToken = localStorage.getItem("access_token");
            this.refreshToken = localStorage.getItem("refresh_token");
            console.log("Initial tokens:", this.accessToken, this.refreshToken);
            this.scheduleTokenRefresh();
        }
    }

    /** Schnellzugriff: Access-Token */
    get token(): string | null {
        return this.accessToken;
    }

    /** Basis-Header für REST-Requests */
    get headers(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        console.log("Headers set for request:", headers);
        return headers;
    }

    /**
     * Holt die aktuellen User-Infos vom Backend (Profil).
     * Erwartet GET /api/accounts/user/
     */
    async currentUser(): Promise<User | null> {
        console.log("[DataFetcher] currentUser() => accessToken =", this.accessToken);

        try {
            console.log("Fetching current user with access token:", this.accessToken);

            // Falls kein Access-Token da => versuche Refresh
            if (!this.accessToken) {
                console.warn("No access token found, attempting to refresh tokens.");
                const refreshed = await this.refreshTokens();
                if (!refreshed) throw new Error("Session expired. Redirecting to login.");
            }

            // API-Call: GET /api/accounts/user/
            const res = await fetch(`${this.rootPath}/user/`, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });

            if (res.ok) {
                console.log("Successfully fetched current user.");
                return await res.json();
            } else if (res.status === 401) {
                console.warn("Access token invalid or expired, attempting to refresh tokens.");
                const refreshed = await this.refreshTokens();
                if (refreshed) {
                    // Neuer Token => Erneut versuchen
                    return await this.currentUser();
                }
                throw new Error("Could not refresh tokens. Redirecting to login.");
            }

            throw new Error(`Failed to fetch user: ${res.status}`);
        } catch (error) {
            console.error("Error in currentUser:", error);
            this.logout(); // Wirft User zurück auf /
            return null;
        }
    }

    /**
     * Versucht das Refresh-Token zu nutzen, um ein neues Access-Token
     * zu bekommen. Ruft POST /api/accounts/refresh/
     */
    async refreshTokens(): Promise<boolean> {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
            console.warn("No refresh token available.");
            this.logout();
            return false;
        }

        try {
            console.log("Refreshing tokens...");
            // Neuer Endpunkt: /api/accounts/refresh/
            const res = await fetch(`${this.rootPath}/refresh/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (res.ok) {
                const data = await res.json();
                // Speichere neue Tokens in localStorage
                localStorage.setItem("access_token", data.access);
                if (data.refresh) {
                    localStorage.setItem("refresh_token", data.refresh);
                }
                this.accessToken = data.access;
                this.refreshToken = data.refresh;
                this.scheduleTokenRefresh();
                return true;
            } else {
                console.error("Token refresh failed with status:", res.status);
                this.logout();
                return false;
            }
        } catch (error) {
            console.error("Error during token refresh:", error);
            this.logout();
            return false;
        }
    }

    /**
     * Plant einen Timer, kurz vor Ablauf des Access-Tokens erneut
     * das Refresh-Token zu ziehen.
     */
    scheduleTokenRefresh() {
        try {
            if (this.accessToken) {
                const decoded = parseJwt(this.accessToken);
                if (!decoded) throw new Error("Invalid token");

                // 5 Minuten Puffer
                const buffer = 5 * 60 * 1000; // ms
                const timeout = decoded.exp * 1000 - Date.now() - buffer;

                console.log(`Token will refresh in ${(timeout / 60000).toFixed(2)} minutes.`);

                if (timeout <= 0) {
                    console.log("Token is about to expire soon, refreshing immediately...");
                    this.refreshTokens().catch((error) => {
                        console.error("Error during token refresh:", error);
                        this.logout();
                    });
                } else {
                    if (this.refreshTimeout) {
                        clearTimeout(this.refreshTimeout);
                    }
                    this.refreshTimeout = setTimeout(() => this.refreshTokens(), timeout);
                }
            }
        } catch (error) {
            console.error("Error scheduling token refresh:", error);
            this.logout();
        }
    }

    /**
     * Führt den Login über POST /api/accounts/login/ aus.
     * Backend muss in seiner Response { user: {...}, tokens: { access, refresh } } liefern.
     */
    async login(email: string, password: string): Promise<void> {
        try {
            const response = await fetch(`${this.rootPath}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("Login response data:", data);

            if (response.ok) {
                // { user: {...}, tokens: { access, refresh } }
                // 1) Alte Tokens entfernen
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');

                // 2) Neue speichern
                localStorage.setItem('access_token', data.tokens.access);
                localStorage.setItem('refresh_token', data.tokens.refresh);

                this.accessToken = data.tokens.access;
                this.refreshToken = data.tokens.refresh;

                // 3) Timer anwerfen
                this.scheduleTokenRefresh();

                // 4) ggf. Redirect
                window.location.href = '/dashboard';
            } else {
                // Unbekannte Credentials => error
                console.error('Login failed:', data);
                alert(`Login failed: ${data.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred during login.");
        }
    }

    /**
     * Logout => Tokens entfernen, redirect zu "/"
     */
    async logout(): Promise<void> {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
    }

    /**
     * Holt alle Schedules => GET /api/calendar/user_schedule_list/
     */
    async getUserSchedules(): Promise<Schedule[] | null> {
        try {
            const data = await this.getData('api/calendar/user_schedule_list/');
            return data;
        } catch (error) {
            console.error("Error in getUserSchedules:", error);
            return null;
        }
    }

    /**
     * POST-Request mit JSON-Körper
     */
    async postData<T>(url: string, data: any): Promise<T | null> {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const res = await fetch(`${this.rootPath}/${url}`, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Request failed");
        }

        return await res.json();
    }

    /**
     * GET-Request (geschützt)
     */
    async getData(req: string): Promise<any | null> {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No access token available');

            console.log(`Fetching data from ${req} with token: ${token}`);
            const response = await fetch(`${this.rootPath}/${req}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                return await response.json();
            } else if (response.status === 401) {
                console.warn('Access token expired, attempting to refresh tokens.');
                const refreshed = await this.refreshTokens();
                if (refreshed) return await this.getData(req); 
                throw new Error('Could not refresh tokens. Redirecting to login.');
            } else {
                console.error(`Failed to fetch data from ${req} with status: ${response.status}`);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching data from ${req}:`, error);
            this.logout();
            return null;
        }
    }

    /**
     * PATCH-Request
     */
    async patchData(path: string, id: UUID, body: any): Promise<Response | undefined> {
        const userHeaders = { ...this.headers };
        userHeaders['Authorization'] = `Bearer ${this.token}`;

        try {
            const res = await fetch(`${this.rootPath}/${path}/${id}/`, {
                method: 'PATCH',
                headers: userHeaders,
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                throw new Error('Failed to patch data');
            }

            return res;
        } catch (err) {
            console.log('PATCH ERROR:', err);
            return;
        }
    }

    /**
     * DELETE-Request
     */
    async deleteData(path: string, id: UUID, useAuth = true): Promise<boolean> {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (useAuth && this.accessToken) {
            headers["Authorization"] = `Bearer ${this.accessToken}`;
        }

        try {
            const res = await fetch(`${this.rootPath}/${path}/${id}/`, {
                method: "DELETE",
                headers,
            });

            if (!res.ok) {
                console.error(`DELETE request failed. Status: ${res.status}`);
                return false;
            }
            return true;
        } catch (err) {
            console.error("DELETEDATA ERROR:", err);
            return false;
        }
    }

        /**
     * Holt alle Tasks.
     * Erwartet GET /api/db/tasks/ (Passe den Endpunkt ggf. an)
     */
    async getTasks(): Promise<any | null> {
        try {
            const data = await this.getData('api/db/tasks/');
            return data;
        } catch (error) {
            console.error("Error in getTasks:", error);
            return null;
        }
    }
    

    // Falls du mal lokal eine UUID generieren willst (optional)
    generateUUID(): UUID {
        throw new Error("UUID generation not implemented.");
    }
}
