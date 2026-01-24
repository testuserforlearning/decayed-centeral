'use client'

import { useEffect, useRef, useState } from 'react'

interface ProxyFrameProps {
  url: string
  onUrlChange?: (url: string) => void
}

export default function ProxyFrame({ url, onUrlChange }: ProxyFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [scramjetLoaded, setScramjetLoaded] = useState(false)
  const [bareMuxLoaded, setBareMuxLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/tinyjet/scramjet.all.js'
    script.onload = () => {
      setScramjetLoaded(true)
      console.log('Scramjet loaded successfully')
    }
    document.head.appendChild(script)

    const bareMuxScript = document.createElement('script')
    bareMuxScript.type = 'module'
    bareMuxScript.textContent = `
      import * as BareMux from "https://cdn.jsdelivr.net/npm/@mercuryworkshop/bare-mux/dist/index.mjs";
      window.BareMux = BareMux;
      window.dispatchEvent(new CustomEvent('baremux-loaded'));
    `
    document.head.appendChild(bareMuxScript)

    const handleBareMuxLoaded = () => {
      setBareMuxLoaded(true)
      console.log('BareMux loaded successfully')
    }
    window.addEventListener('baremux-loaded', handleBareMuxLoaded)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      if (bareMuxScript.parentNode) {
        bareMuxScript.parentNode.removeChild(bareMuxScript)
      }
      window.removeEventListener('baremux-loaded', handleBareMuxLoaded)
    }
  }, [])

  useEffect(() => {
    if (url && iframeRef.current && scramjetLoaded && bareMuxLoaded) {
      const loadProxy = async () => {
        try {
          function search(input: string) {
            let template = "https://search.brave.com/search?q=%s"

            try {
              return new URL(input).toString()
            } catch (err) {}

            try {
              let url = new URL(`http://${input}`)
              if (url.hostname.includes(".")) return url.toString()
            } catch (err) {}

            return template.replace("%s", input)
          }

          const fixedUrl = search(url)
          
          if (window.$scramjetLoadController) {
            const { ScramjetController } = window.$scramjetLoadController()
            const scramjet = new ScramjetController({ 
              files: { 
                wasm: "/tinyjet/wasm.wasm", 
                all: "/tinyjet/scramjet.all.js", 
                sync: "/tinyjet/scramjet.sync.js" 
              } 
            })
            
            await scramjet.init()
            
            try {
              await navigator.serviceWorker.register("/sw.js")
            } catch (e) {
              console.error("Service worker registration failed:", e)
            }
            
            const { BareMux } = window
            const connection = new BareMux.BareMuxConnection("/bareworker.js")
            
            await connection.setTransport("https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport/dist/index.mjs", [{ 
              wisp: "wss://petezahgames.com/wisp/" 
            }])
            
            const src = scramjet.encodeUrl(fixedUrl)
            console.log('Scramjet encoded URL:', src)
            
            if (iframeRef.current) {
              iframeRef.current.src = src
            }
          }
        } catch (error) {
          console.error('Failed to load proxy:', error)
          if (iframeRef.current) {
            const fallbackUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`
            iframeRef.current.src = fallbackUrl
            console.log('Using fallback proxy:', fallbackUrl)
          }
        }
      }

      loadProxy()
    }
  }, [url, scramjetLoaded, bareMuxLoaded])

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-forms allow-popups allow-modals allow-top-navigation allow-same-origin"
      title="Proxy Frame"
    />
  )
}
