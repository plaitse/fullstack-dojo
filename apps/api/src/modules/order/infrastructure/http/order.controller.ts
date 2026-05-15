import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateOrderUseCase } from '../../application/create-order.use-case';
import { GetOrderUseCase } from '../../application/get-order.use-case';
import { ListOrdersUseCase } from '../../application/list-orders.use-case';
import { TransitionOrderUseCase } from '../../application/transition-order.use-case';
import { OrderStatsQuery } from '../../application/order-stats.query';
import { OrderDtoMapper } from '../order-dto.mapper';
import { runEffectHttp } from '../../../../shared/effect/effect-error.mapper';
import {
  CreateOrderRequestDto,
  TransitionOrderRequestDto,
  OrderResponseDto,
  OrderStatsResponseDto,
} from './dtos';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly transitionOrderUseCase: TransitionOrderUseCase,
    private readonly orderStatsQuery: OrderStatsQuery,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  @ApiResponse({ status: 422, description: 'Empty order (no items)' })
  async create(@Body() dto: CreateOrderRequestDto): Promise<OrderResponseDto> {
    const order = await runEffectHttp(this.createOrderUseCase.execute(dto));
    return OrderDtoMapper.toDto(order) as unknown as OrderResponseDto;
  }

  @Get()
  @ApiOperation({ summary: 'List all orders' })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  async list(): Promise<OrderResponseDto[]> {
    const orders = await runEffectHttp(this.listOrdersUseCase.execute());
    return OrderDtoMapper.toDtoList(orders) as unknown as OrderResponseDto[];
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiResponse({ status: 200, type: OrderStatsResponseDto })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async stats(
    @Query('limit') limit?: string,
  ): Promise<OrderStatsResponseDto> {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const stats = await runEffectHttp(
      this.orderStatsQuery.execute(parsedLimit),
    );
    return OrderDtoMapper.statsToDto(stats) as unknown as OrderStatsResponseDto;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    const order = await runEffectHttp(this.getOrderUseCase.execute(id));
    return OrderDtoMapper.toDto(order) as unknown as OrderResponseDto;
  }

  @Patch(':id/transition')
  @ApiOperation({ summary: 'Transition order status' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Invalid status transition' })
  async transition(
    @Param('id') id: string,
    @Body() dto: TransitionOrderRequestDto,
  ): Promise<OrderResponseDto> {
    const order = await runEffectHttp(
      this.transitionOrderUseCase.execute(id, dto.status),
    );
    return OrderDtoMapper.toDto(order) as unknown as OrderResponseDto;
  }
}
