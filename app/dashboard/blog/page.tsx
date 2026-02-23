'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  BookOpen,
  FileText,
  CheckCircle2,
  BarChart3,
  Image as ImageIcon,
  Inbox
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getPosts, deletePost } from './actions'
import { BlogForm } from './components/blog-form-enhanced'
import type { Tables } from '@/lib/database.types'
import { formatDate } from '@/lib/utils'

type Post = Tables<'posts'> & {
  author?: { full_name: string | null; email: string }
}

export default function BlogDashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, statusFilter])

  const loadPosts = async () => {
    setLoading(true)
    const { data, error } = await getPosts()
    if (data) {
      setPosts(data as Post[])
    }
    setLoading(false)
  }

  const filterPosts = () => {
    let filtered = [...posts]

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.title_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((post) => post.status === statusFilter)
    }

    setFilteredPosts(filtered)
  }

  const handleCreate = () => {
    setSelectedPost(null)
    setIsModalOpen(true)
  }

  const handleEdit = (post: Post) => {
    setSelectedPost(post)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const { error } = await deletePost(id)
    if (!error) {
      await loadPosts()
      setDeleteConfirmId(null)
    }
  }

  const handleModalClose = async (shouldRefresh?: boolean) => {
    setIsModalOpen(false)
    setSelectedPost(null)
    if (shouldRefresh) {
      await loadPosts()
    }
  }

  const getStatusBadge = (status: string | null) => {
    const styles = {
      published: 'bg-green-50 text-green-700 border-green-200',
      draft: 'bg-gray-50 text-gray-700 border-gray-200',
    }
    return styles[status as keyof typeof styles] || styles.draft
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">إدارة المدونة</h1>
          <p className="text-gray-500">لوحة التحكم بالمقالات والمحتوى</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="font-semibold">مقال جديد</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              إجمالي المقالات
            </CardTitle>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              منشور
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter((p) => p.status === 'published').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              مسودة
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter((p) => p.status === 'draft').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              إجمالي المشاهدات
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.reduce((sum, p) => sum + (p.views_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="البحث في المقالات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 h-10"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('all')}
            size="sm"
            className="rounded-lg"
          >
            الكل
          </Button>
          <Button
            variant={statusFilter === 'published' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('published')}
            size="sm"
            className="rounded-lg"
          >
            منشور
          </Button>
          <Button
            variant={statusFilter === 'draft' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('draft')}
            size="sm"
            className="rounded-lg"
          >
            مسودة
          </Button>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-gray-500 font-medium">جاري التحميل...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-16 text-center">
            <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مقالات</h3>
            <p className="text-gray-500 mb-6">لم يتم العثور على أي مقالات تطابق بحثك</p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              إنشاء مقال جديد
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="px-6 py-4 text-right font-medium">العنوان</th>
                  <th className="px-6 py-4 text-right font-medium">التصنيف</th>
                  <th className="px-6 py-4 text-right font-medium">الحالة</th>
                  <th className="px-6 py-4 text-right font-medium">المشاهدات</th>
                  <th className="px-6 py-4 text-right font-medium">التاريخ</th>
                  <th className="px-6 py-4 text-right font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {post.featured_image_url ? (
                          <img
                            src={post.featured_image_url}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <div className="font-medium text-gray-900 line-clamp-1">
                            {post.title_ar || post.title}
                          </div>
                          <div className="text-gray-500 line-clamp-1 text-xs mt-1">
                            {post.excerpt_ar || post.excerpt || 'لا يوجد وصف'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {post.category || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusBadge(
                          post.status
                        )}`}
                      >
                        {post.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span>{post.views_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {post.created_at ? formatDate(post.created_at) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(post)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Button>
                        {deleteConfirmId === post.id ? (
                          <div className="flex gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(post.id)}
                            >
                              تأكيد
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              إلغاء
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(post.id)}
                            className="h-8 w-8 hover:text-red-600 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blog Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={() => handleModalClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPost ? 'تعديل المقال' : 'مقال جديد'}
            </DialogTitle>
            <DialogDescription>
              {selectedPost
                ? 'قم بتعديل بيانات المقال'
                : 'أضف مقال جديد إلى المدونة'}
            </DialogDescription>
          </DialogHeader>
          <BlogForm post={selectedPost} onClose={handleModalClose} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
