import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import { runMockML } from './utils/ml';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage    from './components/LoginPage';
import Sidebar      from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import ReportsPage  from './components/ReportsPage';
import MapPage      from './components/MapPage';
import TeamsPage    from './components/TeamsPage';

function LoadingSplash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
          <span className="text-white font-black text-xl">R</span>
        </div>
        <svg className="animate-spin w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
    </div>
  );
}

function AppShell({ user, onSignOut }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'pothole_reports'),
      (snapshot) => {
        const rows = snapshot.docs.map(d => {
          const data = d.data();
          let ts = null;
          if (data.timestamp?.toDate) ts = data.timestamp.toDate();
          else if (data.timestamp)    ts = new Date(data.timestamp);
          return { id: d.id, ...data, timestamp: ts, ml: runMockML(d.id) };
        });
        rows.sort((a, b) => b.ml.J - a.ml.J);
        setReports(rows);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore:', err);
        setError('Could not connect to Firestore. Check your .env and Firestore rules.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const pages = {
    dashboard: <DashboardPage reports={reports} loading={loading} error={error} />,
    reports:   <ReportsPage   reports={reports} loading={loading} />,
    map:       <MapPage       reports={reports} />,
    teams:     <TeamsPage />,
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#0D1117] overflow-hidden transition-colors duration-200">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        userEmail={user?.email}
        onSignOut={onSignOut}
      />
      <main className="flex-1 overflow-y-auto">
        {pages[activePage]}
      </main>
    </div>
  );
}

export default function App() {
  // undefined = still checking, null = logged out, object = logged in
  const [authUser, setAuthUser] = useState(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, u => setAuthUser(u ?? null));
  }, []);

  if (authUser === undefined) return <LoadingSplash />;
  if (!authUser) return <LoginPage />;

  return (
    <ThemeProvider>
      <AppShell user={authUser} onSignOut={() => signOut(auth)} />
    </ThemeProvider>
  );
}
