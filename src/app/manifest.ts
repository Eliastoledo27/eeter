import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ÉTER Store Oficial | Calzado Urbano & Sneakers',
    short_name: 'ÉTER Store',
    description: 'Tienda oficial de calzado urbano y sneakers importados de Brasil en Mar del Plata. ÉTER Store / Éter Calzados.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
