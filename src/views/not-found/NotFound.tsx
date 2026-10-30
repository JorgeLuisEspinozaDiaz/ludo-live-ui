export const NotFound = () => {
  return (
    <div className="h-full w-full flex items-center justify-center p-6 ">
      <div className="text-center bg-white/80 backdrop-blur-md border border-pink-100 p-12 rounded-[40px] shadow-[0_15px_40px_rgba(255,182,193,0.2)] max-w-md w-full">
        <h1 className="text-7xl font-black text-[#ff1f68] tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-[#2c2338] mt-3">Página no encontrada</h2>
        <p className="text-xs text-[#8f889c] font-medium mt-1">La sección a la que intentas ingresar no existe o ha sido movida.</p>
      </div>
    </div>
  );
};

export default NotFound;
