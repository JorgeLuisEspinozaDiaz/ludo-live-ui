import { Shield, UsersRound } from "lucide-react";
import { Link } from "react-router";
import PageHeader from "../../app/components/PageHeader";
import { authSession } from "../../store/authStore";

export const DashboardScreen = () => {
  const user = authSession.value?.user;
  const displayName = user?.username ?? "Usuario";
  const roleName = user?.role?.name ?? "Sin rol";
  const tenant = user?.tenantSlug ?? "—";

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Identidad y acceso" />
      <div className="px-6 pb-6 space-y-5">
        <div className="bg-white rounded-[32px] border border-pink-100 p-8 shadow-[0_10px_35px_rgba(255,182,193,0.14)]">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#a59eb2]">Sesión activa</p>
          <h2 className="text-[26px] font-black text-[#2c2338] mt-1">{displayName}</h2>
          <p className="text-sm text-[#8f889c] font-medium mt-1">
            Rol: <span className="text-[#ff1f68] font-bold">{roleName}</span>
            {" · "}
            Tenant: <span className="font-bold text-[#2c2338]">{tenant}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickLink
            to="/sistema/usuarios"
            icon={<UsersRound size={20} />}
            title="Usuarios"
            description="Gestionar accesos al sistema"
          />
          <QuickLink
            to="/sistema/roles"
            icon={<Shield size={20} />}
            title="Roles"
            description="Permisos y perfiles de acceso"
          />
        </div>
      </div>
    </div>
  );
};

const QuickLink = ({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Link
    to={to}
    className="bg-white rounded-[28px] border border-pink-100/80 shadow-[0_10px_35px_rgba(255,182,193,0.14)] p-6 flex items-center gap-4 hover:border-[#ff1f68]/30 hover:shadow-md transition-all"
  >
    <div className="w-12 h-12 rounded-full bg-pink-50 text-[#ff1f68] flex items-center justify-center">{icon}</div>
    <div>
      <p className="text-[15px] font-black text-[#2c2338]">{title}</p>
      <p className="text-[12px] text-[#9d96aa] font-medium mt-0.5">{description}</p>
    </div>
  </Link>
);
