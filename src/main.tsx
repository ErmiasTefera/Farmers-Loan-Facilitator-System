import './index.css'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './router'
import './lib/localization/i18n'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/core/api/queryClient'
import { useAuthStore } from '@/core/store/authStore'

// Initialize auth on app start
const initializeApp = async () => {
  try {
    await useAuthStore.getState().initializeAuth();
  } catch (error) {
    console.error('Failed to initialize auth:', error);
  }
};

// Initialize auth before rendering
initializeApp();

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement)
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<AppRouter />
			</QueryClientProvider>
		</StrictMode>,
	)
}