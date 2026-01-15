import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const mainImage = product.images?.[0]?.url || '/placeholder.svg';
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id);
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to add to wishlist');
      return;
    }

    const { error } = await supabase
      .from('wishlist')
      .upsert({
        user_id: user.id,
        product_id: product.id,
      }, { onConflict: 'user_id,product_id' });

    if (error) {
      toast.error('Failed to add to wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/products/${product.slug}`} className="group block">
        <div className="product-card">
          {/* Image container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
            <img
              src={mainImage}
              alt={product.name}
              className="product-image"
            />
            
            {/* Badges */}
            {hasDiscount && (
              <span className="badge-sale">-{discountPercent}%</span>
            )}
            
            {/* Quick actions */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 backdrop-blur-sm"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="shrink-0 backdrop-blur-sm"
                onClick={handleAddToWishlist}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product info */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground">
              {product.category?.name}
            </p>
            <h3 className="mt-1 font-medium leading-tight">
              {product.name}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span className={cn(
                "font-medium",
                hasDiscount && "text-destructive"
              )}>
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.compare_at_price!.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Stock status */}
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <p className="mt-2 text-xs text-accent">
                Only {product.stock_quantity} left
              </p>
            )}
            {product.stock_quantity === 0 && (
              <p className="mt-2 text-xs text-destructive">
                Out of stock
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
