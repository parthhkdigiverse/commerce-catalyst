import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Order } from '@/types';
import { cn } from '@/lib/utils';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
};

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchOrder() {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (data) setOrder(data as unknown as Order);
      setLoading(false);
    }

    if (id) fetchOrder();
  }, [id, user, navigate]);

  if (!user) return null;

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container-narrow py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">Order not found</h1>
          <Button asChild className="mt-6">
            <Link to="/orders">View All Orders</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const address = order.shipping_address;

  return (
    <Layout>
      <div className="container-narrow py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Badge className={cn('capitalize text-sm px-3 py-1', statusColors[order.status])}>
              {order.status}
            </Badge>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="rounded-lg border border-border">
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <h2 className="font-medium">Order Items</h2>
                </div>
              </div>
              <div className="divide-y divide-border">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div className="h-16 w-16 shrink-0 rounded-md bg-secondary" />
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.product_price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.product_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Shipping Address */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <h2 className="font-medium">Shipping Address</h2>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                <p>{address.full_name}</p>
                <p>{address.street_address}</p>
                <p>
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p>{address.country}</p>
                {address.phone && <p className="mt-2">{address.phone}</p>}
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <h2 className="font-medium">Order Summary</h2>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shipping_cost === 0 ? 'Free' : `$${order.shipping_cost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
