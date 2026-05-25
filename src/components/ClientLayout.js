'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Spinner from './Spinner'
import Navbar from './Navbar'
import SocialSidebar from './SocialSidebar'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ClientLayout({ children }) {
  const [isReady, setIsReady] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false

    const finishLoading = () => {
      if (!cancelled) {
        setIsReady(true)
      }
    }

    // Prevent an infinite loading state if the logo is missing or slow.
    // bloque par cache/proxy, or renvoie une erreur, le site continue.
    const fallbackTimer = setTimeout(finishLoading, 1200)

    const img = new Image()
    img.onload = () => {
      clearTimeout(fallbackTimer)
      finishLoading()
    }
    img.onerror = () => {
      clearTimeout(fallbackTimer)
      finishLoading()
    }
    img.src = '/newlogo.png'

    return () => {
      cancelled = true
      clearTimeout(fallbackTimer)
      img.onload = null
      img.onerror = null
    }
  }, [])

  if (!isReady) {
    return <Spinner />
  }

  return (
    <>
      <Navbar />
      {pathname !== '/profile' && 
      pathname !== '/transactions/gcash' && 
      pathname !== '/transactions/paypal' && 
      pathname !== '/transactions/votelogs' 
      }
      <ToastContainer position="top-center" theme="dark" autoClose={3000} />
      <main>{children}</main>
    </>
  )
}
