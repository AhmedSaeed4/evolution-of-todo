'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

export default function ChatBotPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Auth protection - redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Check if ChatKit web component is available
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if already defined
    if (customElements.get('openai-chatkit')) {
      setIsReady(true)
      return
    }

    // Wait for it to be defined (script is loaded in layout.tsx)
    customElements.whenDefined('openai-chatkit')
      .then(() => {
        if (process.env.NODE_ENV === 'development') console.log('✅ ChatKit web component ready')
        setIsReady(true)
      })
      .catch((err) => {
        console.error('❌ ChatKit failed to load:', err)
        setError('ChatKit failed to load. Please refresh the page.')
      })

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!customElements.get('openai-chatkit')) {
        setError('ChatKit took too long to load. Please check your connection and refresh.')
      }
    }, 15000)

    return () => clearTimeout(timeout)
  }, [])

  // Use the url/domainKey pattern per official ChatKit documentation
  // ChatKitServer on the backend handles all requests through the single /api/chatkit endpoint
  const { control } = useChatKit({
    api: {
      url: '/api/chatkit',
      domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || 'local-dev',
    },
    theme: {
      colorScheme: 'light',
      color: {
        grayscale: { hue: 220, tint: 6, shade: -1 },
        accent: { primary: '#FF6B4A', level: 1 },
        surface: {
          background: '#F9F7F2', // Cream background matching our design
          foreground: '#faf9f8ff', // Espresso text color
        },
      },
      radius: 'round',
    },
    startScreen: {
      greeting: 'Hello! How can I help you with your tasks?',
      prompts: [
        { label: 'Create a new task', prompt: 'Create a task for buying groceries' },
        { label: 'List my tasks', prompt: 'Show me all my current tasks' },
        { label: 'Help me understand', prompt: 'Help me understand what I can do' },
      ],
    },
    composer: {
      placeholder: 'Ask me to create, list, or manage your tasks...',
    },
    onError: ({ error: chatError }) => {
      console.error('ChatKit error:', chatError)
      setError(`Chat error: ${chatError.message || String(chatError)}`)
    },
    onReady: () => {
      if (process.env.NODE_ENV === 'development') console.log('✅ ChatKit is ready')
    },
  })

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F9F7F2] z-50">
        <div className="bg-[#F0EBE0] border border-[#2A1B12]/10 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
          <h2 className="font-serif text-2xl text-[#2A1B12] mb-3">Checking Authentication</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-[#5C4D45] mb-6 opacity-70">
            SECURE ACCESS VALIDATION
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Loader2 className="w-6 h-6 text-[#FF6B4A] animate-spin" />
              <div className="absolute inset-0 w-6 h-6 border-2 border-[#FF6B4A]/20 rounded-full animate-ping" />
            </div>
            <span className="font-mono text-sm text-[#5C4D45]">Validating session...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F9F7F2] z-50">
        <div className="bg-[#F0EBE0] border border-[#2A1B12]/10 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
          <h2 className="font-serif text-2xl text-[#2A1B12] mb-3">System Error</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-[#5C4D45] mb-6 opacity-70">
            CHATKIT INITIALIZATION FAILED
          </p>
          <p className="text-[#5C4D45] mb-6 font-sans text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => {
              setError(null)
              window.location.reload()
            }}
            className="w-full px-6 py-3 bg-[#FF6B4A] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#E55A3D] transition-colors border border-[#E55A3D]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F9F7F2] z-50">
        <div className="bg-[#F0EBE0] border border-[#2A1B12]/10 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
          <h2 className="font-serif text-2xl text-[#2A1B12] mb-3">Initializing ChatKit</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-[#5C4D45] mb-6 opacity-70">
            LOADING INTERFACE COMPONENTS
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Loader2 className="w-6 h-6 text-[#FF6B4A] animate-spin" />
              <div className="absolute inset-0 w-6 h-6 border-2 border-[#FF6B4A]/20 rounded-full animate-ping" />
            </div>
            <span className="font-mono text-sm text-[#5C4D45]">Loading interface...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#F9F7F2]">
      <Navbar />
      <main className="flex-1 relative max-w-5xl mx-auto w-full px-4">
        <ChatKit
          control={control}
          style={{
            width: '100%',
            height: '100%',
            minHeight: 'calc(100vh - 64px)' // Subtract navbar height
          }}
        />
      </main>
    </div>
  )
}