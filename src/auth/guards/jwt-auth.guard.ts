import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly configService: ConfigService) {
        super();
    }
}