import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async getById(id: string) {
        const user = await this.prisma.user.findUnique({ 
            where: { id },
            include: {
                stores: true,
                favorites: {
                    include: {
                        category: true
                    }
                },
                orders: true,
            }
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async getByEmail(email: string) {
        return this.prisma.user.findUnique({ 
            where: { email },
            include: {
                stores: true,
                favorites: true,
                orders: true,
            }
        });
    }

    async toggleFavorite(userId: string, productId: string) {
        const user = await this.getById(userId);

        const isExists = user.favorites.some(favorite => favorite.id === productId);

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                favorites: {
                    [isExists ? 'disconnect' : 'connect']: { id: productId },
                },
            },
        });

        return true;
    }

    async create(dto: AuthDto) {
        return this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: await hash(dto.password),
            },
        });
    }

    // async findAll() {
    //     return this.prisma.user.findMany();
    // }

    // async findOne(id: string) {
    //     return this.prisma.user.findUnique({ where: { id } });
    // }
}
