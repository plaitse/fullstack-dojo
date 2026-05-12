export class Address {
  private constructor(
    readonly street: string,
    readonly city: string,
    readonly zipCode: string,
    readonly country: string,
  ) {}

  static create(
    street: string,
    city: string,
    zipCode: string,
    country: string,
  ): Address {
    if (!street || !city || !zipCode || !country) {
      throw new Error('All address fields are required');
    }
    return new Address(street, city, zipCode, country);
  }

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.zipCode === other.zipCode &&
      this.country === other.country
    );
  }
}
