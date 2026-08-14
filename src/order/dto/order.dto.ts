import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { EnumOrderStatus } from "generated/prisma/enums";
import { Type } from "class-transformer";

export class OrderDto {
    @IsOptional()
    @IsEnum(EnumOrderStatus, {
        message: 'Status must be a valid order status on of: ' + Object.values(EnumOrderStatus).join(', '),
    })
    status: EnumOrderStatus;

    @IsArray({
        message: 'There no items in the order',
    })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}

export class OrderItemDto {
    @IsNumber({}, {
        message: 'Quantity must be a number',
    })
    quantity: number;

    @IsNumber({}, {
        message: 'Price must be a number',
    })
    price: number;

    @IsString({
        message: 'Product ID must be a string',
    })
    productId: string;

    @IsString({
        message: 'Store ID must be a string',
    })
    storeId: string;
}