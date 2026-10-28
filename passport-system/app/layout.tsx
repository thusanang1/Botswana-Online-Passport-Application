import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mathabelo Abbatoirs | Professional Meat Processing in Botswana',
  description: 'Trusted, hygienic and professional abattoir services for farmers, families and businesses across Botswana.',
  generator: 'v0.dev',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
