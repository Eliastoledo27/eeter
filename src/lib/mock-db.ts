import { Product } from '@/types';

const STORAGE_KEY = 'eter_products';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Nike Air Max 90 Terrascape',
    description: 'Diseño sostenible con materiales reciclados y la clásica amortiguación Air.',
    category: 'Zapatillas',
    basePrice: 180,
    images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=600'],
    stockBySize: { '40': 5, '41': 8, '42': 10, '43': 3 },
    totalStock: 26,
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: 'prod-2',
    name: 'Adidas Ultraboost Light',
    description: 'La Ultraboost más ligera hasta la fecha, con retorno de energía épico.',
    category: 'Running',
    basePrice: 200,
    images: ['https://images.unsplash.com/photo-1587563871167-1ee797455c32?auto=format&fit=crop&q=80&w=600'],
    stockBySize: { '39': 2, '40': 5, '42': 12 },
    totalStock: 19,
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: 'prod-3',
    name: 'Sony WH-1000XM5',
    description: 'Cancelación de ruido líder en la industria y sonido premium.',
    category: 'Tecnología',
    basePrice: 350,
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600'],
    stockBySize: { 'Unique': 15 },
    totalStock: 15,
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: 'prod-4',
    name: 'MacBook Air M2',
    description: 'Superpotenciado por el chip M2. Diseño rediseñado y batería para todo el día.',
    category: 'Tecnología',
    basePrice: 1199,
    images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=600'],
    stockBySize: { 'Unique': 5 },
    totalStock: 5,
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: 'prod-5',
    name: 'Puma RS-X Geek',
    description: 'Silueta retro-futurista con colores vibrantes y comodidad extrema.',
    category: 'Zapatillas',
    basePrice: 110,
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600'],
    stockBySize: { '40': 10, '41': 10, '42': 10 },
    totalStock: 30,
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: 'prod-6',
    name: 'Apple Watch Ultra',
    description: 'El reloj más robusto y capaz. Diseñado para la aventura y la resistencia.',
    category: 'Tecnología',
    basePrice: 799,
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600'],
    stockBySize: { 'Unique': 8 },
    totalStock: 8,
    status: 'active',
    createdAt: new Date(),
  }
];

class MockDB {
  private static instance: MockDB;
  private isInitialized = false;

  private constructor() { }

  public static getInstance(): MockDB {
    if (!MockDB.instance) {
      MockDB.instance = new MockDB();
    }
    return MockDB.instance;
  }

  // Initialize DB in localStorage if empty
  public init(): void {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    this.isInitialized = true;
  }

  public getProducts(): Product[] {
    if (typeof window === 'undefined') return [];
    if (!this.isInitialized) this.init();

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  public saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);

    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }

    this.persist(products);
  }

  public deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.persist(products);
  }

  private persist(products: Product[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    // Dispatch event for cross-tab/component sync
    window.dispatchEvent(new Event('storage'));
  }
}

export const mockDB = MockDB.getInstance();
