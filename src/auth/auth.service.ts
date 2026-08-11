import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    EXPIRE_DAY_REFRESH_TOKEN = 1;
    REFRESH_TOKEN_NAME = 'refreshToken';

    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
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

    async getNewTokens(refreshToken: string) {
        const result = await this.jwtService.verify(refreshToken);
        if (!result) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.userService.getById(result.id);

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

    // to validate for google and other social networks
    async validateOAuthLogin(req: any) {
        let user = await this.userService.getByEmail(req.user.email);

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: req.user.email,
                    name: req.user.name,
                    password: req.user.password,
                },
                include: {
                    stores: true,
                    favorites: true,
                    orders: true,
                },
            });
        }

        const tokens = this.issueTokens(user.id);

        return { user, ...tokens };
    }



    addRefreshTokenToReponse(res: Response, refreshToken: string) {
        const expiresIn = new Date();
        expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

        res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
            httpOnly: true,
            domain: this.configService.get('SERVER_DOMAIN'),
            expires: expiresIn,
            secure: true,
            sameSite: 'none',
        });
    }

    removeRefreshTokenFromReponse(res: Response) {
        res.cookie(this.REFRESH_TOKEN_NAME, '', {
            httpOnly: true,
            domain: this.configService.get('SERVER_DOMAIN'),
            expires: new Date(0),
            secure: true,
            sameSite: 'none',
        });
    }
}
