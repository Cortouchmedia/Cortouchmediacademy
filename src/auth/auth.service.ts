import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly mailService: MailService,
  ) {}

  // ============================================================
  // OAUTH METHODS (Google & Facebook)
  // ============================================================

  async getOAuthUrl(provider: 'google' | 'facebook', redirectTo: string) {
    if (provider !== 'google' && provider !== 'facebook') {
      throw new BadRequestException('Invalid OAuth provider');
    }

    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectTo,
      },
    });

    if (error) {
      this.logger.error(`OAuth URL generation failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }

    return { url: data.url };
  }

  async signinWithOAuth(token: string) {
    const supabase = this.supabaseService.getClient();
    
    // Verify the token sent from the frontend callback
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      this.logger.error(`OAuth signin failed: ${error?.message}`);
      throw new UnauthorizedException("Invalid OAuth token");
    }

    // Check if profile exists
    const supabaseAdmin = this.supabaseService.getAdminClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // If it's their first time logging in via social, create the profile
    if (!profile) {
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User';
      const role = user.user_metadata?.role || 'STUDENT'; // Default to student
      
      await this.createUserProfile(user.id, user.email!, fullName, role);
      
      await this.saveAuditLog(
        user.id,
        "User Registration (OAuth)",
        "user",
        `${fullName} created an account via ${user.app_metadata.provider}.`,
      );
      
      await this.mailService.sendWelcomeEmail(user.email!, fullName);
    } else {
       await this.saveAuditLog(
          user.id,
          "User Login (OAuth)",
          "auth",
          `${profile.full_name || user.email} logged in via ${user.app_metadata.provider}.`,
        );
    }

    return {
      message: "OAuth signin successful",
      user: user,
    };
  }

  async getProfile(userId: string) {
    const supabaseAdmin = this.supabaseService.getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new UnauthorizedException("Profile not found");
    }
    return data;
  }

  // ============================================================
  // EMAIL/PASSWORD METHODS
  // ============================================================

  private async saveAuditLog(
    userId: string | undefined,
    action: string,
    type: "auth" | "user" | "course" | "system",
    details: string,
  ) {
    try {
      const supabaseAdmin = this.supabaseService.getAdminClient();
      if (!supabaseAdmin) {
        console.error("❌ [AuditLog] No admin client available!");
        return;
      }

      console.log(`📝 [AuditLog] Attempting to save: ${action}`);

      const { error } = await supabaseAdmin.from("audit_logs").insert([
        {
          user_id: userId || null,
          action,
          type,
          details,
        },
      ]);

      if (error) {
        console.error("❌ [AuditLog] Supabase Error:", error);
      } else {
        console.log("✅ [AuditLog] Saved successfully!");
      }
    } catch (error) {
      console.error(`❌ [AuditLog] Failed to save: ${error}`);
    }
  }

  async signup(
    email: string,
    full_name: string,
    password: string,
    requestedRole?: string,
  ) {
    this.logger.log(
      `Signup attempt for email: ${email} with requested role: ${requestedRole ?? "default"}`,
    );

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

    const SELF_SIGNUP_ROLES = ["STUDENT", "INSTRUCTOR"] as const;
    type SelfSignupRole = (typeof SELF_SIGNUP_ROLES)[number];

    const upperRole = (requestedRole ?? "STUDENT").toUpperCase();

    if (!SELF_SIGNUP_ROLES.includes(upperRole as SelfSignupRole)) {
      this.logger.warn(
        `Rejected signup for ${email}: attempted role "${requestedRole}"`,
      );
      throw new BadRequestException(
        "Role must be STUDENT or INSTRUCTOR. Contact an administrator for elevated roles.",
      );
    }

    const role = upperRole as SelfSignupRole;

    try {
      const { data: authData, error: authError } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name,
              role,
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

      this.logger.log(`Signup successful for email: ${email} as ${role}`);

      if (authData.user) {
        await this.createUserProfile(authData.user.id, email, full_name, role);
        
        await this.saveAuditLog(
          authData.user.id,
          "User Registration",
          "user",
          `${full_name} (${email}) created an account as ${role}.`,
        );

        // Send the welcome email
        await this.mailService.sendWelcomeEmail(email, full_name);
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

      if (data.user) {
        await this.saveAuditLog(
          data.user.id,
          "User Login",
          "auth",
          `${email} successfully logged in.`,
        );

        // Send the login notification email
        const displayName =
          data.user.user_metadata?.full_name || data.user.email || "there";

        if (data.user.email) {
          await this.mailService.sendLoginEmail(data.user.email, displayName);
        }
      }

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

      // Check if profile exists to prevent overwriting an Admin to Student
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      // If they exist, don't downgrade their role
      const finalRole = existingProfile ? existingProfile.role : role;

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: userId,
            email: email,
            full_name: full_name,
            role: finalRole,
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