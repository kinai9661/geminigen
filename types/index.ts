export interface GenerateRequest {
  prompt: string;
  accessToken: string;
}

export interface GenerateResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  data?: any;
}

export interface ImageItem {
  id: string;
  url: string;
  prompt: string;
  createdAt?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
