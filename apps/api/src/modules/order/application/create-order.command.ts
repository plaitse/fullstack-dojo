export interface CreateOrderCommand {
  id: string;
  customerId: string;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPriceAmount: number;
    unitPriceCurrency: string;
  }>;
}
