import { useState, useRef, useEffect } from "react";
import { Clock, LogOut } from "lucide-react";
import { useSignals } from "@preact/signals-react/runtime";
import { useNavigate } from "react-router";
import { authSession, clearSession } from "../../store/authStore";

export const Navbar = () => {
  useSignals();
  const navigate = useNavigate();
  const user = authSession.value?.user;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const getFormattedDate = () => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Setiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const dayName = days[currentDateTime.getDay()];
    const day = currentDateTime.getDate();
    const monthName = months[currentDateTime.getMonth()];
    const year = currentDateTime.getFullYear();

    return `${dayName}, ${day} De ${monthName} De ${year}`;
  };

  const getFormattedTime = () => {
    return currentDateTime.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const displayName = user?.username ?? "Usuario";
  const roleName = user?.role?.name ?? "Sin rol";

  return (
    <header className="w-full flex items-center justify-between py-4 px-6  bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[24px] font-black text-[#2b2238] flex items-center gap-1.5 tracking-tight">
          <span>
            {getGreeting()}, {displayName}
          </span>
          <span className="text-xl">✨</span>
        </h1>

        <div className="flex items-center gap-2 text-[12px] font-medium text-[#8f889c]">
          <span>{getFormattedDate()}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a70]/60 inline-block" />
          <div className="flex items-center gap-1 text-[#ff2a70] font-bold">
            <Clock size={13} strokeWidth={2.5} />
            <span>{getFormattedTime()}</span>
          </div>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`flex items-center gap-3 bg-white/95 backdrop-blur-sm py-1.5 pl-5 pr-2 rounded-full border border-pink-100/90 shadow-[0_4px_16px_rgba(255,182,193,0.18)] cursor-pointer hover:shadow-md transition-all duration-200 ${
            isProfileOpen ? "ring-2 ring-[#ff2a70]/20" : ""
          }`}
        >
          <div className="flex flex-col text-right">
            <span className="text-[#2b2238] font-black text-[13px] leading-tight">{displayName}</span>
            <span className="text-[#ff2a70] font-black text-[9.5px] tracking-wider uppercase mt-0.5">{roleName}</span>
          </div>

          <div className="w-10 h-10 rounded-full border-2 border-[#ff2a70] p-0.5 bg-white shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=ffd5dc`}
              alt="Usuario Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {isProfileOpen && (
          <div className="absolute right-0 mt-2.5 z-200 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
            <div className="bg-white rounded-3xl shadow-[0_12px_35px_rgba(255,182,193,0.35)] border border-pink-100/90 p-2 min-w-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#ff2a70] hover:bg-pink-50/70 rounded-[18px] transition-all font-black text-[12px] tracking-wider uppercase cursor-pointer group"
              >
                <LogOut size={16} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
