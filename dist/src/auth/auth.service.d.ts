import { SupabaseService } from "../../supabase.service";
export declare class AuthService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    signup(email: string, full_name: string, password: string, role?: "STUDENT" | "INSTRUCTOR" | "ADMIN" | "SUPERADMIN"): Promise<{
        message: string;
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
    }>;
    signin(email: string, pass: string): Promise<{
        message: string;
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
    }>;
    signOut(): Promise<{
        message: string;
    }>;
    private createUserProfile;
}
