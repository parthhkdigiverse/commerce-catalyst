import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, ShoppingBag, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Product, Review } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('slug', slug)
        .single();

      if (data) {
        setProduct(data as Product);
        
        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', data.id)
          .order('created_at', { ascending: false });
        
        if (reviewsData) setReviews(reviewsData);
      }
      setLoading(false);
    }

    if (slug) fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, quantity);
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please sign in to add to wishlist');
      return;
    }
    if (!product) return;

    const { error } = await supabase
      .from('wishlist')
      .upsert({ user_id: user.id, product_id: product.id }, { onConflict: 'user_id,product_id' });

    if (error) {
      toast.error('Failed to add to wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-narrow py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-xl bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-6 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-narrow py-16 text-center">
          <h1 className="font-display text-2xl">Product not found</h1>
          <Button asChild className="mt-4">
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const images = product.images?.length ? product.images : [{ url: '/placeholder.svg', alt_text: product.name }];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Layout>
      <div className="container-narrow py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-foreground">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
              <img
                src={images[selectedImage]?.url || '/placeholder.svg'}
                alt={images[selectedImage]?.alt_text || product.name}
                className="h-full w-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition hover:bg-background"
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition hover:bg-background"
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      'aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 transition',
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    )}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {product.category && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display text-3xl font-semibold">{product.name}</h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= averageRating ? 'fill-accent text-accent' : 'text-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className={cn('text-2xl font-semibold', hasDiscount && 'text-destructive')}>
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.compare_at_price!.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{product.description}</p>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stock */}
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <p className="text-sm text-accent">Only {product.stock_quantity} left in stock</p>
            )}
            {product.stock_quantity === 0 && (
              <p className="text-sm text-destructive">Out of stock</p>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" onClick={handleAddToWishlist}>
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Shipping info */}
            <div className="flex items-center gap-3 rounded-lg bg-secondary p-4">
              <Truck className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Free shipping on orders over $100</p>
                <p className="text-muted-foreground">Estimated delivery: 3-5 business days</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mt-12">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose prose-sm max-w-none">
              <p>{product.description || 'No description available.'}</p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-4 w-4',
                              star <= review.rating ? 'fill-accent text-accent' : 'text-muted'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && <h4 className="mt-2 font-medium">{review.title}</h4>}
                    {review.content && <p className="mt-1 text-muted-foreground">{review.content}</p>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
