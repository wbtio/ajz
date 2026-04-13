/**
 * Shared TypeScript Types and Interfaces for JAZ Project
 * Centralized type definitions to avoid duplication across the codebase
 */

// ============================================
// Form Builder Types
// ============================================

/**
 * Form Field Configuration for Dynamic Forms
 * Used in: Event Registration, Sector Registration, Partner Submissions
 */
export interface FormField {
    id: string
    label_en: string
    label_ar: string
    type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea'
    required: boolean
    options?: string[]
    options_ar?: string[]
    defaultValue?: string
    description_en?: string
    description_ar?: string
    placeholder_en?: string
    placeholder_ar?: string
    width?: 'full' | 'half'
}

// ============================================
// Database Types (Re-export from database.types.ts)
// ============================================

export type { Database, Tables } from './database.types'
