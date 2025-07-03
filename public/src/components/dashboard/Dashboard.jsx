import React from 'react';
import Header from './Header';
import Sidebar from '../sidebar/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

function DashboardLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Fixed Sidebar */}
            <aside className="w-64 fixed inset-y-0 left-0 bg-white shadow-md border-r-2 z-20">
                <Sidebar currentPath={location.pathname} />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white shadow px-4 py-3">
                    <Header />
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;