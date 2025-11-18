import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store/index';
import { setUser } from './store/userSlice';
import { router } from './routes/index';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

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
