import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getRoot(): string;
    getApiInfo(): {
        message: string;
        endpoints: {
            root: string;
            hello: string;
            courses: string;
            auth: {
                signup: string;
                signin: string;
                signout: string;
                profile: string;
                users: string;
            };
        };
    };
    getHello(): string;
    getCourses(): Promise<any[]>;
}
