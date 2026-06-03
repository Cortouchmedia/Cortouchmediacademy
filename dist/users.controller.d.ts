import { UsersService } from './users.service';
import { SupabaseService } from './supabase.service';
export declare class UsersController {
    private readonly usersService;
    private readonly supabaseService;
    constructor(usersService: UsersService, supabaseService: SupabaseService);
    getMyProfile(req: any): Promise<any>;
    updateMyProfile(req: any, body: any): Promise<any>;
    getUsersByRole(role: 'student' | 'instructor' | 'admin'): Promise<any[]>;
}
