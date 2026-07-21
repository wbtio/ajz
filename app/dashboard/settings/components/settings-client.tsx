'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Facebook, Twitter, Instagram, Linkedin, Save, Loader2 } from 'lucide-react'

const STORAGE_KEY = 'jaz-settings-social-links'

export function SettingsClient() {
  const [links, setLinks] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
  })
  const [loading, setLoading] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setLinks(JSON.parse(stored))
      } else {
        // Default fallbacks matching the footer
        setLinks({
          facebook: 'https://www.facebook.com/ZointAnnualZone/',
          twitter: 'https://x.com',
          instagram: 'https://www.instagram.com/joint.annual.zone',
          linkedin: 'https://www.linkedin.com/company/jazcompany/',
        })
      }
    } catch (e) {
      console.error('Error loading settings:', e)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLinks((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate saving process
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
        toast.success('إعدادات روابط التواصل الاجتماعي تم حفظها بنجاح!', {
          description: 'Social links have been saved successfully.',
        })
      } catch (err) {
        console.error(err)
        toast.error('فشل في حفظ الإعدادات.')
      } finally {
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-left" dir="ltr" lang="en">
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-50 pb-4">
          <CardTitle className="text-lg font-bold text-slate-800">Social Media Links</CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Configure the default social media links displayed across the platform headers, footers, and contact templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Facebook Link */}
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook Page URL
                </Label>
                <Input
                  id="facebook"
                  name="facebook"
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={links.facebook}
                  onChange={handleChange}
                  className="text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Twitter Link */}
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-sky-500" />
                  Twitter / X URL
                </Label>
                <Input
                  id="twitter"
                  name="twitter"
                  type="url"
                  placeholder="https://x.com/..."
                  value={links.twitter}
                  onChange={handleChange}
                  className="text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Instagram Link */}
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram URL
                </Label>
                <Input
                  id="instagram"
                  name="instagram"
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={links.instagram}
                  onChange={handleChange}
                  className="text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* LinkedIn Link */}
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  LinkedIn Page URL
                </Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/company/..."
                  value={links.linkedin}
                  onChange={handleChange}
                  className="text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Links
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
