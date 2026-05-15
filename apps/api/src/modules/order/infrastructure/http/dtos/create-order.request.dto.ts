import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class ShippingAddressRequestDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ example: 'Springfield' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: '62704' })
  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  @IsNotEmpty()
  country!: string;
}

export class LineItemRequestDto {
  @ApiProperty({ example: 'prod-001' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'Shampoo' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  unitPriceAmount!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  unitPriceCurrency!: string;
}

export class CreateOrderRequestDto {
  @ApiProperty({ example: 'order-001' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 'cust-001' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ type: ShippingAddressRequestDto })
  @ValidateNested()
  @Type(() => ShippingAddressRequestDto)
  shippingAddress!: ShippingAddressRequestDto;

  @ApiProperty({ type: [LineItemRequestDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineItemRequestDto)
  items!: LineItemRequestDto[];
}
