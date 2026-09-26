import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 lg:flex">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)} />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header onMenuClick={() => setSidebarOpen(true)}/>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
