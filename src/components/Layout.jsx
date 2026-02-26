import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ToastProvider } from './Toast';

function Layout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <ToastProvider>
                    <Outlet />
                </ToastProvider>
            </main>
        </div>
    );
}

export default Layout;
