import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const responseProducts = await api.get('/products')
      const products = responseProducts.data

      const responseStock = await api.get('/stock')
      const stocks = responseStock.data
      const stock = stocks.find((stock: Stock) => stock.id === productId) as Stock

      if (stock.amount <= 0) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const product = products.find((product: Product) => product.id === productId)

      if (cart.find((p: Product) => p.id === productId)) {
        setCart(cart.map((product: Product) => {
          return product.id === productId
          ? { ...product, amount: product.amount + 1 }
          : product
        }))
      } else {
        setCart([...cart, { ...product, amount: 1 }])
      }

      toast.info(`${product.title} adicionado ao carrinho`)
    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
