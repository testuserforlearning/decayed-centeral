'use client'

import { useEffect, useRef, useState } from 'react'

interface ProxyFrameProps {
  url: string
  onUrlChange?: (url: string) => void
}

export default function ProxyFrame({ url, onUrlChange }: ProxyFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [scramjetLoaded, setScramjetLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/tinyjet/scramjet.all.js'
    script.onload = () => {
      setScramjetLoaded(true)
      console.log('Scramjet loaded successfully')
    }
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (url && iframeRef.current && scramjetLoaded) {
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
            
            const src = scramjet.encodeUrl(fixedUrl)
            console.log('Scramjet encoded URL:', src)
            
            if (iframeRef.current) {
              iframeRef.current.src = src
            }
          }
        } catch (error) {
          console.error('Failed to load proxy:', error)
        }
      }

      loadProxy()
    }
  }, [url, scramjetLoaded])

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-forms allow-popups allow-modals allow-top-navigation allow-same-origin"
      title="Proxy Frame"
    />
  )
}
