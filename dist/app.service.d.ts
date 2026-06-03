import { SupabaseService } from './supabase.service';
export declare class AppService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getHello(): string;
    getCourses(): Promise<any[]>;
    signup(full_name: string, email: string, password: string, location?: string, website?: string, role?: string): Promise<{
        error: string;
        user?: undefined;
        profile?: undefined;
    } | {
        user: import("@supabase/auth-js").User;
        profile: any;
        error?: undefined;
    }>;
    login(email: string, password: string): Promise<{
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
        weakPassword?: import("@supabase/auth-js").WeakPassword;
    } | {
        error: string;
    }>;
    signOut(): Promise<{
        error: string;
        message?: undefined;
    } | {
        message: string;
        error?: undefined;
    }>;
    getUserProfile(userId: string): Promise<any>;
    currentUSerProfile(): Promise<any>;
}
