import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../store/slices/authSlice';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import BottomNavbar from '../components/BottomNavbar';
import BottomSheet from '../components/BottomSheet';
import BackgroundLayer from '../components/BackgroundLayer';
import PageLoader from '../components/PageLoader';
import '../styles/components/_layout.scss';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, appLoading } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  if (appLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <BackgroundLayer />
      <div className="layout-wrapper">
        <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="main-content">
          <Topbar toggleSidebar={() => setSidebarOpen(true)} />
          <div className="page-container">
            <Outlet />
          </div>
        </main>
        <BottomNavbar onToggleSidebar={() => setBottomSheetOpen(true)} />
        <BottomSheet isOpen={bottomSheetOpen} onClose={() => setBottomSheetOpen(false)} />
      </div>
    </>
  );
};

export default DashboardLayout;
