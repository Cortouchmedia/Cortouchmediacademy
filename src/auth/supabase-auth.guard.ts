import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or malformed Authorization header");
    }

    const token = authHeader.slice("Bearer ".length).trim();

    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    // 🔥 THE FIX: fetch role from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, avatar_url")
      .eq("id", data.user.id)
      .maybeSingle();

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role ?? "student",
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
    };

    return true;
  }
}