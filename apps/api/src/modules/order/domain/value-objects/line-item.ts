import { Money } from './money';

export class LineItem {
  private constructor(
    readonly productId: string,
    readonly productName: string,
    readonly quantity: number,
    readonly unitPrice: Money,
  ) {}

  static create(
    productId: string,
    productName: string,
    quantity: number,
    unitPrice: Money,
  ): LineItem {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    return new LineItem(productId, productName, quantity, unitPrice);
  }

  get total(): Money {
    return this.unitPrice.multiply(this.quantity);
  }
}
