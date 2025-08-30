export class CreateShopownerDto {
  readonly email: string;
  readonly password: string;
  readonly name?: string;
  readonly address?: string;
  readonly role?: string;
}
