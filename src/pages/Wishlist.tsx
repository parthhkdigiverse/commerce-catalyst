import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { WishlistItem } from '@/types';
import { toast } from 'sonner';

export default function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchWishlist() {
      const { data } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products(
            *,
            images:product_images(*)
          )
        `)
        .eq('user_id', user.id);

      if (data) setItems(data as WishlistItem[]);
      setLoading(false);
    }

    fetchWishlist();
  }, [user]);

  const handleRemove = async (productId: string) => {
    if (!user) return;

    await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    setItems(prev => prev.filter(item => item.product_id !== productId));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container-narrow py-16 text-center">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Sign in to view your wishlist</h1>
          <Button asChild className="mt-6">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-narrow py-8">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-narrow py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 font-display text-2xl font-semibold">Your wishlist is empty</h1>
            <p className="mt-2 text-muted-foreground">
              Save items you love for later
            </p>
            <Button asChild className="mt-6">
              <Link to="/products">Start Shopping</Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-narrow py-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-semibold"
        >
          My Wishlist
        </motion.h1>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const product = item.product;
            if (!product) return null;
            const image = product.images?.[0]?.url || '/placeholder.svg';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg border border-border"
              >
                <Link to={`/products/${product.slug}`}>
                  <div className="aspect-[3/4] bg-secondary">
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/products/${product.slug}`} className="font-medium hover:underline">
                    {product.name}
                  </Link>
                  <p className="mt-1 font-semibold">${product.price.toFixed(2)}</p>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
