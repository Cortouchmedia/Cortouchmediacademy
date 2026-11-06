import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SupabaseService } from "../supabase/supabase.service";

export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN" | "SUPERADMIN";

@Injectable()
export class RoleGuard extends AuthGuard("jwt") {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly allowed: Role[],
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Passport verifies the Supabase token via JWKS (JwtStrategy)
    const ok = (await super.canActivate(context)) as boolean;
    if (!ok) throw new UnauthorizedException("Not authenticated");

    const req = context.switchToHttp().getRequest();
    const userId = req.user?.sub ?? req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException("JWT is missing a subject claim");
    }

    // 2. Load the REAL role from the DB — never trust the JWT claim
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

    // 3. Superadmin bypasses every role check in the app
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