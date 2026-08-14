import { ArrayMinSize, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ProductDto {
    @IsString(
        {
            message: 'Title is required',
        }
    )
    title: string;

    @IsString(
        {
            message: 'Description is required',
        }
    )
    @IsNotEmpty(
        {
            message: 'Description should not be empty',
        }
    )
    description: string;

    @IsNumber({}, 
        {
            message: 'Price should be a number',
        }
    )
    @IsNotEmpty(
        {
            message: 'Price should not be empty',
        }
    )
    price: number;


    @IsString({
        each: true,
        message: 'Image is required',
    })
    @ArrayMinSize(1, {
        message: 'Images should be at least 1',
    })
    @IsNotEmpty({
        each: true,
        message: 'Image path should not be empty',
    })
    images: string[];

    @IsString({
        message: 'Category is required',
    })
    @IsNotEmpty({
        message: 'Category ID should not be empty',
    })
    categoryId: string;

    @IsString({
        message: 'Color is required',
    })
    @IsNotEmpty({
        message: 'Color ID should not be empty',
    })
    colorId: string;
}