import { render, screen, fireEvent } from '@testing-library/react';
import { OneStepCheckout } from '../components/checkout/OneStepCheckout';
import '@testing-library/jest-dom';

// Mock the Zustand store
jest.mock('../store/cart-store', () => ({
    useCartStore: () => ({
        items: [],
        getTotal: () => 10000,
        getSubtotal: () => 10000,
        appliedCoupon: null,
        clearCart: jest.fn()
    })
}));

describe('OneStepCheckout Flow', () => {
    it('renders all 3 steps of the checkout process', () => {
        render(<OneStepCheckout />);

        expect(screen.getByText(/Información de Contacto/i)).toBeInTheDocument();
        expect(screen.getByText(/Envío a Domicilio/i)).toBeInTheDocument();
        expect(screen.getByText(/Método de Pago/i)).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty form', async () => {
        render(<OneStepCheckout />);

        const submitButton = screen.getByText(/Finalizar Pedido/i, { selector: 'button' });
        fireEvent.click(submitButton);

        // Wait for react-hook-form to trigger errors
        const emailError = await screen.findByText(/Email inválido/i);
        expect(emailError).toBeInTheDocument();
    });

    it('allows changing payment methods', () => {
        render(<OneStepCheckout />);

        const cardButton = screen.getByText('Tarjeta');
        const paypalButton = screen.getByText('PayPal');
        const transferButton = screen.getByText('CVU / CBU');

        fireEvent.click(paypalButton);
        expect(paypalButton.closest('button')).toHaveClass('border-[#0070BA]');

        fireEvent.click(transferButton);
        expect(screen.getByText(/Transferencia Bancaria \(Descuento extra\)/i)).toBeInTheDocument();
    });
});
