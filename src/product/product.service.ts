import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductDto } from './dto/product.dto';
import { ColorDto } from 'src/color/dto/color.dto';

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) {}  

    async getAll(searchTerm?: string) {
        if (searchTerm) {
            return this.searchTermFilter(searchTerm);
        }

        return await this.prisma.product.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                category: true,
                color: true,
                reviews: true,
            },
        });
    }

    private async searchTermFilter(searchTerm: string) {
        return this.prisma.product.findMany({
            where: {
                OR: [{
                    title: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                    description: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },  
                }]
            }
        })
    }

    async getByStoreId(storeId: string) {
        return this.prisma.product.findMany({
            where: {
                storeId
            },
            include: {
                category: true,
                color: true,
            },
        });
    }

    async getById(id: string) {
        const product = await this.prisma.product.findUnique({
            where: {
                id
            },
            include: {
                category: true,
                color: true,
                reviews: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async getByCategoryId(categoryId: string) {
        const products = await this.prisma.product.findMany({
            where: {
                category: {
                    id: categoryId
                }
            },
            include: {
                category: true,
            },
        });

        if (!products) {
            throw new NotFoundException('Products not found');
        }

        return products;
    }

    async getMostPopular() {
        const mostPopularProducts = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
        });

        const productIds = mostPopularProducts
            .map((item) => item.productId)
            .filter((id): id is string => id !== null);

        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            },
            include: {
                category: true,
            },
        });

        return products;
    }

    async getSimilar(productId: string) {
        const currentProduct = await this.getById(productId);

        if (!currentProduct) {
            throw new NotFoundException('Current product not found');
        }

        const similarProducts = await this.prisma.product.findMany({
            where: {
                category: {
                    title: currentProduct.category?.title,
                },
                NOT: 
                    {
                        id: productId,
                    }
                
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                category: true,
            },
        });

        return similarProducts;
    }


    async create(dto: ProductDto, storeId: string) {
        return this.prisma.product.create({
            data: {
                title: dto.title,
                description: dto.description,
                price: dto.price,
                categoryId: dto.categoryId,
                images: dto.images,
                colorId: dto.colorId,
                storeId,
            },
        });
    }

    async update(id: string, dto: ProductDto) {
        await this.getById(id);

        return this.prisma.product.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: string) {
        await this.getById(id);

        return this.prisma.product.delete({
            where: { id },
        });
    }
}
