'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, Globe, Building2, FileText, Shield, Users, X } from 'lucide-react'
import {
  getLinkCategories,
  createLinkCategory,
  updateLinkCategory,
  deleteLinkCategory,
  getCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  getLinks,
  createLink,
  updateLink,
  deleteLink,
} from './actions'

type Tab = 'links' | 'categories' | 'countries'

interface LinkCategory {
  id: string
  title_ar: string
  title_en: string
  description_ar: string | null
  icon: string | null
  color: string | null
  slug: string
  sort_order: number | null
  is_active: boolean | null
}

interface Country {
  id: string
  name_ar: string
  name_en: string
  code: string
  flag_emoji: string | null
  region: string | null
  sort_order: number | null
  is_active: boolean | null
}

interface Link {
  id: string
  category_id: string | null
  country_id: string | null
  title_ar: string
  title_en: string
  description_ar: string | null
  url: string
  link_type: string | null
  organization_type: string | null
  industry: string | null
  home_country: string | null
  sort_order: number | null
  is_active: boolean | null
  is_verified: boolean | null
  category?: { title_ar: string } | null
  country?: { name_ar: string; flag_emoji: string | null } | null
}

const iconOptions = ['Globe', 'Building2', 'FileText', 'Shield', 'Users']
const iconMap: Record<string, any> = { Globe, Building2, FileText, Shield, Users }

import { useTranslation } from '@/lib/i18n/context'

