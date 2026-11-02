import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UnauthorizedException,
  Logger,
  Put,
  Query,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { SuperAdminGuard } from './superadmin.guard';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.logger.log('AuthController initialized');
  }

  @Get()
  checkAuthStatus() {
    return { message: 'Auth endpoint is working' };
  }

  @Post('signup')
  async signup(@Body() registerDto: RegisterDto) {
    this.logger.log('Signup endpoint called');
    const { email, password, full_name, role } = registerDto;
    return this.authService.signup(email, full_name, password, role);
  }

  @Post('signin')
  async signin(@Body() loginDto: LoginDto) {
    this.logger.log('Signin endpoint called');

    const { email, password } = loginDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    return this.authService.signin(email, password);
  }

  @Post('signout')
  async signout() {
    this.logger.log('Signout endpoint called');
    return this.authService.signOut();
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    this.logger.log('Profile endpoint called');
    const supabase = this.supabaseService.getAdminClient();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      this.logger.error('No token provided');
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      this.logger.error('Invalid token');
      throw new UnauthorizedException('Invalid token');
    }

    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      this.logger.log(`Profile not found for user ${user.id}, creating one`);

      const rawMetaRole = String(user.user_metadata?.role ?? 'STUDENT').toUpperCase();
      const safeRole = rawMetaRole === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT';

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          role: safeRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!insertError && newProfile) {
        profile = newProfile;
      }
    }

    return {
      ...user,
      profile: profile || user.user_metadata,
    };
  }

  @Put('users')
  async updateUser(
    @Query('id') userId: string,
    @Body() updateData: UpdateUserDto,
    @Req() req: any,
  ) {
    this.logger.log(`PUT /users - Updating user: ${userId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const supabase = this.supabaseService.getAdminClient();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      this.logger.error('No token provided');
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      this.logger.error('Invalid token');
      throw new UnauthorizedException('Invalid token');
    }

    if (user.id !== userId) {
      this.logger.error(`User ${user.id} tried to update user ${userId}`);
      throw new UnauthorizedException('You can only update your own profile');
    }

    const updateFields: any = {};
    if (updateData.full_name !== undefined) {
      updateFields.full_name = updateData.full_name;
    }
    updateFields.updated_at = new Date().toISOString();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update(updateFields)
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        this.logger.log(
          `Profile not found for user ${userId}, creating new profile`,
        );

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: updateData.full_name || null,
            role: 'STUDENT',
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          this.logger.error(`Profile creation error: ${insertError.message}`);
          throw new UnauthorizedException(insertError.message);
        }

        return {
          message: 'Profile created successfully',
          user: {
            id: userId,
            email: user.email,
            full_name: updateData.full_name || null,
            role: 'STUDENT',
            profile: newProfile,
          },
        };
      }

      this.logger.error(`Profile update error: ${profileError.message}`);
      throw new UnauthorizedException(profileError.message);
    }

    this.logger.log(`User ${userId} updated successfully`);

    return {
      message: 'User updated successfully',
      user: {
        id: userId,
        email: user.email,
        full_name: profile?.full_name,
        role: profile?.role,
        profile,
      },
    };
  }

  // ==================== SUPERADMIN ONLY ====================

  @Put('users/:id/role')
  @UseGuards(SupabaseAuthGuard, SuperAdminGuard)
  async updateUserRole(
    @Param('id') targetUserId: string,
    @Body('role') newRole: string,
    @Req() req: any,
  ) {
    this.logger.log(
      `Superadmin ${req.user.id} updating role for user ${targetUserId} to ${newRole}`,
    );

    const validRoles = ['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPERADMIN'];
    const upperRole = newRole?.toUpperCase();

    if (!validRoles.includes(upperRole)) {
      throw new BadRequestException(
        'Invalid role. Must be STUDENT, INSTRUCTOR, ADMIN, or SUPERADMIN.',
      );
    }

    const supabase = this.supabaseService.getAdminClient();

    if (targetUserId === req.user.id && upperRole !== 'SUPERADMIN') {
      throw new BadRequestException('You cannot demote yourself.');
    }

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ role: upperRole, updated_at: new Date().toISOString() })
      .eq('id', targetUserId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Failed to update role for ${targetUserId}: ${error.message}`,
      );
      throw new BadRequestException('Failed to update user role.');
    }

    return {
      message: `User role updated to ${upperRole}`,
      user: updatedProfile,
    };
  }
}