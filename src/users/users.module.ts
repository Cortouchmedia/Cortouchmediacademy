import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
@Module({
  imports: [
    SupabaseModule, 
    PassportModule.register({ defaultStrategy: 'jwt' }), 
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtStrategy, 
  ],
  exports: [UsersService],
})
export class UsersModule {}