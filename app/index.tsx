import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AddressCard,
  BottomSheet,
  CartItem,
  CategoryCard,
  EmptyState,
  ErrorState,
  GBadge,
  GButton,
  GCard,
  GDivider,
  GInput,
  GLoader,
  GModal,
  GText,
  Header,
  OrderCard,
  ProductCard,
  QuantitySelector,
  RatingView,
  SearchBar,
  Section,
  Skeleton,
} from '@/src/components';
import { PriceDisplay } from '@/src/components/business';
import { useTheme } from '@/src/providers';
import { setThemePreference, useAppDispatch, useAppSelector } from '@/src/store';
import { env } from '@/src/config';
import type {
  AddressSummary,
  CartLineSummary,
  CategorySummary,
  OrderSummary,
  ProductSummary,
} from '@/src/types';

const sampleProduct: ProductSummary = {
  id: 'p1',
  name: 'Kids Birthday Cake',
  pricePaise: 85000,
  compareAtPricePaise: 95000,
  ratingAverage: 4.5,
  ratingCount: 128,
  isPremium: false,
  isAvailable: true,
  discountLabel: '10% OFF',
  imageUrl: null,
};

const sampleCategory: CategorySummary = {
  id: 'c1',
  name: 'Birthday Cakes',
  productCount: 24,
  imageUrl: null,
};

const sampleAddress: AddressSummary = {
  id: 'a1',
  addressType: 'Home',
  name: 'Home',
  phone: '+91 90000 00000',
  line1: '12 Baker Street',
  city: 'Bengaluru',
  pincode: '560001',
  isDefault: true,
};

const sampleCartItem: CartLineSummary = {
  id: 'ci1',
  productId: 'p1',
  name: 'Kids Birthday Cake',
  optionsSummary: '1kg · Eggless · Chocolate',
  unitPricePaise: 85000,
  quantity: 1,
  isAvailable: true,
  imageUrl: null,
};

const sampleOrder: OrderSummary = {
  id: 'o1',
  publicOrderId: '26-01',
  statusLabel: 'Preparing',
  fulfilmentLabel: 'Doorstep Delivery',
  totalPaise: 92000,
  placedAtLabel: 'Today, 4:20 PM',
  itemCount: 2,
};

export default function DesignSystemGalleryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const preference = useAppSelector((s) => s.settings.themePreference);
  const [query, setQuery] = useState('');
  const [qty, setQty] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const themeLabel = useMemo(() => {
    if (preference === 'system') return `System (${theme.mode})`;
    return preference === 'dark' ? 'Dark' : 'Light';
  }, [preference, theme.mode]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="GUNUCO · Phase 1" />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing['2xl'],
        }}
      >
        <GCard style={{ gap: theme.spacing.sm }}>
          <GText variant="display">GUNUCO</GText>
          <GText variant="bodyMd" color="secondary">
            Phase 1 foundation: design system, reusable UI, Redux + RTK Query base, secure storage,
            and navigation shell.
          </GText>
          <GText variant="caption" color="secondary">
            Env: {env.appEnv} · API host configured via EXPO_PUBLIC_API_BASE_URL
          </GText>
          <GText variant="caption" color="secondary">
            Theme: {themeLabel}
          </GText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            <GButton
              title="Light"
              size="sm"
              variant="secondary"
              onPress={() => dispatch(setThemePreference('light'))}
            />
            <GButton
              title="Dark"
              size="sm"
              variant="secondary"
              onPress={() => dispatch(setThemePreference('dark'))}
            />
            <GButton
              title="System"
              size="sm"
              variant="ghost"
              onPress={() => dispatch(setThemePreference('system'))}
            />
          </View>
        </GCard>

        <Section title="Primitives">
          <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.md }}>
            <GText variant="titleMd">Typography / Buttons / Inputs</GText>
            <GInput label="Phone" placeholder="Enter phone number" keyboardType="phone-pad" />
            <GInput label="With error" errorText="This field is required" value="" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              <GButton title="Primary" />
              <GButton title="Secondary" variant="secondary" />
              <GButton title="Danger" variant="danger" />
              <GButton title="Loading" loading />
            </View>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <GBadge label="PREMIUM" variant="premium" />
              <GBadge label="10% OFF" variant="discount" />
              <GBadge label="Info" variant="info" />
            </View>
            <GLoader />
            <Skeleton height={18} />
            <Skeleton height={80} borderRadius={theme.radius.lg} />
            <GDivider />
            <GButton title="Open Modal" variant="secondary" onPress={() => setModalOpen(true)} />
            <GButton
              title="Open Bottom Sheet"
              variant="secondary"
              onPress={() => setSheetOpen(true)}
            />
          </View>
        </Section>

        <Section title="Composites">
          <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.md }}>
            <SearchBar value={query} onChangeText={setQuery} />
            <RatingView value={4} interactive onChange={() => undefined} size="md" />
            <QuantitySelector value={qty} onChange={setQty} />
            <PriceDisplay pricePaise={85000} compareAtPricePaise={95000} size="lg" />
            <EmptyState
              title="Empty cart"
              description="Add cakes to get started."
              actionLabel="Browse"
              onAction={() => undefined}
            />
            <ErrorState onRetry={() => undefined} />
          </View>
        </Section>

        <Section title="Business components">
          <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.md }}>
            <ProductCard product={sampleProduct} />
            <CategoryCard category={sampleCategory} />
            <AddressCard address={sampleAddress} selected />
            <CartItem
              item={sampleCartItem}
              onQuantityChange={() => undefined}
              onRemove={() => undefined}
            />
            <OrderCard order={sampleOrder} />
          </View>
        </Section>
      </ScrollView>

      <GModal visible={modalOpen} onClose={() => setModalOpen(false)} title="Example modal">
        <GText variant="bodyMd" color="secondary">
          Modal foundation for confirms and session prompts.
        </GText>
        <GButton title="Close" fullWidth onPress={() => setModalOpen(false)} />
      </GModal>

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Example sheet">
        <GText variant="bodyMd" color="secondary">
          Bottom sheet foundation for filters, slots, and selectors.
        </GText>
        <GButton title="Done" fullWidth onPress={() => setSheetOpen(false)} />
      </BottomSheet>
    </View>
  );
}
