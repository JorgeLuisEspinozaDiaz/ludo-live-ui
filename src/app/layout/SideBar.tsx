import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useSignals } from "@preact/signals-react/runtime";
import { menuGroups, type MenuItemType } from "./Menu";
import { useLocation, useNavigate } from "react-router";
import { clearSession, hasAnyPermission, authSession } from "../../store/authStore";
import kittySvg from "../../assets/svg/kitty.svg";

export const Sidebar = () => {
  useSignals();
  const location = useLocation();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeItemId, setActiveItemId] = useState<string>("dashboard");

  const visibleGroups = useMemo(
    () =>
      menuGroups
        .map((grp) => ({
          ...grp,
          items: grp.items.filter((item) => hasAnyPermission(item.permissions ?? [])),
        }))
        .filter((grp) => grp.items.length > 0),
    // re-evalúa con la sesión reactiva (useSignals)
    [authSession.value?.permissions],
  );

  useEffect(() => {
    const currentPath = location.pathname.replace(/^\/+/, "");
    for (const group of visibleGroups) {
      for (const item of group.items) {
        if (currentPath === item.slug || (item.slug !== "dashboard" && currentPath.startsWith(item.slug))) {
          setActiveItemId(item.id);
          return;
        }
      }
    }
  }, [location.pathname, visibleGroups]);

  const handleItemClick = (item: MenuItemType) => {
    setActiveItemId(item.id);
    navigate(`/${item.slug}`);
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <aside className="h-screen p-4  shrink-0 flex relative">
      <div
        className={`h-full bg-white/60 rounded-[44px] shadow-[0_12px_45px_rgba(255,182,193,0.25)] border border-pink-100/80 flex flex-col justify-between transition-all duration-300 relative ${
          isExpanded ? "w-61.25" : "w-19.5"
        }`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3.5 top-8 bg-white border border-pink-100 rounded-full w-7 h-7 flex items-center justify-center shadow-md text-[#ff1f68] hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer"
        >
          {isExpanded ? <ChevronLeft size={16} strokeWidth={2.8} /> : <ChevronRight size={16} strokeWidth={2.8} />}
        </button>

        <div className={`pt-7 pb-3 px-4.5 flex items-center ${isExpanded ? "gap-3.5" : "justify-center"}`}>
          <div className="shrink-0 bg-white rounded-full shadow-sm p-1 flex items-center justify-center w-12 h-12 overflow-hidden border border-pink-100">
            <img src={kittySvg} alt="Kitty Logo" className="w-10 h-10 object-contain animate-kitty-float  pointer-events-none" />
          </div>

          {isExpanded && (
            <div className="flex flex-col">
              <span className="font-extrabold text-[18px] text-[#2c2338] leading-tight tracking-tight">Spa Glow</span>
              <span className="font-black text-[17px] text-[#ff1f68] leading-tight tracking-tight">Kitty</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 space-y-4 pink-scrollbar overflow-x-hidden pt-2">
          {visibleGroups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {isExpanded ? (
                <p className="text-[10px] font-extrabold text-[#a59eb2] tracking-widest uppercase px-3 pt-2 pb-1">{grp.group}</p>
              ) : (
                <div className="w-5 h-px bg-pink-100 mx-auto my-2.5" />
              )}

              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItemId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    title={!isExpanded ? item.label : undefined}
                    className={`cursor-pointer transition-all duration-200 flex items-center ${
                      isExpanded
                        ? `gap-3 px-3.5 py-2.5 rounded-[22px] ${
                            isActive
                              ? "bg-white text-[#ff1f68] shadow-[0_4px_16px_rgba(255,31,104,0.12)] border border-pink-100/90 font-bold"
                              : "text-[#584f66] hover:text-[#ff1f68] hover:bg-pink-50/50 font-medium border-none"
                          }`
                        : `w-11 h-11 mx-auto justify-center rounded-[18px] ${
                            isActive
                              ? "bg-white text-[#ff1f68] shadow-[0_4px_16px_rgba(255,31,104,0.15)] border border-pink-100"
                              : "text-[#584f66] hover:text-[#ff1f68] hover:bg-pink-50/50 border-none"
                          }`
                    }`}
                  >
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.4 : 1.9}
                      className={`shrink-0 transition-colors ${isActive ? "text-[#ff1f68]" : "text-[#584f66]"}`}
                    />
                    {isExpanded && <span className="text-[13.5px] tracking-tight truncate">{item.label}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-3 pt-2 pb-6 flex flex-col gap-3">
          <div className={`flex items-center gap-2.5 px-3 ${isExpanded ? "justify-start" : "justify-center"}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00c853] shadow-[0_0_8px_rgba(0,200,83,0.8)] shrink-0 animate-pulse" />
            {isExpanded && <span className="text-[10px] font-black tracking-wider text-[#00c853] uppercase whitespace-nowrap">Sistema en Línea</span>}
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-2xl py-2 px-3 text-[#584f66] hover:text-[#ff1f68] hover:bg-pink-50/50 transition-all text-xs group cursor-pointer ${
              isExpanded ? "gap-3 justify-start" : "justify-center"
            }`}
          >
            <LogOut size={19} strokeWidth={2} className="text-[#685f76] group-hover:text-[#ff1f68] transition-colors shrink-0" />
            {isExpanded && <span className="font-bold text-[13px]">Cerrar Sesión</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
