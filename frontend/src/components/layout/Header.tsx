import { Bell, Menu, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
    onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/orders/new": "New Request",
    "/orders": "My requests",
    "/loads": "Available Loads",
};

export default function Header({
    onMenuClick,
}: HeaderProps) {
    const location = useLocation();

    const currentPage = pageTitles[location.pathname] ?? "NewCron";

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-blue-100 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                {/* Botón menú móvil */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Abrir menú"
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                >
                    <Menu size={24} />
                </button>
                
                <div>
                    <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                        <span>NewCron</span>
                        <ChevronRight size={14} />
                        <span>{currentPage}</span>
                    </div>

                    <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                        {currentPage}
                    </h2>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div
                    aria-label="Notificaciones"
                    className="relative rounded-full p-2 text-slate-600"
                >
                    <Bell size={21} />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
                </div>

                <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            </div>
        </header>
    );
}
