import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, MapPin, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Profile, Address } from '@/types';
import { toast } from 'sonner';

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchProfile() {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
        });
      }

      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);

      if (addressData) setAddresses(addressData);
      setLoading(false);
    }

    fetchProfile();
  }, [user, navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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

  return (
    <Layout>
      <div className="container-narrow py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-semibold">My Account</h1>
          <p className="mt-2 text-muted-foreground">{user.email}</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <Link
              to="/account"
              className="flex items-center gap-3 rounded-lg bg-secondary p-3 font-medium"
            >
              <User className="h-5 w-5" />
              Profile
            </Link>
            <Link
              to="/orders"
              className="flex items-center gap-3 rounded-lg p-3 text-muted-foreground hover:bg-secondary"
            >
              <Package className="h-5 w-5" />
              Orders
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-3 rounded-lg p-3 text-muted-foreground hover:bg-secondary"
            >
              <Heart className="h-5 w-5" />
              Wishlist
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-muted-foreground hover:bg-secondary"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </motion.aside>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <div className="max-w-md space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email || ''} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                    />
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="addresses" className="mt-6">
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No addresses saved</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{address.label}</span>
                          {address.is_default && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {address.street_address}<br />
                          {address.city}, {address.state} {address.postal_code}<br />
                          {address.country}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
