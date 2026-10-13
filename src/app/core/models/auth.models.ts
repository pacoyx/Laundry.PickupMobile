export interface LoginRequest {
  username: string;
  password: string;
}

export interface BranchSalesSummary {
  id: number;
  branchSalesId: number;
  branchSalesName: string;
  status: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  name: string;
  userName: string;
  role: string;
  status: string;
  userId: number;
  branchSales: BranchSalesSummary[];
  roles: string[];
  permissions: string[];
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  roles: string[];
  permissions: string[];
}

export const PICKUP_MOBILE_PERMISSION = 'pickup_mobile.access';

export interface JwtClaims {
  sub: string;
  unique_name: string;
  employeeId?: string;
  roles?: string | string[];
  permissions?: string | string[];
}

export interface UserProfile {
  userId: number;
  username: string;
  fullName: string;
  role: string;
  roles: string[];
  permissions: string[];
  employeeId: number | null;
  branchSales: BranchSalesSummary[];
}
