import { ConfigService } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";

export async function getJwtConfig(configService: ConfigService): 
Promise<JwtModuleOptions> {
    return {
        secret: configService.getOrThrow('JWT_SECRET'),
        // signOptions: { algorithm: 'HS256', expiresIn: configService.getOrThrow('JWT_ACCESS_TOKEN_TTL') },
        // verifyOptions: { algorithms: ['HS256'], ignoreExpiration: false },
    };
}