import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";

// Resolve the Supabase base URL from either env var name.
// Backend-canonical is SUPABASE_URL; fall back to NEXT_PUBLIC_SUPABASE_URL
// so a single .env can serve both frontend and backend.
const SUPABASE_BASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    if (!SUPABASE_BASE_URL) {
     
      throw new Error(
        "JwtStrategy: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is not set. " +
          "Add it to your backend .env and restart NestJS.",
      );
    }

    const jwksUri = `${SUPABASE_BASE_URL}/auth/v1/.well-known/jwks.json`;

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

    this.logger.log(`JWKS URI: ${jwksUri}`);
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