import { SupabaseService } from './supabase.service';
export declare class UsersService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, profileData: any): Promise<any>;
    getAllByRole(role: 'student' | 'instructor' | 'admin'): Promise<any[]>;
}
