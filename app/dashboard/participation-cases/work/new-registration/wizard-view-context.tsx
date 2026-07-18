'use client'

import { createContext, useContext } from 'react'

type WizardViewModel = Record<string, unknown>

export const WizardViewContext = createContext<WizardViewModel | null>(null)

export function useWizardView(): WizardViewModel {
  const model = useContext(WizardViewContext)
  if (!model) throw new Error('Wizard step must be rendered inside WizardViewContext')
  return model
}
