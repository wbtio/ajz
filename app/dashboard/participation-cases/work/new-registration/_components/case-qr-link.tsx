"use client"

import { useState } from "react"
import { Copy, Check, QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export function CaseQrLink({ registrationId }: { registrationId: string }) {
  const [copied, setCopied] = useState(false)
  const href = typeof window === "undefined" ? `/dashboard/participation-cases/${registrationId}` : `${window.location.origin}/dashboard/participation-cases/${registrationId}`

  async function copyLink() {
    await navigator.clipboard.writeText(href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5 border-l border-slate-100 px-2 py-1">
      <div className="rounded border border-slate-200 bg-white p-0.5" title="Scan to open this case">
        <QRCodeSVG value={href} size={30} level="M" includeMargin={false} aria-label="QR code for this case" />
      </div>
      <div className="hidden min-w-0 sm:block">
        <span className="flex items-center gap-1 text-[8px] font-medium uppercase tracking-wide text-slate-400"><QrCode className="size-2.5" />Direct link</span>
        <button type="button" onClick={copyLink} className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-[#8B0000] hover:underline">
          {copied ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}
