'use client'

const TOKEN_KEY = 'customer_token'

function generateToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `ct-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getOrCreateCustomerToken(): string {
  const existingToken = localStorage.getItem(TOKEN_KEY)
  if (existingToken) {
    return existingToken
  }

  const token = generateToken()
  localStorage.setItem(TOKEN_KEY, token)
  return token
}
