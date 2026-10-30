import api from "../../../api/axiosInstance";
import type { IBootstrapDto, ILoginDto, ILoginResponse } from "../../../interface/IAuth";

export const loginRequest = async (body: ILoginDto): Promise<ILoginResponse> => {
  const res = await api.post<ILoginResponse>("/auth/login", body);
  return res.data;
};

export const bootstrapRequest = async (body: IBootstrapDto): Promise<ILoginResponse> => {
  const res = await api.post<ILoginResponse>("/auth/bootstrap", body);
  return res.data;
};

export const meRequest = async (): Promise<ILoginResponse> => {
  const res = await api.get<ILoginResponse>("/auth/me");
  return res.data;
};

export const refreshRequest = async (): Promise<ILoginResponse> => {
  const res = await api.post<ILoginResponse>("/auth/refresh");
  return res.data;
};
