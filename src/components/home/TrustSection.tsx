import { motion } from 'framer-motion';
import { Truck, Shield, RefreshCw, HeadphonesIcon } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $100',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure checkout',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Dedicated support team',
  },
];

export function TrustSection() {
  return (
    <section className="border-t border-border py-12">
      <div className="container-narrow">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
