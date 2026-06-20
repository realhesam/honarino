export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  created_at: string;
}

export interface SigninRequest {
  username: string;
  password: string;
}

export interface SigninResponse {
  token: string;
  user: User;
}

export interface SignupRequest {
  name: string;
  username: string;
  password: string;
  email: string;
}
   
export interface SignupResponse extends User {
  password: string;
}