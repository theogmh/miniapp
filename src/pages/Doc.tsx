import React, { useState } from "react"
import {Copy, Check} from 'lucide-react'

type HighlightProps = {
  children: React.ReactNode
}

interface HighlightPropsCB extends HighlightProps {
  children: React.ReactNode
  text: string
}

const CodeBlock: React.FC<HighlightPropsCB> = ({ children, text }) => {
   const [copied, setCopied] = useState<boolean>(false)
   
   const copyText = (): void => {
       if (copied) return
       navigator.clipboard?.writeText?.(text)
       setCopied(true)
       setTimeout(() => {
           setCopied(false)
       }, 2000)
   }

  return <div className='flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden'>
      <pre className="p-4 overflow-x-auto text-sm text-zinc-200 select-text w-full">
        <code className="font-mono text-sm">{children}</code>
      </pre>
      <button onClick={copyText} className='shrink-0 p-2 bg-[#333]'>
          {copied ? <Check /> : <Copy />}
      </button>
  </div>
}

const Note: React.FC<HighlightProps> = ({ children }) => (
  <div className="border border-blue-500/40 bg-blue-500/10 text-blue-400 rounded-xl p-4">
    <div className="font-semibold mb-2">Note</div>
    <div className="text-sm">{children}</div>
  </div>
)

const Warning: React.FC<HighlightProps> = ({ children }) => (
  <div className="border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 rounded-xl p-4">
    <div className="font-semibold mb-2">Warning</div>
    <div className="text-sm">{children}</div>
  </div>
)

export const Doc: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-zinc-200 px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-12">

        <header className="space-y-3">
          <h1 className="text-2xl font-bold text-white">MH Miniapp</h1>
          <p className="text-zinc-400 text-md">
            A WebView environment designed for Telegram Mini Apps. Test and develop without tunnels like ngrok or Cloudflare.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Overview</h2>
          <p className="text-zinc-400 text-md">
            Simply enter your website URL (HTTP or HTTPS) and make sure your server is running locally or accessible via the internet.
          </p>
          <p className="text-zinc-400">
            Add bots, switch users, and generate valid init data for secure server-side verification.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Supported Features</h2>
          <ul className="list-disc list-inside text-zinc-400 space-y-2">
            <li>Theme customization</li>
            <li>Back, Main, Secondary, and Settings buttons</li>
            <li>Biometrics support</li>
            <li>Accelerometer</li>
            <li>And more Telegram Mini App APIs</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Client Setup</h2>

          <div className="space-y-3">
            <p className="text-zinc-400">Add the official Telegram WebApp SDK:</p>
            <CodeBlock text={`<script src="https://telegram.org/js/telegram-web-app.js?59"></script>`}>
{`<script src="https://telegram.org/js/telegram-web-app.js?59"></script>`}
            </CodeBlock>
          </div>

          <div className="space-y-3">
            <p className="text-zinc-400">Optional: Add MH Miniapp extended features:</p>
            <CodeBlock text={`<script src="https://cdn.jsdelivr.net/npm/mh-miniapp@1.0.0/index.js"></script>`}>
            {`<script src="https://cdn.jsdelivr.net/npm/mh-miniapp@1.0.0/index.js"></script>`}
            </CodeBlock>
          </div>

          <Warning>
            Some small features may not be available due to browser limitations or unsupported devices.
          </Warning>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Community & Support</h2>

          <div className="space-y-3">
            <p className="text-zinc-400">
              Get the latest news and feature updates from our Telegram channel:
            </p>
            <CodeBlock text="https://t.me/mhminiapp">
{`https://t.me/mhminiapp`}
            </CodeBlock>
          </div>

          <div className="space-y-3">
            <p className="text-zinc-400">
              Found a bug or want early access to the source code?
            </p>
            <CodeBlock text='@cfgxmh'>
{`Telegram: @cfgxmh`}
            </CodeBlock>
          </div>

          <Note>
            The source code will be published soon on GitHub.
          </Note>
        </section>

      </div>
    </div>
  )
}