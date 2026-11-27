import { createContext, useContext } from 'react'

export const CertifyContext = createContext(null)

export function useCertify() {
  const ctx = useContext(CertifyContext)
  if (!ctx) {
    throw new Error('useCertify must be used inside CertifyProvider')
  }
  return ctx
}
