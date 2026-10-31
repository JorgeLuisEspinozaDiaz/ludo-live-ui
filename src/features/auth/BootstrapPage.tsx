import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { getErrorMessage } from "@/lib/errors";
import { t } from "@/i18n/es";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthShell } from "./AuthShell";
import { cn } from "@/lib/utils";

const bootstrapSchema = z.object({
  tenantName: z.string().min(2, "Nombre requerido"),
  tenantSlug: z
    .string()
    .min(2, "Slug requerido")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  username: z.string().min(3, "Usuario requerido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  adminName: z.string().optional(),
});

type BootstrapForm = z.infer<typeof bootstrapSchema>;

const fieldClass =
  "h-11 rounded-2xl border-[#d6c4ae] !bg-white !text-[#1a120b] caret-[#1a120b] placeholder:!text-[#8a7360] shadow-none focus-visible:ring-[#1e88e5]/35 focus-visible:border-[#1e88e5] dark:!bg-white dark:!text-[#1a120b] dark:placeholder:!text-[#8a7360] auth-input";

export default function BootstrapPage() {
  const navigate = useNavigate();

  const form = useForm<BootstrapForm>({
    resolver: zodResolver(bootstrapSchema),
    defaultValues: {
      tenantName: "",
      tenantSlug: "",
      username: "",
      password: "",
      email: "",
      adminName: "",
    },
  });

  const bootstrapMutation = useMutation({
    mutationFn: (values: BootstrapForm) =>
      authApi.bootstrap({
        tenantName: values.tenantName,
        tenantSlug: values.tenantSlug,
        username: values.username,
        password: values.password,
        email: values.email?.trim() || undefined,
        adminName: values.adminName?.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Tenant creado. Inicia sesión.");
      navigate("/login", { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo crear el tenant")),
  });

  const onSubmit = form.handleSubmit((values) => bootstrapMutation.mutate(values));

  return (
    <AuthShell title={t("bootstrap.title")} subtitle="Crea tu primer tenant y administrador">
      <form onSubmit={onSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        <div className="space-y-1.5">
          <Label htmlFor="tenantName" className="text-[#3d2f24] font-bold">
            {t("bootstrap.tenantName")}
          </Label>
          <Input id="tenantName" className={fieldClass} {...form.register("tenantName")} />
          {form.formState.errors.tenantName && (
            <p className="text-sm font-semibold text-[#c62828]">
              {form.formState.errors.tenantName.message}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tenantSlug" className="text-[#3d2f24] font-bold">
              {t("bootstrap.tenantSlug")}
            </Label>
            <Input id="tenantSlug" className={fieldClass} {...form.register("tenantSlug")} />
            {form.formState.errors.tenantSlug && (
              <p className="text-sm font-semibold text-[#c62828]">
                {form.formState.errors.tenantSlug.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adminName" className="text-[#3d2f24] font-bold">
              Nombre admin
            </Label>
            <Input id="adminName" className={fieldClass} {...form.register("adminName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-[#3d2f24] font-bold">
              {t("login.username")}
            </Label>
            <Input
              id="username"
              autoComplete="username"
              className={fieldClass}
              {...form.register("username")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[#3d2f24] font-bold">
              Email
            </Label>
            <Input id="email" type="email" className={fieldClass} {...form.register("email")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[#3d2f24] font-bold">
            {t("login.password")}
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className={fieldClass}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm font-semibold text-[#c62828]">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={bootstrapMutation.isPending}
          className={cn(
            "mt-2 h-12 w-full rounded-2xl bg-[#1e88e5] text-base font-black text-white",
            "shadow-[0_6px_0_#0d47a1] transition hover:brightness-105 active:translate-y-0.5 active:shadow-[0_3px_0_#0d47a1]",
          )}
        >
          {bootstrapMutation.isPending ? t("common.loading") : t("bootstrap.submit")}
        </Button>

        <Link
          to="/login"
          className="block text-center text-sm font-bold text-[#1e88e5] underline-offset-4 hover:underline"
        >
          Volver al login
        </Link>
      </form>
    </AuthShell>
  );
}
