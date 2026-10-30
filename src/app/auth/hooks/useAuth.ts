import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { handleError } from "../../../helper/Funtions";
import type { IBootstrapDto, ILoginDto } from "../../../interface/IAuth";
import { clearSession, setSession } from "../../../store/authStore";
import { bootstrapRequest, loginRequest } from "../service/auth.service";

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const login = async (dto: ILoginDto) => {
    setLoading(true);
    try {
      const response = await loginRequest(dto);
      setSession(response);
      toast.success("Sesión iniciada");
      navigate("/dashboard");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const bootstrap = async (dto: IBootstrapDto) => {
    setLoading(true);
    try {
      const response = await bootstrapRequest(dto);
      setSession(response);
      toast.success("Tenant creado e iniciado sesión");
      navigate("/dashboard");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  return { login, bootstrap, logout, loading };
};
