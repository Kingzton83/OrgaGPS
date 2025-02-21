// frontend/app/components/interfaces.tsx

export type UUID = string;

export interface User {
    pk: UUID;
    email: string;
    first_name: string;
    last_name: string;
}

export interface FormValues {
    id: UUID;
    name: string;
    address1: string;
    address2: string;
    zip_code: string;
    city: string;
    country: string;
    distance_unit: string;
}

// Optional: Weitere Interfaces für API-Responses
export interface LoginResponse {
    access: string;  // Access-Token, der vom Backend zurückkommt
    refresh: string; // Refresh-Token, der vom Backend zurückkommt
    user?: User;     // Optional: Benutzerinformationen
}

export interface RefreshTokenResponse {
    access: string;
    refresh: string;
}

export interface LogoutResponse {
    message: string;
}

export interface PatchUserResponse extends User {}

interface JwtPayload {
    exp: number; // Ablaufzeit des Access Tokens
}


// frontend/app/components/interfaces.ts

export interface Schedule {
    id: number;
    event_name: string;
    start_time: string; // ISO-8601 Datum/Zeit-String
    end_time: string;   // ISO-8601 Datum/Zeit-String
    description?: string;
    is_recurring: boolean;
    recurrence_pattern?: string;
    recurrence_days?: string[];
    category?: string;
    // ... weitere Felder nach Bedarf ...
}

export interface Job {
    id: string;
    task: string;
    assigned_to: User[]; // Erwartet vollständige Objekte
    description: string;
    due_date: string | null;
    status: string;
    created_at: string;
    finished_at?: string;
    // weitere Felder...
}
  

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    // ...
}

export interface Task {
    id: string;
    product_owner: string;
    assigned_to: User[]; // WICHTIG: als Array von Usern
    scrum_master?: User;
    title: string;
    description?: string;
    due_date?: string | null;
    status: string;
    // weitere Felder...
    entries?: any[];
    jobs?: any[];
}
