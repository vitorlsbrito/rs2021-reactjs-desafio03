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
      const { data } = await api.get(`/stock/${ productId }`);
      const productStock = data.amount;

      if (productStock <= 1) {
        throw new Error('Quantidade solicitada fora de estoque');
      }

      let productAlreadyInCart = cart.find(product => product.id === productId);
      let newCart: Product[] = [];

      if (!productAlreadyInCart) {
        const { data } = await api.get<Omit<Product, 'amount'>>(`/products/${ productId }`);

        newCart = [
          ...cart,
          { ...data, amount: 1 }
        ]

        setCart(newCart);
      } else {
        newCart = cart.map((product) => {
          if (product.id !== productId) {
            return product;
          } else {
            return {
              ...product,
              amount: product.amount + 1
            }
          }
        });

        setCart(newCart);
      }

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch (err) {
      err.message.includes('estoque') ? toast.error(err.message) : toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      let productAlreadyInCart = cart.find(product => product.id === productId);

      if (!productAlreadyInCart) {
        throw new Error('Erro na remoção do produto');
      }

      const newCart = cart.filter((product) => {
        if (product.id !== productId) {
          return product;
        }
      });

      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch(err) {
      toast.error(err.message);
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) {
        throw new Error('Erro na alteração de quantidade do produto');
      }

      const { data } = await api.get<Stock>(`/stock/${ productId }`);
      const productStock = data.amount;

      if (productStock <= 1) {
        throw new Error('Quantidade solicitada fora de estoque');
      }

      const newCart = cart.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            amount
          }
        } else {
          return product;
        }
      });

      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch(err) {
      err.message.includes('estoque') ? toast.error(err.message) : toast.error('Erro na alteração de quantidade do produto');
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