export default function LinksManagementPage() {
  const { t, locale, dir } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('links')
  const [categories, setCategories] = useState<LinkCategory[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [categoriesData, countriesData, linksData] = await Promise.all([
        getLinkCategories(),
        getCountries(),
        getLinks(),
      ])
      setCategories(categoriesData)
      setCountries(countriesData)
      setLinks(linksData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (activeTab === 'categories') {
          if (editingItem) {
            await updateLinkCategory(editingItem.id, formData)
          } else {
            await createLinkCategory(formData)
          }
        } else if (activeTab === 'countries') {
          if (editingItem) {
            await updateCountry(editingItem.id, formData)
          } else {
            await createCountry(formData)
          }
        } else if (activeTab === 'links') {
          if (editingItem) {
            await updateLink(editingItem.id, formData)
          } else {
            await createLink(formData)
          }
        }
        await loadData()
        setIsModalOpen(false)
        setEditingItem(null)
      } catch (error) {
        console.error('Error saving:', error)
        alert(locale === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'An error occurred during saving')
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return

    startTransition(async () => {
      try {
        if (activeTab === 'categories') {
          await deleteLinkCategory(id)
        } else if (activeTab === 'countries') {
          await deleteCountry(id)
        } else if (activeTab === 'links') {
          await deleteLink(id)
        }
        await loadData()
      } catch (error) {
        console.error('Error deleting:', error)
        alert(locale === 'ar' ? 'حدث خطأ أثناء الحذف' : 'An error occurred during deletion')
      }
    })
  }

  const openModal = (item?: any) => {
    setEditingItem(item || null)
    setIsModalOpen(true)
  }

  return (
    <div className="p-6" dir={dir}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {locale === 'ar' ? 'إدارة الروابط المهمة' : 'Important Links Management'}
        </h1>
        <p className="text-gray-600">
          {locale === 'ar' 
            ? 'إدارة الروابط، التصنيفات، والدول' 
            : 'Manage links, categories, and countries'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('links')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'links'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ExternalLink className={`w-5 h-5 inline ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
          {locale === 'ar' ? 'الروابط' : 'Links'} ({links.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'categories'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className={`w-5 h-5 inline ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
          {locale === 'ar' ? 'التصنيفات' : 'Categories'} ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('countries')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'countries'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Globe className={`w-5 h-5 inline ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
          {locale === 'ar' ? 'الدول' : 'Countries'} ({countries.length})
        </button>
      </div>

      {/* Add Button */}
      <button
        onClick={() => openModal()}
        className="mb-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        {locale === 'ar' ? 'إضافة' : 'Add'}{' '}
        {activeTab === 'links' 
          ? (locale === 'ar' ? 'رابط' : 'Link') 
          : activeTab === 'categories' 
            ? (locale === 'ar' ? 'تصنيف' : 'Category') 
            : (locale === 'ar' ? 'دولة' : 'Country')}{' '}
        {locale === 'ar' ? 'جديد' : 'New'}
      </button>

      {/* Links Table */}
      {activeTab === 'links' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'العنوان' : 'Title'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'التصنيف' : 'Category'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الدولة' : 'Country'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الرابط' : 'URL'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{link.title_ar}</div>
                    <div className="text-sm text-gray-500">{link.title_en}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {locale === 'ar' ? (link.category?.title_ar || '-') : (link.category?.title_ar || '-')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {link.country ? (
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{link.country.flag_emoji}</span>
                        {locale === 'ar' ? link.country.name_ar : link.country.name_ar}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {locale === 'ar' ? 'زيارة' : 'Visit'}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        link.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {link.is_active 
                        ? (locale === 'ar' ? 'نشط' : 'Active') 
                        : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(link)}
                        className="text-blue-600 hover:text-blue-800"
                        title={t.common.edit}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-red-600 hover:text-red-800"
                        title={t.common.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories Table */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'العنوان' : 'Title'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>Slug</th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الأيقونة' : 'Icon'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الترتيب' : 'Order'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => {
                const Icon = iconMap[category.icon || 'Globe'] || Globe
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{category.title_ar}</div>
                      <div className="text-sm text-gray-500">{category.title_en}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{category.slug}</td>
                    <td className="px-6 py-4">
                      <Icon className="w-5 h-5" style={{ color: category.color || '#3B82F6' }} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{category.sort_order}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.is_active 
                          ? (locale === 'ar' ? 'نشط' : 'Active') 
                          : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(category)}
                          className="text-blue-600 hover:text-blue-800"
                          title={t.common.edit}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-800"
                          title={t.common.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Countries Table */}
      {activeTab === 'countries' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الاسم' : 'Name'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الكود' : 'Code'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'العلم' : 'Flag'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'المنطقة' : 'Region'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الترتيب' : 'Order'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className={`px-6 py-3 text-${locale === 'ar' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase`}>
                  {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {countries.map((country) => (
                <tr key={country.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{country.name_ar}</div>
                    <div className="text-sm text-gray-500">{country.name_en}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{country.code}</td>
                  <td className="px-6 py-4 text-2xl">{country.flag_emoji}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{country.region || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{country.sort_order}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        country.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {country.is_active 
                        ? (locale === 'ar' ? 'نشط' : 'Active') 
                        : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(country)}
                        className="text-blue-600 hover:text-blue-800"
                        title={t.common.edit}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(country.id)}
                        className="text-red-600 hover:text-red-800"
                        title={t.common.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingItem ? (locale === 'ar' ? 'تعديل' : 'Edit') : (locale === 'ar' ? 'إضافة' : 'Add')}{' '}
                  {activeTab === 'links' 
                    ? (locale === 'ar' ? 'رابط' : 'Link') 
                    : activeTab === 'categories' 
                      ? (locale === 'ar' ? 'تصنيف' : 'Category') 
                      : (locale === 'ar' ? 'دولة' : 'Country')}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingItem(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'categories' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'العنوان بالعربية *' : 'Title in Arabic *'}
                      </label>
                      <input
                        type="text"
                        name="title_ar"
                        defaultValue={editingItem?.title_ar}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'العنوان بالإنجليزية *' : 'Title in English *'}
                      </label>
                      <input
                        type="text"
                        name="title_en"
                        defaultValue={editingItem?.title_en}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                      <input
                        type="text"
                        name="slug"
                        defaultValue={editingItem?.slug}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'الأيقونة' : 'Icon'}
                      </label>
                      <select
                        name="icon"
                        defaultValue={editingItem?.icon || 'Globe'}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'اللون' : 'Color'}
                      </label>
                      <input
                        type="color"
                        name="color"
                        defaultValue={editingItem?.color || '#3B82F6'}
                        className="w-full h-12 px-2 py-1 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'الترتيب' : 'Order'}
                      </label>
                      <input
                        type="number"
                        name="sort_order"
                        defaultValue={editingItem?.sort_order || 0}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_active"
                        value="true"
                        defaultChecked={editingItem?.is_active ?? true}
                        className="w-4 h-4"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        {locale === 'ar' ? 'نشط' : 'Active'}
                      </label>
                    </div>
                  </>
                )}

                {activeTab === 'countries' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'الاسم بالعربية *' : 'Name in Arabic *'}
                      </label>
                      <input
                        type="text"
                        name="name_ar"
                        defaultValue={editingItem?.name_ar}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'الاسم بالإنجليزية *' : 'Name in English *'}
                      </label>
                      <input
                        type="text"
                        name="name_en"
                        defaultValue={editingItem?.name_en}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'كود الدولة (ISO) *' : 'Country Code (ISO) *'}
                      </label>
                      <input
                        type="text"
                        name="code"
                        defaultValue={editingItem?.code}
                        required
                        maxLength={2}
                        placeholder="IQ"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'العلم (Emoji)' : 'Flag (Emoji)'}
                      </label>
                      <input
                        type="text"
                        name="flag_emoji"
                        defaultValue={editingItem?.flag_emoji}
                        placeholder="🇮🇶"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'المنطقة' : 'Region'}
                      </label>
                      <select
                        name="region"
                        defaultValue={editingItem?.region || ''}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{locale === 'ar' ? 'اختر المنطقة' : 'Select Region'}</option>
                        <option value="middle_east">{locale === 'ar' ? 'الشرق الأوسط' : 'Middle East'}</option>
                        <option value="europe">{locale === 'ar' ? 'أوروبا' : 'Europe'}</option>
                        <option value="asia">{locale === 'ar' ? 'آسيا' : 'Asia'}</option>
                        <option value="americas">{locale === 'ar' ? 'الأمريكتين' : 'Americas'}</option>
                        <option value="africa">{locale === 'ar' ? 'أفريقيا' : 'Africa'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'الترتيب' : 'Order'}
                      </label>
                      <input
                        type="number"
                        name="sort_order"
                        defaultValue={editingItem?.sort_order || 0}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_active"
                        value="true"
                        defaultChecked={editingItem?.is_active ?? true}
                        className="w-4 h-4"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        {locale === 'ar' ? 'نشط' : 'Active'}
                      </label>
                    </div>
                  </>
                )}

                {activeTab === 'links' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'العنوان بالعربية *' : 'Title in Arabic *'}
                      </label>
                      <input
                        type="text"
                        name="title_ar"
                        defaultValue={editingItem?.title_ar}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'العنوان بالإنجليزية *' : 'Title in English *'}
                      </label>
                      <input
                        type="text"
                        name="title_en"
                        defaultValue={editingItem?.title_en}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'الرابط *' : 'URL *'}
                      </label>
                      <input
                        type="url"
                        name="url"
                        defaultValue={editingItem?.url}
                        required
                        placeholder="https://example.com"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'التصنيف' : 'Category'}
                      </label>
                      <select
                        name="category_id"
                        defaultValue={editingItem?.category_id || ''}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{locale === 'ar' ? 'بدون تصنيف' : 'No Category'}</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {locale === 'ar' ? cat.title_ar : cat.title_en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'الدولة' : 'Country'}
                      </label>
                      <select
                        name="country_id"
                        defaultValue={editingItem?.country_id || ''}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{locale === 'ar' ? 'بدون دولة' : 'No Country'}</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.flag_emoji} {locale === 'ar' ? country.name_ar : country.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'القطاع' : 'Industry'}
                      </label>
                      <input
                        type="text"
                        name="industry"
                        defaultValue={editingItem?.industry}
                        placeholder="oil, banking, construction..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ar' ? 'الترتيب' : 'Order'}
                      </label>
                      <input
                        type="number"
                        name="sort_order"
                        defaultValue={editingItem?.sort_order || 0}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_active"
                          value="true"
                          defaultChecked={editingItem?.is_active ?? true}
                          className="w-4 h-4"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          {locale === 'ar' ? 'نشط' : 'Active'}
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_verified"
                          value="true"
                          defaultChecked={editingItem?.is_verified ?? false}
                          className="w-4 h-4"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          {locale === 'ar' ? 'موثق' : 'Verified'}
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isPending ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ' : 'Save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setEditingItem(null)
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
