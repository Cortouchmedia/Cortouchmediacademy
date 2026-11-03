import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Post,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service"; 
import { SupabaseService } from "../supabase/supabase.service"; 
import { userProfileDto } from "./dto/user-profile.dto"; 
import { ParseUuidPipe } from '../common/pipes/parse-uuid.pipe';

@Controller("api/auth/users")
@UseGuards(AuthGuard('jwt')) 
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseService: SupabaseService, 
  ) {}

  // 👈 1. THIS MUST BE AT THE TOP!
  @Get("audit-logs")
  async getAuditLogs() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // 👈 2. These go below it
  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(":id")
  async getUser(@Param("id", ParseUuidPipe) id: string) {
    console.log(`[getUser] id="${id}"`);
    return this.usersService.findOne(id);
  }
  
  @Put(":id")
  async updateUser(
    @Param("id", ParseUuidPipe) id: string,
    @Body() updateData: Partial<userProfileDto>,
  ) {
    if (
      updateData.role &&
      !["STUDENT", "INSTRUCTOR", "ADMIN", "SUPERADMIN", "SUSPENDED"].includes(updateData.role.toUpperCase())
    ) {
      throw new BadRequestException("Invalid role.");
    }
    return this.usersService.update(id, updateData);
  }
  
  @Post(":id/create-if-not-exists")
  async getOrCreateUser(
    @Param("id", ParseUuidPipe) id: string,
    @Body() userData: Partial<userProfileDto>,
  ) {
    return this.usersService.findOneOrCreate(id, userData);
  }
}