import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN" | "SUPERADMIN";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly allowed: Role[],
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        "RoleGuard must be used together with SupabaseAuthGuard",
      );
    }


    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data?.role) {
      throw new ForbiddenException("Role lookup failed");
    }

    const role = String(data.role).toUpperCase() as Role;

    // Superadmin bypasses every role check
    if (role === "SUPERADMIN") {
      req.user.role = role;
      return true;
    }

    if (!this.allowed.includes(role)) {
      throw new ForbiddenException(
        `Requires one of: ${this.allowed.join(", ")}`,
      );
    }

    req.user.role = role;
    return true;
  }
}