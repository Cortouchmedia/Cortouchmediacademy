import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256'], 
    });
    this.logger.log(`JWKS URI: ${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
  }

  async validate(payload: any) {
    this.logger.log(`JWT validated for user: ${payload.sub}`);
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.user_metadata?.role || payload.app_metadata?.role 
    };
  }
}