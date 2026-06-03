import { SupabaseService } from "../../supabase.service";
export declare class UsersService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findOneOrCreate(id: string, defaultData?: any): Promise<any>;
    create(id: string, userData?: any): Promise<any>;
    update(id: string, updates: any): Promise<any>;
    adminFindAll(): Promise<any[]>;
    adminUpdate(id: string, updates: any): Promise<any>;
}
