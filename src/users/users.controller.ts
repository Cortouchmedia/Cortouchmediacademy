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
@UseGuards(AuthGuard("jwt"))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // 🔒 SUPERADMIN ONLY — must stay above ":id" routes
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

  // 🔒 SUPERADMIN ONLY — listing every user is sensitive
  @Get()
  @UseGuards(SuperAdminGuard)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(":id")
  async getUser(
    @Param("id", ParseUuidPipe) id: string,
    @Req() req: any,
  ) {
    const callerId = req.user?.sub ?? req.user?.id;

    if (callerId !== id) {
      const callerRole = await this.getCallerRole(callerId);
      if (!["ADMIN", "SUPERADMIN"].includes(callerRole)) {
        throw new ForbiddenException("You can only view your own profile.");
      }
    }

    console.log(`[getUser] id="${id}"`);
    return this.usersService.findOne(id);
  }

  @Put(":id")
  async updateUser(
    @Param("id", ParseUuidPipe) id: string,
    @Body() updateData: Partial<userProfileDto>,
    @Req() req: any,
  ) {
    // 1. Validate the role VALUE
    if (
      updateData.role &&
      !["STUDENT", "INSTRUCTOR", "ADMIN", "SUPERADMIN", "SUSPENDED"].includes(
        updateData.role.toUpperCase(),
      )
    ) {
      throw new BadRequestException("Invalid role.");
    }

    // 2. 🔒 Role changes are SUPERADMIN only
    if (updateData.role) {
      const callerId = req.user?.sub ?? req.user?.id;
      const callerRole = await this.getCallerRole(callerId);

      if (callerRole !== "SUPERADMIN") {
        throw new ForbiddenException("Only superadmins can change roles.");
      }
    }

    // 3. A user may edit their own profile; admins+ may edit anyone's
    const callerId = req.user?.sub ?? req.user?.id;
    if (callerId !== id) {
      const callerRole = await this.getCallerRole(callerId);
      if (!["ADMIN", "SUPERADMIN"].includes(callerRole)) {
        throw new ForbiddenException("You can only edit your own profile.");
      }
    }

    return this.usersService.update(id, updateData);
  }

  // Strip role — this route must never be able to set privileges
  @Post(":id/create-if-not-exists")
  async getOrCreateUser(
    @Param("id", ParseUuidPipe) id: string,
    @Body() userData: Partial<userProfileDto>,
    @Req() req: any,
  ) {
    const callerId = req.user?.sub ?? req.user?.id;
    if (callerId !== id) {
      throw new ForbiddenException("You can only create your own profile.");
    }

    const { role, ...safe } = userData;
    return this.usersService.findOneOrCreate(
      id,
      safe as Partial<userProfileDto>,
    );
  }

  // Helper: read the caller's role via service-role client
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