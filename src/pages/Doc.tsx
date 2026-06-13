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

  return <div className='flex bg-secondary border border-border rounded-xl overflow-hidden'>
      <pre className="p-4 overflow-x-auto text-sm text-muted select-text w-full">
        <code className="font-mono text-sm">{children}</code>
      </pre>
      <button onClick={copyText} className='shrink-0 p-2 bg-secondary border-l-border border-l'>
          {copied ? <Check /> : <Copy />}
      </button>
  </div>
}

const Note: React.FC<HighlightProps> = ({ children }) => (
  <div className="border dark:border-blue-500/40 border-blue-500/60 dark:bg-blue-500/10 bg-blue-500/20 dark:text-blue-400 text-blue-500 rounded-xl p-4">
    <div className="font-semibold mb-2">Note</div>
    <div className="text-sm">{children}</div>
  </div>
)

const Warning: React.FC<HighlightProps> = ({ children }) => (
  <div className="border dark:border-yellow-500/40 border-yellow-500/60 dark:bg-yellow-500/10 bg-yellow-500/20 dark:text-yellow-400 text-yellow-500 rounded-xl p-4">
    <div className="font-semibold mb-2">Warning</div>
    <div className="text-sm">{children}</div>
  </div>
)

export const Doc: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-12">

        <header className="space-y-3">
          <h1 className="text-2xl font-bold">MH Miniapp</h1>
          <p className="text-muted text-md">
            A WebView environment designed for Telegram Mini Apps. Test and develop without tunnels like ngrok or Cloudflare.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="text-muted text-md">
            Simply enter your website URL (HTTP or HTTPS) and make sure your server is running locally or accessible via the internet.
          </p>
          <p className="text-muted">
            Add bots, switch users, and generate valid init data for secure server-side verification.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Supported Features</h2>
          <ul className="list-disc list-inside text-muted space-y-2">
            <li>Theme customization</li>
            <li>Back, Main, Secondary, and Settings buttons</li>
            <li>Biometrics support</li>
            <li>Accelerometer</li>
            <li>And more Telegram Mini App APIs</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Client Setup</h2>

          <div className="space-y-3">
            <p className="text-muted">Add the official Telegram WebApp SDK:</p>
            <CodeBlock text={`<script src="https://telegram.org/js/telegram-web-app.js?59"></script>`}>
{`<script src="https://telegram.org/js/telegram-web-app.js?59"></script>`}
            </CodeBlock>
          </div>

          <div className="space-y-3">
            <p className="text-muted">Optional: Add MH Miniapp extended features:</p>
            <CodeBlock text={`<script src="https://cdn.jsdelivr.net/npm/mh-miniapp@1.0.0/index.js"></script>`}>
            {`<script src="https://cdn.jsdelivr.net/npm/mh-miniapp@1.0.0/index.js"></script>`}
            </CodeBlock>
          </div>

          <Warning>
            Some small features may not be available due to browser limitations or unsupported devices.
          </Warning>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Community & Support</h2>

          <div className="space-y-3">
            <p className="text-muted">
              Get the latest news and feature updates from our Telegram channel:
            </p>
            <CodeBlock text="https://t.me/mhminiapp">
{`https://t.me/mhminiapp`}
            </CodeBlock>
          </div>

          <div className="space-y-3">
            <p className="text-muted">
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
