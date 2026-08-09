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
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { syncService } from '../services/syncService';
import '../styles/components/_layout.scss';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, appLoading } = useSelector((state) => state.auth);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncService.syncPendingResults().then((res) => {
        if (res.status === 'finished' && res.successCount > 0) {
          // Re-fetch user to update streaks, level, and XP progressions
          dispatch(fetchUser());
        }
      });
    }
  }, [isOnline, dispatch]);

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
        <Sidebar />
        <main className="main-content">
          <Topbar />
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
