import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 1. Declare the logger property
  private readonly logger = new Logger(JwtStrategy.name);

  // 2. Do NOT use 'private readonly configService' here, just use 'configService'
  constructor(configService: ConfigService) {
    const supabaseBaseUrl =
      configService.get<string>("SUPABASE_URL") ??
      configService.get<string>("NEXT_PUBLIC_SUPABASE_URL");

    if (!supabaseBaseUrl) {
      throw new Error(
        "JwtStrategy: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is not set. " +
          "Add it to your backend .env and restart NestJS.",
      );
    }

    const jwksUri = `${supabaseBaseUrl}/auth/v1/.well-known/jwks.json`;

    // 3. Call super() BEFORE any 'this' usage
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
      algorithms: ["ES256"],
    });

    // 4. NOW we can use 'this' safely
    this.logger.log(`JWKS URI configured: ${jwksUri}`);
  }

  async validate(payload: any) {
    this.logger.log(`JWT validated for user: ${payload.sub}`);
    return {
      sub: payload.sub,
      userId: payload.sub,
      email: payload.email,
    };
  }
}