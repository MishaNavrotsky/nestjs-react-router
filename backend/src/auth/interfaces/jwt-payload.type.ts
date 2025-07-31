export type JwtPayload = {
  email: string,
  id: number,
  jti: string,
}

export type RefreshPayload = {
  id: number,
  jti: string,
}