import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
    constructor(private readonly prisma: PrismaService) {}

    async getById(storeId: string, userId: string) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId, userId },
            include: {
                products: true,
            },
        });

        if (!store) {
            throw new NotFoundException('Store not found or you are not the owner');
        }

        return store;
    }

    async create(dto: CreateStoreDto, userId: string) {
        return this.prisma.store.create({
            data: {
                title: dto.title,
                userId,
            },
        });
    }

    async update(storeId: string, dto: UpdateStoreDto, userId: string) {
        await this.getById(storeId, userId);

        return this.prisma.store.update({
            where: { id: storeId },
            data: {
                title: dto.title,
                description: dto.description,
                userId
            },
        });
    }

    async delete(storeId: string, userId: string) {
        await this.getById(storeId, userId);

        return this.prisma.store.delete({
            where: { id: storeId },
        });
    }
}
