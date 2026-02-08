'use server'

import { cookies } from 'next/headers'

export async function bypassLogin() {
  // Pure cookie bypass, avoiding Supabase calls completely to prevent rate limits
  cookies().set('eter_dev_session', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })

  // Also set a public cookie for client-side stores
  cookies().set('eter_dev_mode', 'true', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })

  return { success: true }
}

export async function logoutAction() {
  cookies().delete('eter_dev_session')
  cookies().delete('eter_dev_mode')
  return { success: true }
}
