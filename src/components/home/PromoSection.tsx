import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PromoSection() {
  return (
    <section className="section-padding">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-primary"
        >
          <div className="grid items-center lg:grid-cols-2">
            {/* Content */}
            <div className="p-8 md:p-12 lg:p-16">
              <span className="text-sm font-medium uppercase tracking-widest text-primary-foreground/80">
                Limited Time Offer
              </span>
              <h2 className="mt-4 font-display text-3xl font-semibold text-primary-foreground md:text-4xl">
                Get 20% Off Your First Order
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Sign up today and receive an exclusive discount on your first purchase.
                Don't miss out on this special offer.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button asChild variant="secondary" size="lg">
                  <Link to="/signup">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link to="/products">Browse Products</Link>
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative hidden h-full lg:block">
              <img
                src="/placeholder.svg"
                alt="Promotional offer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent" />
            </div>
          </div>

          {/* Background pattern */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/5" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary-foreground/5" />
        </motion.div>
      </div>
    </section>
  );
}
