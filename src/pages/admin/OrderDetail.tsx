import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Order, OrderItem } from '@/types';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'canceled', label: 'Canceled' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data as unknown as Order);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled') => {
    if (!order) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;

      setOrder({ ...order, status: newStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' });
      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/orders')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-3xl font-semibold">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy \'at\' h:mm a')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status]}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <Select value={order.status} onValueChange={updateOrderStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: OrderItem) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.product_price)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.quantity * item.product_price)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatCurrency(order.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{order.shipping_address?.full_name}</p>
                  <p className="text-muted-foreground">{order.shipping_address?.street_address}</p>
                  <p className="text-muted-foreground">
                    {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
                  </p>
                  <p className="text-muted-foreground">{order.shipping_address?.country}</p>
                  {order.shipping_address?.phone && (
                    <p className="text-muted-foreground mt-2">Phone: {order.shipping_address.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-green-600">Paid</span>
                  </div>
                  {order.stripe_payment_intent_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment ID</span>
                      <span className="font-mono text-xs">
                        {order.stripe_payment_intent_id.slice(0, 16)}...
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
