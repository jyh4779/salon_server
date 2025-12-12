import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import 'antd/dist/reset.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ConfigProvider locale={koKR}>
                <App />
            </ConfigProvider>
        </QueryClientProvider>
    </React.StrictMode>,
)
