import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Post,
  BadRequestException,
  ForbiddenException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { SupabaseService } from "../supabase/supabase.service";
import { userProfileDto } from "./dto/user-profile.dto";
import { ParseUuidPipe } from "../common/pipes/parse-uuid.pipe";
import { SuperAdminGuard } from "../auth/superadmin.guard";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard"; 

@Controller("api/auth/users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // ============================================================
  // SUPERADMIN ONLY — audit logs
  // ============================================================
  @Get("audit-logs")
  @UseGuards(SupabaseAuthGuard, SuperAdminGuard) // 👈 FIXED
  async getAuditLogs() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ============================================================
  // SUPERADMIN ONLY — list every user
  // ============================================================
  @Get()
  @UseGuards(SupabaseAuthGuard, SuperAdminGuard) // 👈 FIXED
  async getAllUsers() {
    return this.usersService.findAll();
  }

  // ============================================================
  // AUTH REQUIRED — any logged-in user
  // ============================================================
  @Get(":id")
  @UseGuards(SupabaseAuthGuard) 
  async getUser(
    @Param("id", ParseUuidPipe) id: string,
    @Req() req: any,
  ) {
    const callerId = req.user?.id ?? req.user?.sub ?? req.user?.userId;

    if (callerId !== id) {
      const callerRole = await this.getCallerRole(callerId);
      if (!["ADMIN", "SUPERADMIN"].includes(callerRole)) {
        throw new ForbiddenException("You can only view your own profile.");
      }
    }

    return this.usersService.findOne(id);
  }

  // ============================================================
  // AUTH REQUIRED — self, admin, or superadmin
  // ============================================================
  @Put(":id")
  @UseGuards(SupabaseAuthGuard) 
  async updateUser(
    @Param("id", ParseUuidPipe) id: string,
    @Body() updateData: Partial<userProfileDto>,
    @Req() req: any,
  ) {
    if (
      updateData.role &&
      !["STUDENT", "INSTRUCTOR", "ADMIN", "SUPERADMIN", "SUSPENDED"].includes(
        updateData.role.toUpperCase(),
      )
    ) {
      throw new BadRequestException("Invalid role.");
    }

    const callerId = req.user?.id ?? req.user?.sub ?? req.user?.userId;

    if (updateData.role) {
      const callerRole = await this.getCallerRole(callerId);
      if (callerRole !== "SUPERADMIN") {
        throw new ForbiddenException("Only superadmins can change roles.");
      }
    }

    if (callerId !== id) {
      const callerRole = await this.getCallerRole(callerId);
      if (!["ADMIN", "SUPERADMIN"].includes(callerRole)) {
        throw new ForbiddenException("You can only edit your own profile.");
      }
    }

    return this.usersService.update(id, updateData);
  }

  // ============================================================
  // AUTH REQUIRED — create-if-not-exists (self only)
  // ============================================================
  @Post(":id/create-if-not-exists")
  @UseGuards(SupabaseAuthGuard) 
  async getOrCreateUser(
    @Param("id", ParseUuidPipe) id: string,
    @Body() userData: Partial<userProfileDto>,
    @Req() req: any,
  ) {
    const callerId = req.user?.id ?? req.user?.sub ?? req.user?.userId;
    if (callerId !== id) {
      throw new ForbiddenException("You can only create your own profile.");
    }

    const { role, ...safe } = userData;
    return this.usersService.findOneOrCreate(
      id,
      safe as Partial<userProfileDto>,
    );
  }

  // ============================================================
  // Helper: read caller's role
  // ============================================================
  private async getCallerRole(userId?: string): Promise<string> {
    if (!userId) return "";
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.warn(`[getCallerRole] failed for ${userId}:`, error?.message);
      return "";
    }
    return (data.role ?? "").toUpperCase();
  }
}