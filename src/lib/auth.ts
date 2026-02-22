// ─── Auth utility (localStorage-based) ───────────────────────────────────────

export interface AuthUser {
    username: string;
    role: 'admin' | 'usuario' | 'secretario';
    displayName: string;
}

export interface StoredUser extends AuthUser {
    password: string;
}

const USERS_KEY = 'dental_users';
const AUTH_KEY = 'dental_auth';
const CLINIC_KEY = 'dental_clinic';

/** Default seed users — loaded once. */
const DEFAULT_USERS: StoredUser[] = [
    { username: 'admin', password: 'admin123', role: 'admin', displayName: 'Administrador' },
];

// ─── User store helpers ───────────────────────────────────────────────────────

export function getAllUsers(): StoredUser[] {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    try {
        const raw = localStorage.getItem(USERS_KEY);
        if (!raw) {
            localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
            return DEFAULT_USERS;
        }
        return JSON.parse(raw) as StoredUser[];
    } catch {
        return DEFAULT_USERS;
    }
}

function saveUsers(users: StoredUser[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addUser(user: StoredUser): { ok: boolean; error?: string } {
    const users = getAllUsers();
    if (users.find(u => u.username === user.username)) {
        return { ok: false, error: 'El usuario ya existe.' };
    }
    saveUsers([...users, user]);
    return { ok: true };
}

export function updateUser(
    username: string,
    changes: Partial<Omit<StoredUser, 'username'>>
): { ok: boolean; error?: string } {
    const users = getAllUsers();
    const idx = users.findIndex(u => u.username === username);
    if (idx === -1) return { ok: false, error: 'Usuario no encontrado.' };
    users[idx] = { ...users[idx], ...changes };
    saveUsers(users);
    // Update the session if it's the current user
    const session = getCurrentUser();
    if (session?.username === username) {
        const { password: _, ...authUser } = users[idx];
        localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    }
    return { ok: true };
}

export function deleteUser(username: string): { ok: boolean; error?: string } {
    const users = getAllUsers();
    if (username === 'admin') return { ok: false, error: 'No se puede eliminar al admin principal.' };
    const filtered = users.filter(u => u.username !== username);
    saveUsers(filtered);
    return { ok: true };
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export function login(username: string, password: string): AuthUser | null {
    const users = getAllUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) return null;
    const user: AuthUser = { username: found.username, role: found.role, displayName: found.displayName };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
}

export function logout(): void {
    localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        return null;
    }
}

export function isLoggedIn(): boolean {
    return getCurrentUser() !== null;
}

// ─── Clinic info ──────────────────────────────────────────────────────────────

export interface ClinicInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    cuit: string;
    website: string;
}

const DEFAULT_CLINIC: ClinicInfo = {
    name: 'DentalCare Consultorio',
    address: '',
    phone: '',
    email: '',
    cuit: '',
    website: '',
};

export function getClinicInfo(): ClinicInfo {
    if (typeof window === 'undefined') return DEFAULT_CLINIC;
    try {
        const raw = localStorage.getItem(CLINIC_KEY);
        return raw ? { ...DEFAULT_CLINIC, ...JSON.parse(raw) } : DEFAULT_CLINIC;
    } catch {
        return DEFAULT_CLINIC;
    }
}

export function saveClinicInfo(info: ClinicInfo): void {
    localStorage.setItem(CLINIC_KEY, JSON.stringify(info));
}
