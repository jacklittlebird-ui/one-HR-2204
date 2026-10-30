import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  RefreshCw, Loader2, LogOut, Globe, Car, Clock, BarChart3, Menu, X,
  CalendarDays, BellRing, BookOpen, CalendarClock, Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { FleetByStation } from '@/components/vehicles/FleetByStation';
import { LicenseAlerts } from '@/components/vehicles/LicenseAlerts';
import { VehicleRegistry } from '@/components/vehicles/VehicleRegistry';
import { VehicleLicenseTracking } from '@/components/vehicles/VehicleLicenseTracking';
import { VehicleMaintenance } from '@/components/vehicles/VehicleMaintenance';
import { VehicleReports } from '@/components/vehicles/VehicleReports';
import { VehicleRoster } from '@/components/vehicles/VehicleRoster';
import { usePreventPullToRefresh } from '@/hooks/usePreventPullToRefresh';

type NavItem = { id: string; label: string; icon: typeof Car };

const VehiclePortal = () => {
  const { user, logout } = useAuth();
  const { language, isRTL, setLanguage } = useLanguage();
  const isAr = language === 'ar';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('by-station');
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const [now, setNow] = useState(new Date());
  const [navOpen, setNavOpen] = useState(true);       // desktop collapse
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile drawer
  const containerRef = useRef<HTMLDivElement>(null);
  usePreventPullToRefresh(containerRef);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const handleRefresh = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      setRefreshKey((k) => k + 1);
      await new Promise((r) => setTimeout(r, 350));
      toast.success(isAr ? 'تم تحديث بيانات السيارات' : 'Vehicle data refreshed');
    } finally {
      setRefreshing(false);
      refreshingRef.current = false;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const vehicleGroup: NavItem[] = [
    { id: 'by-station', label: isAr ? 'سيارات المحطة' : 'Station Vehicles', icon: Car },
    { id: 'reports', label: isAr ? 'التقارير' : 'Reports', icon: BarChart3 },
    { id: 'alerts', label: isAr ? 'تنبيهات التراخيص' : 'License Alerts', icon: BellRing },
    { id: 'registry', label: isAr ? 'سجل السيارات' : 'Vehicle Registry', icon: BookOpen },
    { id: 'licenses', label: isAr ? 'متابعة التراخيص' : 'License Tracking', icon: CalendarClock },
    { id: 'maintenance', label: isAr ? 'الصيانة' : 'Maintenance', icon: Wrench },
  ];
  const rosterGroup: NavItem[] = [
    { id: 'roster', label: isAr ? 'الروستر' : 'Roster', icon: CalendarDays },
  ];

  const groups = [
    { title: isAr ? 'السيارات' : 'Vehicles', items: vehicleGroup },
    { title: isAr ? 'الروستر' : 'Roster', items: rosterGroup },
  ];

  const selectTab = (id: string) => {
    setActiveTab(id);
    setDrawerOpen(false);
  };

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return isAr ? 'صباح الخير' : 'Good Morning';
    if (h < 17) return isAr ? 'مساء الخير' : 'Good Afternoon';
    return isAr ? 'مساء الخير' : 'Good Evening';
  })();

  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const displayName = isAr ? (user?.nameAr || '') : (user?.name || '');

  const renderNavItems = (compact: boolean) => (
    <nav className="flex flex-col gap-4 p-2" aria-label={isAr ? 'قائمة التنقل' : 'Navigation'}>
      {groups.map((group) => (
        <div key={group.title}>
          <p className={cn(
            'px-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground',
            compact && 'text-center'
          )}>
            {compact ? group.title.slice(0, 1) : group.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  aria-current={active ? 'page' : undefined}
                  title={item.label}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors text-start',
                    compact && 'justify-center px-0',
                    active
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!compact && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const sidebarHeader = (
    <div className="flex items-center gap-2 px-3 py-3 border-b">
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
        <Car className="w-4 h-4" />
      </div>
      <p className="text-sm font-bold truncate">{isAr ? 'بوابة السيارات' : 'Vehicles Portal'}</p>
    </div>
  );

  const activeLabel =
    [...vehicleGroup, ...rosterGroup].find((i) => i.id === activeTab)?.label ?? '';

  return (
    <div ref={containerRef} className="h-dvh flex flex-col bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="shrink-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="w-full px-4 py-3 flex items-center justify-between gap-3">
          <div className={cn('flex items-center gap-3 min-w-0', isRTL && 'flex-row-reverse')}>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label={isAr ? 'فتح القائمة' : 'Open menu'}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setNavOpen((v) => !v)}
              aria-label={navOpen ? (isAr ? 'إخفاء القائمة' : 'Hide menu') : (isAr ? 'إظهار القائمة' : 'Show menu')}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="p-2 rounded-lg bg-primary/10 text-primary hidden sm:block">
              <Car className="w-5 h-5" />
            </div>
            <div className={cn('min-w-0', isRTL && 'text-end')}>
              <h1 className="text-base sm:text-lg font-bold leading-tight truncate">
                {isAr ? 'بوابة سيارات المحطة' : 'Station Vehicles Portal'}
              </h1>
              <p className="text-xs text-muted-foreground truncate">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLanguage(isAr ? 'en' : 'ar')} aria-label="Language">
              <Globe className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} aria-label="Refresh" aria-busy={refreshing}>
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 me-1" />
              <span className="hidden sm:inline">{isAr ? 'خروج' : 'Logout'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Welcome banner */}
      <div className="shrink-0 w-full px-4 pt-4">
        <Card className="p-4 sm:p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className={cn('flex items-center justify-between gap-3 flex-wrap', isRTL && 'flex-row-reverse')}>
            <div className={cn(isRTL && 'text-end')}>
              <p className="text-sm text-muted-foreground">{greeting} 👋</p>
              <h2 className="text-lg sm:text-xl font-bold">{displayName}</h2>
            </div>
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Clock className="w-4 h-4" />
              <span className="tabular-nums text-lg" dir="ltr">{timeStr}</span>
            </div>
          </div>
        </Card>
      </div>

      {refreshing && (
        <div className="shrink-0 w-full px-4 mt-3">
          <div role="status" aria-live="polite" className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary">
            <Loader2 className="h-4 h-4 animate-spin" />
            <span>{isAr ? 'جاري تحديث بيانات السيارات...' : 'Refreshing vehicle data...'}</span>
          </div>
        </div>
      )}

      {/* Body: sidebar + content */}
      <div className="flex-1 min-h-0 flex">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'hidden lg:flex shrink-0 flex-col border-e bg-card overflow-y-auto transition-[width] duration-200',
            navOpen ? 'w-60' : 'w-14'
          )}
        >
          {navOpen && sidebarHeader}
          {renderNavItems(!navOpen)}
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="lg:hidden">
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <aside
              className="fixed inset-y-0 end-0 z-50 w-[85vw] max-w-xs bg-card border-e shadow-xl overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label={isAr ? 'القائمة الجانبية' : 'Menu'}
            >
              <div className="flex items-center justify-between border-b px-3 py-3">
                <p className="text-sm font-bold">{isAr ? 'القائمة' : 'Menu'}</p>
                <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label={isAr ? 'إغلاق' : 'Close'}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {renderNavItems(false)}
            </aside>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 min-h-0 w-full px-4 py-2 sm:py-3 flex flex-col overflow-hidden">
          <h2 className="shrink-0 text-sm font-semibold text-muted-foreground mb-2">{activeLabel}</h2>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto rounded-md border bg-card/40 p-2 sm:p-3" dir={isRTL ? 'rtl' : 'ltr'}>
            {activeTab === 'by-station' && <FleetByStation key={`fbs-${refreshKey}`} />}
            {activeTab === 'roster' && <VehicleRoster key={`roster-${refreshKey}`} />}
            {activeTab === 'reports' && <VehicleReports key={`vrep-${refreshKey}`} />}
            {activeTab === 'alerts' && <LicenseAlerts key={`la-${refreshKey}`} />}
            {activeTab === 'registry' && <VehicleRegistry key={`vr-${refreshKey}`} />}
            {activeTab === 'licenses' && <VehicleLicenseTracking key={`vl-${refreshKey}`} />}
            {activeTab === 'maintenance' && <VehicleMaintenance key={`vm-${refreshKey}`} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VehiclePortal;
