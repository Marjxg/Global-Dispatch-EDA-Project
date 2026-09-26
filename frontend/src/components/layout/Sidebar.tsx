
import { LayoutDashboard, PlusCircle, ClipboardList, Truck, X } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuItems = [
    {
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
    },
    {
        label: "New Request",
        path: "/orders/new",
        icon: PlusCircle,
    },
    {
        label: "My requests",
        path: "/orders",
        icon: ClipboardList,
    },
    {
        label: "Available Loads",
        path: "/loads",
        icon: Truck,
    },
];

export default function Sidebar({
    isOpen,
    onClose,
}: SidebarProps) {
    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-300
                            lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                
                <div className="flex h-20 items-center justify-between border-b border-slate-700 px-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-400 p-2">
                            <Truck size={24} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold">NewCron</h1>
                            <p className="text-xs text-slate-400">
                                Logistics Platform
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar menú"
                        className="lg:hidden"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Navegación */}
                <nav className="flex-1 space-y-2 px-4 py-6">
                    <p className="mb-4 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                        General
                    </p>

                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive
                                        ? "bg-blue-400 text-white"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
