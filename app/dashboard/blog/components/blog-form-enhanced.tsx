'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPost, updatePost } from '../actions'
import type { Tables } from '@/lib/database.types'
import {
  FileText,
  PenTool,
  Search,
  Image as ImageIcon,
  Tag,
  Save,
  Send,
  X,
  Info,
  Type,
  Link as LinkIcon,
  Globe
} from 'lucide-react'

type Post = Tables<'posts'>

interface BlogFormProps {
  post: Post | null
  onClose: (shouldRefresh?: boolean) => void
}

const CATEGORIES = [
  { value: 'news', label: 'أخبار' },
  { value: 'tutorial', label: 'دروس تعليمية' },
  { value: 'announcement', label: 'إعلانات' },
  { value: 'event', label: 'فعاليات' },
  { value: 'article', label: 'مقالات' },
]

export function BlogForm({ post, onClose }: BlogFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    slug: '',
    content: '',
    content_ar: '',
    excerpt: '',
    excerpt_ar: '',
    category: '',
    featured_image_url: '',
    seo_title: '',
    seo_description: '',
    keywords: [] as string[],
    status: 'draft',
  })
  const [keywordInput, setKeywordInput] = useState('')

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        title_ar: post.title_ar || '',
        slug: post.slug || '',
        content: post.content || '',
        content_ar: post.content_ar || '',
        excerpt: post.excerpt || '',
        excerpt_ar: post.excerpt_ar || '',
        category: post.category || '',
        featured_image_url: post.featured_image_url || '',
        seo_title: post.seo_title || '',
        seo_description: post.seo_description || '',
        keywords: post.keywords || [],
        status: post.status || 'draft',
      })
    }
  }, [post])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }))
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }))
  }

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.title_ar && !formData.title) {
      alert('يرجى إدخال عنوان المقال')
      return
    }

    setLoading(true)

    const readingTime = formData.content_ar
      ? calculateReadingTime(formData.content_ar)
      : formData.content
        ? calculateReadingTime(formData.content)
        : undefined

    const postData = {
      ...formData,
      title: formData.title || formData.title_ar,
      status,
      reading_time: readingTime,
    }

    const result = post
      ? await updatePost(post.id, postData)
      : await createPost(postData)

    setLoading(false)

    if (result.error) {
      alert(`خطأ: ${result.error}`)
    } else {
      onClose(true)
    }
  }

  return (
    <div className="space-y-8 max-h-[75vh] overflow-y-auto px-1">
      {/* Basic Info Section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 border-b pb-2">
          <FileText className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-lg text-gray-900">المعلومات الأساسية</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title_ar" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              العنوان (عربي) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title_ar"
              name="title_ar"
              value={formData.title_ar}
              onChange={handleChange}
              placeholder="عنوان المقال بالعربية"
              className="h-10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">العنوان (إنجليزي)</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Post title in English"
              className="h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-gray-700">الرابط (Slug)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="post-url-slug"
                dir="ltr"
                className="pl-9 h-10"
              />
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Info className="w-3 h-3" /> اتركه فارغاً للإنشاء التلقائي
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">التصنيف</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-950 bg-white text-sm"
            >
              <option value="">اختر التصنيف</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured_image_url" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500" /> رابط الصورة البارزة
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="featured_image_url"
              name="featured_image_url"
              value={formData.featured_image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              dir="ltr"
              className="pl-9 h-10"
            />
          </div>
          {formData.featured_image_url && (
            <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
              <img
                src={formData.featured_image_url}
                alt="Preview"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 border-b pb-2">
          <PenTool className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-lg text-gray-900">المحتوى</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt_ar" className="text-sm font-medium text-gray-700">المقتطف (عربي)</Label>
          <Textarea
            id="excerpt_ar"
            name="excerpt_ar"
            value={formData.excerpt_ar}
            onChange={handleChange}
            placeholder="وصف مختصر للمقال بالعربية (يظهر في البطاقات)"
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-sm font-medium text-gray-700">المقتطف (إنجليزي)</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Short description in English..."
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_ar" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            المحتوى الكامل (عربي) <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="content_ar"
            name="content_ar"
            value={formData.content_ar}
            onChange={handleChange}
            placeholder="اكتب محتوى المقال بالعربية..."
            rows={10}
            className="resize-none"
            required
          />
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Type className="w-3 h-3" /> {formData.content_ar.trim().split(/\s+/).filter(w => w).length} كلمة
            </span>
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3" /> ~{calculateReadingTime(formData.content_ar || 'word')} دقيقة قراءة
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium text-gray-700">المحتوى (إنجليزي)</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write post content in English..."
            rows={8}
            className="resize-none"
          />
        </div>
      </section>

      {/* SEO Section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 border-b pb-2">
          <Search className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-lg text-gray-900">إعدادات السيو (SEO)</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_title" className="text-sm font-medium text-gray-700">عنوان السيو</Label>
          <Input
            id="seo_title"
            name="seo_title"
            value={formData.seo_title}
            onChange={handleChange}
            placeholder="عنوان محسّن لمحركات البحث (60 حرف)"
            maxLength={60}
            className="h-10"
          />
          <div className="flex items-center justify-between mt-1">
            <p className={`text-xs ${formData.seo_title.length > 55 ? 'text-red-500' : 'text-gray-500'
              }`}>
              {formData.seo_title.length}/60
            </p>
            <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${formData.seo_title.length > 55 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                style={{ width: `${(formData.seo_title.length / 60) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_description" className="text-sm font-medium text-gray-700">وصف السيو</Label>
          <Textarea
            id="seo_description"
            name="seo_description"
            value={formData.seo_description}
            onChange={handleChange}
            placeholder="وصف محسّن لمحركات البحث (160 حرف)"
            rows={4}
            maxLength={160}
            className="resize-none"
          />
          <div className="flex items-center justify-between mt-1">
            <p className={`text-xs ${formData.seo_description.length > 150 ? 'text-red-500' : 'text-gray-500'
              }`}>
              {formData.seo_description.length}/160
            </p>
            <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${formData.seo_description.length > 150 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                style={{ width: `${(formData.seo_description.length / 160) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="keywords" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" /> الكلمات المفتاحية
          </Label>
          <div className="flex gap-2">
            <Input
              id="keywords"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddKeyword()
                }
              }}
              placeholder="أضف كلمة مفتاحية واضغط Enter"
              className="h-10"
            />
            <Button
              type="button"
              onClick={handleAddKeyword}
              variant="outline"
              className="h-10 px-4"
            >
              إضافة
            </Button>
          </div>
          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="hover:text-red-500 transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white pb-2">
        <Button variant="outline" onClick={() => onClose()} disabled={loading}>
          إلغاء
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSubmit('draft')}
          disabled={loading}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          حفظ كمسودة
        </Button>
        <Button
          onClick={() => handleSubmit('published')}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            'جاري النشر...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              نشر المقال
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
