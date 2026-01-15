import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategorySection } from '@/components/home/CategorySection';
import { PromoSection } from '@/components/home/PromoSection';
import { TrustSection } from '@/components/home/TrustSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProducts />
      <CategorySection />
      <PromoSection />
      <TrustSection />
    </Layout>
  );
};

export default Index;
