import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class OptionalSupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) return true;
    const token = authHeader.slice("Bearer ".length).trim();
    const { data } = await this.supabaseService
      .getAdminClient()
      .auth.getUser(token);
    if (data?.user) {
      req.user = { id: data.user.id, email: data.user.email };
    }
    return true;
  }
}