export interface RevenueByStatusDto {
  status: string;
  orderCount: number;
  totalRevenue: number;
}

export interface TopProductDto {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface OrderStatsDto {
  revenueByStatus: RevenueByStatusDto[];
  topProducts: TopProductDto[];
}
