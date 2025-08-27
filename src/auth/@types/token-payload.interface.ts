export enum TokenUserType {
  USER = 'user',
  ADMIN = 'admin',
}

export interface ITokenPayload {
  userId: string;
  userType: TokenUserType;
}
