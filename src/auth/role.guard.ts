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
    // 1. Run the JWT guard first — populates req.user
    const ok = (await super.canActivate(context)) as boolean;
    if (!ok) throw new UnauthorizedException("Not authenticated");

    const req = context.switchToHttp().getRequest();
    const userId = req.user?.sub ?? req.user?.id;

    if (!userId) {
      throw new UnauthorizedException("JWT is missing a subject claim");
    }

    // 2. Load the REAL role from the DB (never trust the JWT claim)
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
    if (!this.allowed.includes(role)) {
      throw new ForbiddenException(
        `Requires one of: ${this.allowed.join(", ")}`,
      );
    }

    // 3. Attach the DB-verified role for downstream controllers
    req.user.role = role;
    return true;
  }
}