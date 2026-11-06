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
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";
import { SupabaseService } from "../supabase/supabase.service";
import { userProfileDto } from "./dto/user-profile.dto";
import { ParseUuidPipe } from "../common/pipes/parse-uuid.pipe";
import { SuperAdminGuard } from "../auth/superadmin.guard";

@Controller("api/auth/users")
// ❌ REMOVED: @UseGuards(AuthGuard("jwt")) at class level
// That guard ran BEFORE the per-route guards, so it rejected the request
// before SuperAdminGuard's role check (and superadmin bypass) could fire.
// Each route now declares exactly the guard it needs.
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // ============================================================
  // SUPERADMIN ONLY — audit logs
  // SuperAdminGuard extends RoleGuard extends AuthGuard("jwt"),
  // so the token is verified AND the role is checked (with bypass).
  // ============================================================
  @Get("audit-logs")
  @UseGuards(SuperAdminGuard)
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
  @UseGuards(SuperAdminGuard)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  // ============================================================
  // AUTH REQUIRED — any logged-in user (self, admin, or superadmin)
  // ============================================================
  @Get(":id")
  @UseGuards(AuthGuard("jwt"))
  async getUser(
    @Param("id", ParseUuidPipe) id: string,
    @Req() req: any,
  ) {
    const callerId = req.user?.sub ?? req.user?.userId ?? req.user?.id;

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
  // Role changes inside this handler are further restricted to SUPERADMIN
  // ============================================================
  @Put(":id")
  @UseGuards(AuthGuard("jwt"))
  async updateUser(
    @Param("id", ParseUuidPipe) id: string,
    @Body() updateData: Partial<userProfileDto>,
    @Req() req: any,
  ) {
    // 1. Validate role value if provided
    if (
      updateData.role &&
      !["STUDENT", "INSTRUCTOR", "ADMIN", "SUPERADMIN", "SUSPENDED"].includes(
        updateData.role.toUpperCase(),
      )
    ) {
      throw new BadRequestException("Invalid role.");
    }

    const callerId = req.user?.sub ?? req.user?.userId ?? req.user?.id;

    // 2. Role changes are SUPERADMIN only
    if (updateData.role) {
      const callerRole = await this.getCallerRole(callerId);
      if (callerRole !== "SUPERADMIN") {
        throw new ForbiddenException("Only superadmins can change roles.");
      }
    }

    // 3. A user may edit their own profile; admins+ may edit anyone's
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
  // Role is stripped so this route can never escalate privileges
  // ============================================================
  @Post(":id/create-if-not-exists")
  @UseGuards(AuthGuard("jwt"))
  async getOrCreateUser(
    @Param("id", ParseUuidPipe) id: string,
    @Body() userData: Partial<userProfileDto>,
    @Req() req: any,
  ) {
    const callerId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
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
  // Helper: read caller's role via service-role client
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