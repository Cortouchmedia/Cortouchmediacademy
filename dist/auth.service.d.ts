import { SupabaseService } from './supabase.service';
export declare class AuthService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    register(email: string, password: string, metadata: any): Promise<{
        user: import("@supabase/auth-js").User | null;
        session: import("@supabase/auth-js").Session | null;
    } | {
        user: null;
        session: null;
    }>;
    login(email: string, password: string): Promise<{
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
        weakPassword?: import("@supabase/auth-js").WeakPassword;
    } | {
        user: null;
        session: null;
        weakPassword?: null;
    }>;
    signOut(): Promise<{
        message: string;
    }>;
}
