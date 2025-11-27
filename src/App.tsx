import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import YearlyBudgetActual from "./pages/YearlyBudgetActual";
// import MonthlyBudgetActual from "./pages/MonthlyBudgetActual";
// import Support from "./pages/Support";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
// import Ranking from "./pages/Ranking";
import ClientManagement from "./pages/ClientManagement";
import UserManagement from "./pages/UserManagement";
import MandalaChart from "./pages/MandalaChart";
import SwipeChoiceComponent from "./pages/SwipeChoiceComponent";
import SimulationScreen from "./pages/SimulationScreen";
import { useEffect } from "react";

// 認証が必要なページをラップするコンポーネント
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading, shouldRedirectToLogin, shouldRedirectToSetup } =
    useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
          <p className="text-sm text-blue-600 mt-2">(デモモード)</p>
        </div>
      </div>
    );
  }

  // cookieに「userId」キーが無い場合は、必ずlogin画面に遷移
  if (shouldRedirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  // cookieに「settingFlg」キーの「settingFlg」が0の場合は必ずセットアップ画面に遷移
  if (shouldRedirectToSetup) {
    return <Navigate to="/setup" replace />;
  }

  // ユーザーが存在しない場合はログイン画面に遷移
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // セットアップが未完了の場合はセットアップ画面に遷移
  if (!user.isSetupComplete) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};

// メインアプリケーションコンポーネント
const AppContent: React.FC = () => {
  // 検索エンジンボット対策の強化
  useEffect(() => {
    // User-Agentベースでのボット検出
    const userAgent = navigator.userAgent.toLowerCase();
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

    if (isBot) {
      // ボットの場合は空のページを表示
      document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center;">
            <h1>会員限定サイト</h1>
            <p>このサイトは会員限定です。</p>
            <p>アクセスには認証が必要です。</p>
          </div>
        </div>
      `;
      return;
    }

    // メタタグの動的追加（念のため）
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow, noarchive, nosnippet, noimageindex";
      document.head.appendChild(meta);
    }

    // デモモード用のページタイトル設定
    document.title = "Kanaeru - HOME (デモ版)";
  }, []);

  return (
    <Routes>
      {/* ログイン画面 */}
      <Route path="/login" element={<Login />} />

      {/* 初期設定画面 */}
      <Route path="/setup" element={<Setup />} />

      {/* 認証が必要なページ */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/yearlyBudgetActual"
        element={
          <ProtectedRoute>
            <Layout>
              <YearlyBudgetActual />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/monthlyBudgetActual"
        element={
          <ProtectedRoute>
            <Layout>
              <MonthlyBudgetActual />
            </Layout>
          </ProtectedRoute>
        }
      /> */}
      {/* <Route
        path="/support"
        element={
          <ProtectedRoute>
            <Layout>
              <Support />
            </Layout>
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/ranking"
        element={
          <ProtectedRoute>
            <Layout>
              <Ranking />
            </Layout>
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/clientManagement"
        element={
          <ProtectedRoute>
            <Layout>
              <ClientManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/userManagement"
        element={
          <ProtectedRoute>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mandalaChart"
        element={
          <ProtectedRoute>
            <Layout>
              <MandalaChart />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/swipeChoiceComponent"
        element={
          <ProtectedRoute>
            <Layout>
              <SwipeChoiceComponent />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/simulation"
        element={
          <ProtectedRoute>
            <Layout>
              <SimulationScreen />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  // Viteのベースパスを取得
  const basename = import.meta.env.BASE_URL;

  console.log(basename);
  return (
    <AuthProvider>
      <Router basename={basename}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
