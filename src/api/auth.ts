import api, { USER_MICROSERVICE_URL } from "./config";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    `${USER_MICROSERVICE_URL}/auth/login`,
    data
  );
  return response.data;
};
