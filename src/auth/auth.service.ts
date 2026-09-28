import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async signup(
    email: string,
    full_name: string,
    password: string,
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN" | "SUPERADMIN" = "STUDENT", 
  ) {
    this.logger.log(`Signup attempt for email: ${email} with role: ${role}`);


    if (!email || !password || !full_name) {
      this.logger.error("Missing required fields");
      throw new BadRequestException(
        "Email, password, and full name are required",
      );
    }

    if (password.length < 6) {
      this.logger.error("Password too short");
      throw new BadRequestException("Password must be at least 6 characters");
    }

    // Validate role
    const validRoles = ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPERADMIN"];
    const upperRole = role.toUpperCase();

    if (!validRoles.includes(upperRole)) {
      this.logger.error(`Invalid role: ${role}`);
      throw new BadRequestException(
        `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      );
    }

    try {
      const { data: authData, error: authError } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name,
              role: upperRole,
            },
          },
        });

      if (authError) {
        this.logger.error(`Signup error for ${email}: ${authError.message}`);

        if (authError.message.includes("already registered")) {
          throw new BadRequestException(
            "User already registered with this email",
          );
        }

        if (authError.message.includes("rate limit")) {
          throw new BadRequestException(
            "Too many signup attempts. Please try again later",
          );
        }

        throw new UnauthorizedException(authError.message);
      }

      this.logger.log(`Signup successful for email: ${email}`);

      // Auto-create profile in profiles table using admin client to bypass RLS
      if (authData.user) {
        await this.createUserProfile(
          authData.user.id,
          email,
          full_name,
          upperRole,
        );
      }

      return {
        message: "Signup successful",
        user: authData.user,
        session: authData.session,
      };
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error(
        `Unexpected signup error: ${error?.message || "Unknown error"}`,
      );
      throw new UnauthorizedException("Signup failed. Please try again.");
    }
  }

  async signin(email: string, pass: string) {
    this.logger.log(`Signin attempt for email: ${email}`);

    if (!email || !pass) {
      this.logger.error("Email or password missing");
      throw new BadRequestException("Email and password are required");
    }

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signInWithPassword({
          email,
          password: pass,
        });

      if (error) {
        this.logger.error(`Signin error for ${email}: ${error.message}`);

        if (error.message.includes("Invalid login credentials")) {
          throw new UnauthorizedException("Invalid email or password");
        }

        if (error.message.includes("Email not confirmed")) {
          throw new UnauthorizedException(
            "Please confirm your email before signing in",
          );
        }

        throw new UnauthorizedException(error.message);
      }

      this.logger.log(`Signin successful for email: ${email}`);

      return {
        message: "Signin successful",
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error(
        `Unexpected signin error: ${error?.message || "Unknown error"}`,
      );
      throw new UnauthorizedException("Signin failed. Please try again.");
    }
  }

  async signOut() {
    this.logger.log("Signout attempt");

    try {
      const supabase = this.supabaseService.getClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        this.logger.error(`Signout error: ${error.message}`);
        throw new UnauthorizedException(error.message);
      }

      this.logger.log("Signout successful");
      return { message: "Signed out successfully" };
    } catch (error: any) {
      this.logger.error(
        `Unexpected signout error: ${error?.message || "Unknown error"}`,
      );
      throw new UnauthorizedException("Signout failed. Please try again.");
    }
  }

  private async createUserProfile(
    userId: string,
    email: string,
    full_name: string,
    role: string,
  ) {
    this.logger.log(`Creating profile for user: ${userId}`);

    try {
      const supabaseAdmin = this.supabaseService.getAdminClient();

      if (!supabaseAdmin) {
        this.logger.error("Admin client not available, cannot create profile");
        return null;
      }

      const { data, error } = await supabaseAdmin
  .from("profiles")
  .upsert(
    {
      id: userId,
      email: email,
      full_name: full_name,
      role: role,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
      ignoreDuplicates: false,
    },
  )
  .select()
  .single();

      if (error) {
        this.logger.error(
          `Profile creation error for ${userId}: ${error.message}`,
        );
        return null;
      }

      this.logger.log(`Profile created successfully for user: ${userId}`);
      return data;
    } catch (error: any) {
      this.logger.error(
        `Unexpected profile creation error: ${error?.message || "Unknown error"}`,
      );
      return null;
    }
  }
}
