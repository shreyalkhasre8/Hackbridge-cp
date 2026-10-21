/**
 * HackBridge Authenticated Application Shell
 * Sidebar navigation, top bar with persona switcher, notifications, and responsive layout.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Compass,
  Users,
  Sparkles,
  Award,
  Database,
  BarChart3,
  Bell,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  ChevronRight,
  Check,
  Building,
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout, demoLogin, addToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      addToast('All notifications marked as read', 'success');
    } catch (e) {
      addToast('Error marking notifications read', 'danger');
    }
  };

  const handlePersonaSwitch = async (role) => {
    await demoLogin(role);
    if (role === 'student') navigate('/dashboard');
    else if (role === 'mentor') navigate('/mentor/dashboard');
    else if (role === 'college') navigate('/organizer/dashboard');
    else if (role === 'admin') navigate('/admin');
  };

  // Nav Items tailored by role
  let navItems = [
    { label: 'Student Dashboard', path: '/dashboard', icon: Sparkles, roles: ['student'] },
    { label: 'Mentor Portal', path: '/mentor/dashboard', icon: Award, roles: ['mentor'] },
    { label: 'Organizer Portal', path: '/organizer/dashboard', icon: Building, roles: ['college'] },
    { label: 'Admin Console', path: '/admin', icon: Shield, roles: ['admin'] },
    { label: 'Explore Hackathons', path: '/hackathons', icon: Compass, roles: ['student', 'mentor', 'college', 'admin'] },
    { label: 'Find & Manage Teams', path: '/teams', icon: Users, roles: ['student', 'mentor', 'college', 'admin'] },
    { label: 'Smart Team Formation', path: '/smart-formation', icon: Sparkles, roles: ['student', 'admin'] },
    { label: 'Mentor Matching', path: '/mentors', icon: Award, roles: ['student', 'college', 'admin'] },
    { label: 'DDBMS Distributed Demo', path: '/ddbms', icon: Database, roles: ['student', 'mentor', 'college', 'admin'] },
    { label: 'Platform Analytics', path: '/analytics', icon: BarChart3, roles: ['student', 'mentor', 'college', 'admin'] },
    { label: 'My Student Profile', path: '/profile', icon: User, roles: ['student'] },
  ];

  const visibleNav = navItems.filter(item => !user || item.roles.includes(user.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-canvas)' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--color-olive-900)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-olive-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={18} color="var(--color-accent-400)" />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF' }}>
              Hack<span style={{ color: 'var(--color-accent-400)' }}>Bridge</span>
            </span>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-olive-300)' }}>
              {user?.role?.toUpperCase()} PORTAL
            </div>
          </div>
        </div>

        {/* Links */}
        <nav style={{ padding: '1.25rem 0.85rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#FFFFFF' : 'var(--color-olive-200)',
                  backgroundColor: isActive ? 'var(--color-olive-750, rgba(255, 255, 255, 0.12))' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={18} color={isActive ? 'var(--color-accent-400)' : 'var(--color-olive-300)'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div style={{
          padding: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Logged In User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-olive-300)', textTransform: 'capitalize' }}>
                {user?.role} • {user?.profile_id || 'ID'}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-olive-300)',
                cursor: 'pointer',
                padding: '0.4rem',
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '70px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          {/* Quick Persona Switcher Chip Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Switch Persona:
            </span>
            <button
              onClick={() => handlePersonaSwitch('student')}
              style={{
                border: user?.role === 'student' ? '2px solid var(--color-olive-800)' : '1px solid var(--border-default)',
                background: user?.role === 'student' ? 'var(--color-olive-100)' : '#FFFFFF',
                borderRadius: 'var(--radius-pill)',
                padding: '0.25rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🎓 Student
            </button>
            <button
              onClick={() => handlePersonaSwitch('mentor')}
              style={{
                border: user?.role === 'mentor' ? '2px solid var(--color-olive-800)' : '1px solid var(--border-default)',
                background: user?.role === 'mentor' ? 'var(--color-olive-100)' : '#FFFFFF',
                borderRadius: 'var(--radius-pill)',
                padding: '0.25rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              👨‍🏫 Mentor
            </button>
            <button
              onClick={() => handlePersonaSwitch('college')}
              style={{
                border: user?.role === 'college' ? '2px solid var(--color-olive-800)' : '1px solid var(--border-default)',
                background: user?.role === 'college' ? 'var(--color-olive-100)' : '#FFFFFF',
                borderRadius: 'var(--radius-pill)',
                padding: '0.25rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🏛️ Organizer
            </button>
            <button
              onClick={() => handlePersonaSwitch('admin')}
              style={{
                border: user?.role === 'admin' ? '2px solid var(--color-olive-800)' : '1px solid var(--border-default)',
                background: user?.role === 'admin' ? 'var(--color-olive-100)' : '#FFFFFF',
                borderRadius: 'var(--radius-pill)',
                padding: '0.25rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ⚙️ Admin
            </button>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Notifications Popover */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-danger)',
                  }} />
                )}
              </button>

              {notifOpen && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '340px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1rem',
                  zIndex: 100,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications ({unreadCount} new)</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: 'var(--color-olive-700)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 6).map(n => (
                        <div
                          key={n.id}
                          style={{
                            padding: '0.65rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: n.is_read ? 'transparent' : 'var(--color-olive-50)',
                            borderLeft: n.is_read ? '3px solid transparent' : '3px solid var(--color-accent-400)',
                            fontSize: '0.825rem',
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                            {n.title}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-olive-100)',
                color: 'var(--color-olive-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: '1px solid var(--color-olive-300)',
              }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</span>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
