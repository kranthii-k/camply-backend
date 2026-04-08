export interface JwtPayload {
    userId: string;
    username: string;
}
export declare function generateAccessToken(payload: JwtPayload): string;
export declare function generateRefreshToken(payload: JwtPayload): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): JwtPayload;
/** Expiry in ms — used to set cookie maxAge */
export declare function refreshTokenTtlMs(): number;
//# sourceMappingURL=jwt.d.ts.map