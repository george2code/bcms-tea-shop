import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class ReviewDto {
  @IsString({
    message: 'Text must be a string',
  })
  @IsNotEmpty({
    message: 'Text is required',
  })
  text: string;

  @IsNumber({}, {
    message: 'Rating must be a number',
  })
  @IsNotEmpty({
    message: 'Rating is required',
  })
  @Min(1, {
    message: 'Rating must be between 1 and 5',
  })
  @Max(5, {
    message: 'Rating must be between 1 and 5',
  })
  rating: number;
}