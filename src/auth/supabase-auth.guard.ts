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
  
      // Verify the Supabase JWT. getAdminClient() works; getClient() also fine.
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .auth.getUser(token);
  
      if (error || !data?.user) {
        throw new UnauthorizedException("Invalid or expired token");
      }
  
      // Attach user so controllers can read it via a decorator
      req.user = { id: data.user.id, email: data.user.email, ...data.user };
      return true;
    }
  }