import { AuthService } from "./auth.service";
import { SupabaseService } from "../../supabase.service";
import { RegisterDto } from "./dto/register.dto";
export declare class AuthController {
    private readonly authService;
    private readonly supabaseService;
    private readonly logger;
    constructor(authService: AuthService, supabaseService: SupabaseService);
    checkAuthStatus(): {
        message: string;
    };
    signup(registerDto: RegisterDto): Promise<{
        message: string;
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
    }>;
    signin(body: {
        email?: string;
        password?: string;
    }): Promise<{
        message: string;
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
    }>;
    signout(): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<{
        profile: any;
        id: string;
        app_metadata: import("@supabase/auth-js").UserAppMetadata;
        user_metadata: import("@supabase/auth-js").UserMetadata;
        aud: string;
        confirmation_sent_at?: string;
        recovery_sent_at?: string;
        email_change_sent_at?: string;
        new_email?: string;
        new_phone?: string;
        invited_at?: string;
        action_link?: string;
        email?: string;
        phone?: string;
        created_at: string;
        confirmed_at?: string;
        email_confirmed_at?: string;
        phone_confirmed_at?: string;
        last_sign_in_at?: string;
        role?: string;
        updated_at?: string;
        identities?: import("@supabase/auth-js").UserIdentity[];
        is_anonymous?: boolean;
        is_sso_user?: boolean;
        factors?: (import("@supabase/auth-js").Factor<import("@supabase/auth-js").FactorType, "verified"> | import("@supabase/auth-js").Factor<import("@supabase/auth-js").FactorType, "unverified">)[];
        deleted_at?: string;
        banned_until?: string;
    }>;
    updateUser(userId: string, updateData: {
        full_name?: string;
        role?: string;
    }, req: any): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            full_name: string;
            role: string;
            profile: any;
        };
    }>;
}
