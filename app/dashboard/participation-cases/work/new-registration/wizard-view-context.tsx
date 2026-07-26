'use client'

import { createContext, useContext } from 'react'
import type {
  WizardDeliverySlice,
  WizardDocumentsSlice,
  WizardEventSlice,
  WizardIntakeSlice,
  WizardModel,
  WizardPaymentSlice,
  WizardShellSlice,
  WizardVisaSlice,
} from './wizard-model'

export const WizardViewContext = createContext<WizardModel | null>(null)

function useModel(): WizardModel {
  const model = useContext(WizardViewContext)
  if (!model) throw new Error('Wizard step must be rendered inside WizardViewContext')
  return model
}

/**
 * Domain-scoped accessors. Each step reads only the slices it needs, and the
 * compiler rejects any key the controller does not actually provide.
 */
export const useWizardShell = (): WizardShellSlice => useModel().shell
export const useWizardEvent = (): WizardEventSlice => useModel().event
export const useWizardIntake = (): WizardIntakeSlice => useModel().intake
export const useWizardVisa = (): WizardVisaSlice => useModel().visa
export const useWizardDocuments = (): WizardDocumentsSlice => useModel().documents
export const useWizardPayment = (): WizardPaymentSlice => useModel().payment
export const useWizardDelivery = (): WizardDeliverySlice => useModel().delivery
