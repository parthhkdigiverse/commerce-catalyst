import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .limit(4);

      if (data) {
        setCategories(data);
      }
    }

    fetchCategories();
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explore our curated collections
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/products?category=${category.slug}`}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <img
                    src={category.image_url || '/placeholder.svg'}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-display text-xl font-semibold text-background">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-background/80">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
