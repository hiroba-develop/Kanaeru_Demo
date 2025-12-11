import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Map,
  Menu,
  X,
  Users,
  Briefcase,
  Home,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import headerIcon from "../assets/header_icon.png";
import { onMandalaGoalUpdate } from "../utils/mandalaIntegration";
import mandalaIcon from "../assets/mandala_icon.png";
import settingsIcon from "../assets/settings_icon.png";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();
  const isMandalaPage = location.pathname === "/mandalaChart";
  const { logout, user, managedUsers, selectedUser, switchUser } = useAuth();

  const MandalaIcon: React.FC<{ className?: string }> = ({
    className = "",
  }) => (
    <img
      src={mandalaIcon}
      alt="Mandala"
      className={`inline-block align-middle ${className}`}
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        objectFit: 'cover'
      }}
    />
  );

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  useEffect(() => {
    try {
      const role = getCookie("role");
      setUserRole(role);
    } catch (err) {
      console.error("cookieの解析に失敗:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user?.avatar]);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const clientNavigation = [
    {
      name: "HOME",
      href: "/",
      icon: Home,
      disabled: false,
      roleRequired: ["0", "1", "2"],
    },
    {
      name: "kanaeruマンダラ",
      href: "/mandalaChart",
      icon: MandalaIcon,
      disabled: false,
      roleRequired: ["0", "1", "2"],
    },
    {
      name: "年次PL",
      href: "/yearlyBudgetActual",
      icon: Map,
      disabled: false,
      roleRequired: ["0", "1", "2"],
    },
  ];

  const adminNavigation = [
    {
      name: "クライアント管理",
      href: "/clientManagement",
      icon: Briefcase,
      disabled: false,
      roleRequired: ["1", "2"],
    },
    {
      name: "ユーザー管理",
      href: "/userManagement",
      icon: Users,
      disabled: false,
      roleRequired: ["2"],
    },
  ];

  const roleFilter = (item: { roleRequired?: string | string[] }) => {
    if (!item.roleRequired) return true;
    if (Array.isArray(item.roleRequired)) {
      return userRole !== null && item.roleRequired.includes(userRole);
    }
    return userRole === item.roleRequired;
  };

  const filteredClientNavigation = clientNavigation.filter(roleFilter);
  const filteredAdminNavigation = adminNavigation.filter(roleFilter);

  const userInfo = (
    <div className="p-4 sm:p-5 lg:p-6 flex justify-center" style={{ background: '#F6FAFC' }}>
      <div className="flex flex-col items-center space-y-2 sm:space-y-3">
        <button
          type="button"
          onClick={handleAvatarClick}
          className="relative rounded-full border-2 border-gray-200 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-20 h-20 sm:w-24 sm:h-24"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt={user?.name || "avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-400 text-white flex items-center justify-center text-lg sm:text-xl font-semibold">
              {user?.name?.charAt(0) || "U"}
            </div>
          )}
        </button>
  
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />  
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-800">
            {user?.name || "User Name"}
          </p>
        </div>
      </div>
    </div>
  );

  const userSwitcher = (
    <>
      {(userRole === "1" || userRole === "2") && managedUsers.length > 0 && (
        <div className="px-3 py-2 sm:p-3 lg:p-4" style={{ background: '#F6FAFC' }}>
          <div className="relative">
            <select
              value={selectedUser?.id || ""}
              onChange={(e) => {
                switchUser(e.target.value);
                if (sidebarOpen) {
                  setSidebarOpen(false);
                }
              }}
              className="w-full text-xs sm:text-sm border border-gray-300 rounded px-2 py-1.5 pr-8 appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              style={{
                backgroundImage:
                  'url(\'data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>\')',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "calc(100% - 4px) center",
                backgroundSize: "16px",
              }}
            >
              {managedUsers.map((managedUser) => (
                <option key={managedUser.id} value={managedUser.id}>
                  表示中: {managedUser.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* サイドバー（PC） - 固定配置、z-indexを高く */}
        <aside className="hidden lg:flex lg:flex-shrink-0 fixed left-0 top-0 h-screen z-30">
          <div 
            className="flex flex-col h-full w-52 xl:w-56"
            style={{
              background: '#F6FAFC',
              boxShadow: '0px 4px 12px 0px rgba(124, 124, 124, 0.25)',
              overflowX: 'hidden'
            }}
          >
            {/* ロゴエリア - 中央揃え */}
            <div 
              className="flex items-center justify-center h-16 xl:h-20"
            >
              <img
                src={headerIcon}
                alt="Kanaeru"
                className="h-7 xl:h-8 w-auto object-contain"
              />
            </div>

            {/* userInfo - 背景色と中央揃え */}
            <div className="p-4 xl:p-6 flex justify-center" style={{ background: '#F6FAFC' }}>
              <div className="flex flex-col items-center space-y-2 xl:space-y-3">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="relative rounded-full border-2 border-gray-200 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-20 h-20 xl:w-24 xl:h-24"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user?.name || "avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-400 text-white flex items-center justify-center text-lg xl:text-xl font-semibold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="text-center">
                  <p className="text-xs xl:text-sm text-gray-800">
                    {user?.name || "User Name"}
                  </p>
                </div>
              </div>
            </div>

            {/* userSwitcher - 背景色を調整 */}
            {(userRole === "1" || userRole === "2") && managedUsers.length > 0 && (
              <div className="px-3 py-2 xl:p-4" style={{ background: '#F6FAFC' }}>
                <div className="relative">
                  <select
                    value={selectedUser?.id || ""}
                    onChange={(e) => {
                      switchUser(e.target.value);
                      if (sidebarOpen) {
                        setSidebarOpen(false);
                      }
                    }}
                    className="w-full text-xs xl:text-sm border border-gray-300 rounded px-2 py-1.5 pr-8 appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{
                      backgroundImage:
                        'url(\'data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>\')',
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "calc(100% - 4px) center",
                      backgroundSize: "16px",
                    }}
                  >
                    {managedUsers.map((managedUser) => (
                      <option key={managedUser.id} value={managedUser.id}>
                        表示中: {managedUser.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto" style={{ overflowX: 'hidden' }}>
              <div className="space-y-1 xl:space-y-2 pl-6 xl:pl-9 pr-3 pt-3">
                {filteredClientNavigation.map((item) => {
                  const isActive = location.pathname === item.href;

                  if (item.disabled) {
                    return (
                      <div
                        key={item.name}
                        className="flex items-start py-2 xl:py-2.5 rounded-lg cursor-not-allowed opacity-50"
                      >
                        <item.icon className="h-4 w-4 xl:h-5 xl:w-5 mr-2 xl:mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs xl:text-sm text-gray-400">
                            {item.name}
                          </span>
                          <span className="text-[10px] xl:text-xs text-red-500 font-small">
                            COMING SOON
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center py-2 xl:py-2.5 rounded-none transition-colors -ml-6 xl:-ml-9 pl-6 xl:pl-9 ${
                        isActive
                          ? "bg-white text-primary"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-4 w-4 xl:h-5 xl:w-5 mr-2 xl:mr-3 flex-shrink-0" />
                      <span className="text-xs xl:text-sm">{item.name}</span>
                    </Link>
                  );
                })}

                {filteredAdminNavigation.length > 0 && (
                  <hr className="border-gray-200 my-2" />
                )}

                {filteredAdminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;

                  if (item.disabled) {
                    return (
                      <div
                        key={item.name}
                        className="flex items-start py-2 xl:py-2.5 rounded-lg cursor-not-allowed opacity-50"
                      >
                        <item.icon className="h-4 w-4 xl:h-5 xl:w-5 mr-2 xl:mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs xl:text-sm text-gray-400">
                            {item.name}
                          </span>
                          <span className="text-[10px] xl:text-xs text-red-500 font-small">
                            COMING SOON
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center py-2 xl:py-2.5 rounded-none transition-colors -ml-6 xl:-ml-9 pl-6 xl:pl-9 ${
                      isActive
                        ? "bg-white text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4 xl:h-5 xl:w-5 mr-2 xl:mr-3 flex-shrink-0" />
                    <span className="text-xs xl:text-sm">{item.name}</span>
                  </Link>
                  );
                })}
              </div>
            </nav>
            {/* お問い合わせボタンを追加 */}
            <div className="p-4 xl:p-6">
              <button
                onClick={() => {
                  // お問い合わせ処理（例：モーダル表示、ページ遷移など）
                  //window.location.href = 'mailto:support@example.com';
                  // または
                  // window.open('/contact', '_blank');
                }}
                className="w-full text-xs xl:text-sm font-medium bg-primary text-white border border-primary transition-colors hover:bg-primary/90 px-3 py-1.5 xl:px-4 xl:py-2 rounded-full"
              >
                お問い合わせ
              </button>
            </div>
          </div>
        </aside>

        {/* メインコンテンツエリア（サイドバーの幅分左にマージン） */}
        <div className="flex-1 lg:ml-52 xl:ml-56">
          {/* ヘッダー */}
          <header 
            className="px-3 sm:px-4 lg:px-6 h-14 sm:h-16 lg:h-20 flex items-center lg:pl-6 relative"
            style={{
              background: '#F6FAFC'
            }}
          >
            <div className="flex items-center h-full w-full">
              <div className="flex items-center">
                <button
                  type="button"
                  className="lg:hidden p-1.5 sm:p-2 rounded-md text-text hover:bg-sub2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <div className="flex items-center ml-2 lg:ml-0">
                  <img
                    src={headerIcon}
                    alt="Kanaeru"
                    className="h-6 sm:h-8 w-auto lg:hidden"
                  />

                  <span className="ml-2 text-xs sm:text-sm text-blue-600 font-medium">
                    (デモ版)
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex items-center">
                {isMandalaPage && (
                  <button
                    onClick={() => {
                      onMandalaGoalUpdate();
                      alert("目標を更新しました。");
                    }}
                    className="text-xs sm:text-sm font-medium bg-white text-primary border border-primary transition-colors hover:bg-primary/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full whitespace-nowrap absolute"
                    style={{
                      background: '#F6FAFC',
                      left: '963px'
                    }}
                  >
                    目標を更新する
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (window.confirm("ログアウトしますか？")) {
                      logout();
                    }
                  }}
                  className="hover:opacity-80 transition-opacity text-xs sm:text-sm text-gray-800 whitespace-nowrap absolute"
                  style={{
                    left: '1126px'
                  }}
                >
                  ログアウト
                </button>

                <Link
                  to="/settings"
                  className="p-1.5 sm:p-2 rounded-md hover:bg-sub2 transition-colors flex items-center justify-center absolute"
                  title="設定"
                  style={{
                    left: '1228px'
                  }}
                >
                  <img 
                    src={settingsIcon} 
                    alt="設定" 
                    className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                  />
                </Link>
              </div>
              {/* モバイル用は右側に配置 */}
              <div className="flex lg:hidden items-center space-x-2 sm:space-x-3 ml-auto">
                {/* 既存のモバイル用ボタン配置 */}
              </div>
            </div>
          </header>

          {/* メインコンテンツ */}
          <main className="overflow-x-auto">
            {children}
          </main>
        </div>

        {/* モバイルサイドバー */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            <div 
              className="fixed inset-y-0 left-0 shadow-xl flex flex-col w-4/5 max-w-xs sm:max-w-sm"
              style={{
                background: '#F6FAFC',
                boxShadow: '0px 4px 12px 0px rgba(124, 124, 124, 0.25)',
                overflowX: 'hidden'
              }}
            >
              <div className="flex items-center justify-between px-3 py-2 sm:p-4 h-14 sm:h-16">
                <div className="flex-1 flex justify-center">
                  <img
                    src={headerIcon}
                    alt="Kanaeru"
                    className="h-6 sm:h-8 w-auto object-contain"
                  />
                </div>
                <button
                  type="button"
                  className="p-1.5 sm:p-2 rounded-md text-gray-700 hover:bg-gray-100 absolute right-3"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              {userInfo}
              {userSwitcher}
              <nav className="flex-1 overflow-y-auto" style={{ overflowX: 'hidden' }}>
                <div className="space-y-1 sm:space-y-2 pl-6 sm:pl-9 pr-3 pt-3">
                  {filteredClientNavigation.map((item) => {
                    const isActive = location.pathname === item.href;

                    if (item.disabled) {
                      return (
                        <div
                          key={item.name}
                          className="flex items-start py-2 sm:py-2.5 rounded-lg cursor-not-allowed opacity-50"
                        >
                          <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm text-gray-400">
                              {item.name}
                            </span>
                            <span className="text-[10px] sm:text-xs text-red-500 font-small">
                              COMING SOON
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center py-2 sm:py-2.5 rounded-none transition-colors -ml-6 sm:-ml-9 pl-6 sm:pl-9 ${
                          isActive
                            ? "bg-white text-primary"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{item.name}</span>
                      </Link>
                    );
                  })}

                  {filteredAdminNavigation.length > 0 && (
                    <hr className="border-gray-200 my-2" />
                  )}

                  {filteredAdminNavigation.map((item) => {
                    const isActive = location.pathname === item.href;

                    if (item.disabled) {
                      return (
                        <div
                          key={item.name}
                          className="flex items-start py-2 sm:py-2.5 rounded-lg cursor-not-allowed opacity-50"
                        >
                          <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm text-gray-400">
                              {item.name}
                            </span>
                            <span className="text-[10px] sm:text-xs text-red-500 font-small">
                              COMING SOON
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center py-2 sm:py-2.5 rounded-none transition-colors -ml-6 sm:-ml-9 pl-6 sm:pl-9 ${
                          isActive
                            ? "bg-white text-primary"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;