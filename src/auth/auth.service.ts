import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async login(dto: AuthDto) {
        const user = await this.validateUser(dto);
        const tokens = this.issueTokens(user.id);

        return { user, ...tokens }
    }

    async register(dto: AuthDto) {
        const oldUser = await this.userService.getByEmail(dto.email);

        if (oldUser) {
            throw new BadRequestException('User already exists');
        }

        const user = await this.userService.create(dto);
        const tokens = this.issueTokens(user.id);

        return { user, ...tokens }
    }

    issueTokens(userId: string) {
        const data = { id: userId };

        const accessToken = this.jwtService.sign(data, {
            expiresIn: '1h',
        })

        const refreshToken = this.jwtService.sign(data, {
            expiresIn: '7d',
        })

        return {accessToken, refreshToken}
    }

    private async validateUser(dto: AuthDto) {
        const user = await this.userService.getByEmail(dto.email);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
}
