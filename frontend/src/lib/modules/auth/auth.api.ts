import { httpClient } from '@/lib/core/httpClient';
import { SigninRequest, SigninResponse, SignupResponse, type SignupRequest } from './auth.types';

export const AuthAPI = {
  signin(data: SigninRequest) {
    return httpClient.post<SigninResponse>(
      '/api/v1/auth/signin',
      data
    );
  },

  signup(data: SignupRequest) {
    return httpClient.post<SignupResponse>(
        '/api/v1/auth/signup',
        data
    );
  },
};
