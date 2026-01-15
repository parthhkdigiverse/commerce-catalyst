import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (data) {
        setProducts(data as Product[]);
      }
      setLoading(false);
    }

    fetchFeatured();
  }, []);

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row"
        >
          <div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Featured Products
            </h2>
            <p className="mt-2 text-muted-foreground">
              Handpicked selections from our latest collection
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/products?featured=true">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <ProductGrid products={products} loading={loading} />
      </div>
    </section>
  );
}
