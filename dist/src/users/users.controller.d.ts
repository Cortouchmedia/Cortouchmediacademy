import { UsersService } from "./users.service";
import { userProfileDto } from "./dto/user-profile.dto";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(): Promise<any[]>;
    getUser(id: string): Promise<any>;
    updateUser(id: string, updateData: Partial<userProfileDto>): Promise<any>;
    getOrCreateUser(id: string, userData: Partial<userProfileDto>): Promise<any>;
}
