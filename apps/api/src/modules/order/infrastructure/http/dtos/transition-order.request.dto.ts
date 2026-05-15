import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import {
  ORDER_STATUSES,
  OrderStatus,
} from '../../../domain/value-objects/order-status';

export class TransitionOrderRequestDto {
  @ApiProperty({
    enum: ORDER_STATUSES,
    example: 'confirmed',
  })
  @IsIn(ORDER_STATUSES)
  status!: OrderStatus;
}
