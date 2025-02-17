export interface Group {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: string;
}

export interface ApiResponse {
  message: string;
  permissions_data?: Permission[];
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  groups: Group[];
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  password?: string;
  old_password?: string;
}

export interface AuthTokens {
  refresh: string;
  access: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LogoutRequest {
  refresh: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  new_password: string;
  confirm_password: string;
}

export interface PasswordChange {
  old_password: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
  access: string;
  refresh: string;
}