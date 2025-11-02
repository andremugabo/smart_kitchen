import { useState } from 'react';
import { store } from './store/index';
import { Provider } from 'react-redux';
import { router } from './routes/index'
import './App.css'
import { RouterProvider } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Provider store={store}>
      <RouterProvider
        router={router}
        fallbackElement={
          <div>
            Loading...
          </div>
        }
      />
    </Provider>
  )
}

export default App
