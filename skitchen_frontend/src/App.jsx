import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store/index';
import { setUser } from './store/userSlice';
import { router } from './routes/index';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import { logout } from './services/authService';

const AppInner = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id) {
          dispatch(setUser(parsed));
        }
      }
    } catch (e) {
      // ignore corrupted localStorage
    }
  }, [dispatch]);

  useEffect(() => {
    let timerId;
    const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

    const resetTimer = () => {
      if (timerId) clearTimeout(timerId);

      const token = localStorage.getItem('token');
      if (!token) return;

      timerId = setTimeout(() => {
        logout('inactive');
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'focus'];
    events.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    resetTimer();

    return () => {
      if (timerId) clearTimeout(timerId);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider
        router={router}
        fallbackElement={<div>Loading...</div>}
      />
    </ErrorBoundary>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}

export default App;
