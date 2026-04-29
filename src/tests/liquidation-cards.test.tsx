import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiquidationCardsSection } from '../components/catalog/LiquidationCardsSection';

const baseProduct = {
  id: 'p1',
  name: 'Producto Test',
  description: 'Descripcion completa',
  category: 'Zapatillas',
  brand: 'ETER',
  basePrice: 100000,
  images: ['https://invalid.local/image.jpg'],
  stockBySize: { '40': 2, '41': 1 },
  totalStock: 3,
  status: 'active' as const,
  createdAt: new Date(),
  liquidationActive: true,
  liquidationPrice: 70000,
  liquidationDiscountPercent: 30,
};

describe('LiquidationCardsSection', () => {
  it('renderiza datos de precio y descuento', () => {
    render(<LiquidationCardsSection products={[baseProduct as never]} />);
    expect(screen.getByText('Productos en Liquidación')).toBeInTheDocument();
    expect(screen.getByText('-30%')).toBeInTheDocument();
  });

  it('abre modal de previsualizacion al click', () => {
    render(<LiquidationCardsSection products={[baseProduct as never]} />);
    fireEvent.click(screen.getByText('Producto Test'));
    expect(screen.getByText('Estado:')).toBeInTheDocument();
  });
});
