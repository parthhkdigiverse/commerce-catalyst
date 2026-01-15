import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CartItem, Product } from '@/types';
import { toast } from 'sonner';

interface LocalCartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

interface CartContextType {
  items: CartItem[] | LocalCartItem[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [localItems, setLocalItems] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      // Load from localStorage for non-authenticated users
      const stored = localStorage.getItem('cart');
      if (stored) {
        const parsed = JSON.parse(stored) as LocalCartItem[];
        // Fetch product details
        const productIds = parsed.map(item => item.productId);
        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);
          
          const withProducts = parsed.map(item => ({
            ...item,
            product: products?.find(p => p.id === item.productId),
          }));
          setLocalItems(withProducts);
        }
      }
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          *,
          images:product_images(*)
        )
      `)
      .eq('user_id', user.id);

    if (!error && data) {
      setItems(data as CartItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Sync local cart to database when user logs in
  useEffect(() => {
    const syncCart = async () => {
      if (user && localItems.length > 0) {
        for (const item of localItems) {
          await supabase
            .from('cart_items')
            .upsert({
              user_id: user.id,
              product_id: item.productId,
              quantity: item.quantity,
            }, { onConflict: 'user_id,product_id' });
        }
        localStorage.removeItem('cart');
        setLocalItems([]);
        fetchCart();
      }
    };
    syncCart();
  }, [user, localItems, fetchCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      // Handle local cart
      const existing = localItems.find(item => item.productId === productId);
      let newItems: LocalCartItem[];
      if (existing) {
        newItems = localItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...localItems, { productId, quantity }];
      }
      setLocalItems(newItems);
      localStorage.setItem('cart', JSON.stringify(newItems.map(({ productId, quantity }) => ({ productId, quantity }))));
      toast.success('Added to cart');
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id: productId,
        quantity,
      }, { onConflict: 'user_id,product_id' });

    if (error) {
      toast.error('Failed to add to cart');
    } else {
      toast.success('Added to cart');
      fetchCart();
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) {
      const newItems = localItems.filter(item => item.productId !== productId);
      setLocalItems(newItems);
      localStorage.setItem('cart', JSON.stringify(newItems.map(({ productId, quantity }) => ({ productId, quantity }))));
      return;
    }

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    fetchCart();
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (!user) {
      const newItems = localItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
      setLocalItems(newItems);
      localStorage.setItem('cart', JSON.stringify(newItems.map(({ productId, quantity }) => ({ productId, quantity }))));
      return;
    }

    await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', productId);

    fetchCart();
  };

  const clearCart = async () => {
    if (!user) {
      setLocalItems([]);
      localStorage.removeItem('cart');
      return;
    }

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    setItems([]);
  };

  const allItems = user ? items : localItems;
  const itemCount = allItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = allItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items: allItems,
      loading,
      itemCount,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
