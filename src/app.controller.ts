import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // This handles /api
  getRoot(): string {
    return 'Backend API is running';
  }

  @Get('info') // This handles /api/info
  getApiInfo() {
    return {
      message: 'Backend API Information',
      endpoints: {
        root: '/api',
        hello: '/api/hello',
        courses: '/api/courses',
        auth: {
          signup: '/api/auth/signup',
          signin: '/api/auth/signin',
          signout: '/api/auth/signout',
          profile: '/api/auth/profile',
          users: '/api/auth/users'
        }
      }
    };
  }

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('courses')
  async getCourses() {
    return this.appService.getCourses();
  }
}
