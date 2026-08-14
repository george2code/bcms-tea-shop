import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
    constructor(
        private readonly prisma: PrismaService, 
    ) {}

    async getByStoreId(storeId: string) {
        return this.prisma.review.findMany({
            where: {
                storeId
            },
            include: {
                user: true
            }
        });
    }

    async getById(id: string, userId: string) {
        const review = await this.prisma.review.findUnique({
            where: {
                id,
                userId: userId
            },
            include: {
                user: true
            } 
        });

        if (!review) {
            throw new NotFoundException('Review not found or you are not the owner of this review');
        }

        return review;
    }

    async create(dto: ReviewDto, productId: string, userId: string, storeId: string) {
        return this.prisma.review.create({
            data: {
                ...dto,
                product: {
                    connect: {
                        id: productId
                    }
                },
                user: {
                    connect: {
                        id: userId
                    }
                },
                store: {
                    connect: {
                        id: storeId
                    }
                }
            }
        });
    }

    async delete(id: string, userId: string) {
        await this.getById(id, userId);

        return this.prisma.review.delete({
            where: {
                id,
                userId: userId
            }
        });
    }
    
}
