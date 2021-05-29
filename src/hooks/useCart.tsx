import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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

  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    api.get('/products')
    .then(response => {
      setProducts(response.data)
    })
  }, [])

  const [stocks, setStock] = useState<Stock[]>([])

  useEffect(() => {
    api.get('/stock')
    .then(response => {
      setStock(response.data)
    })
  }, [])

  const addProduct = async (productId: number) => {
    try {
      const stock = stocks.find(stock => stock.id === productId) as Stock

      if (stock.amount <= 0) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const product = products.find(product => product.id === productId) as Product

      let newCart

      if (cart.find((p: Product) => p.id === productId)) {
        newCart = cart.map((product: Product) => {
          return product.id === productId
          ? { ...product, amount: product.amount + 1 }
          : product
        })

        setCart(newCart)
      } else {
        newCart = [...cart, { ...product, amount: 1 }]
        setCart(newCart)
      }

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))

      toast.info(`${product.title} adicionado ao carrinho`)
    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = cart.filter(product => product.id !== productId)
      setCart(newCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
    } catch (error) {
      console.error('CartProvider.removeProduct():', error.message)
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    const stock = stocks.find(stock => stock.id === productId) as Stock
    const product = cart.find(product => product.id === productId) as Product

    if (amount < 1) {
      return
    }

    if (stock.amount < product.amount) {
      toast.error('Quantidade solicitada fora de estoque')
      return
    }

    try {
      const newCart = cart.map((product: Product) => {
        return product.id === productId
        ? { ...product, amount: product.amount + amount }
        : product
      })

      setCart(newCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
    } catch (error) {
      console.error('CartProvider.updateProductAmount():', error.message)
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
