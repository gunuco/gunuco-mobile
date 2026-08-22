import type { CategoryNode } from '@/src/types/catalog';
import type { ProductSummary } from '@/src/types/commerce';
import type { HomeBanner, HomeOffer, HomeResponse } from '@/src/types/home';
import type { LegalType } from '@/src/types/legal';
import type {
  ProductDetail,
  ProductHighlight,
  ProductOptionGroup,
  ProductOptionsResponse,
} from '@/src/types/product';
import type { ProductReview } from '@/src/types/review';
import { UI_TEST_IMAGES } from './images';

export const PAGE_SIZE = 12;

export const CATEGORY_CAKES = 'cat-cakes';
export const CATEGORY_PREMIUM = 'cat-premium';
export const CATEGORY_CHEESECAKE = 'cat-cheesecake';
export const CATEGORY_CASUAL = 'cat-casual';
export const CATEGORY_WEDDING = 'cat-wedding';
export const CATEGORY_OCCASION = 'cat-occasion';
export const CATEGORY_BIRTHDAY = CATEGORY_OCCASION;
export const CATEGORY_BROWNIES_COOKIES = 'cat-brownies-cookies';
export const CATEGORY_BROWNIES = 'cat-brownies';
export const CATEGORY_COOKIES = 'cat-cookies';
export const CATEGORY_DECORATIONS = 'cat-decorations';
export const CATEGORY_BALLOONS = 'cat-balloons';
export const CATEGORY_CANDLES = 'cat-candles';
export const CATEGORY_TOPPERS = 'cat-toppers';
export const CATEGORY_FLOWERS = 'cat-flowers';
export const CATEGORY_PARTY = 'cat-party';

export const CATEGORIES: CategoryNode[] = [
  {
    id: CATEGORY_CAKES,
    name: 'Cakes',
    imageUrl: UI_TEST_IMAGES.catPremium,
    isActive: true,
    productCount: 28,
    children: [
      {
        id: CATEGORY_PREMIUM,
        name: 'Premium Cakes',
        imageUrl: UI_TEST_IMAGES.catPremium,
        parentId: CATEGORY_CAKES,
        isActive: true,
        productCount: 6,
      },
      {
        id: CATEGORY_CHEESECAKE,
        name: 'Cheesecakes',
        imageUrl: UI_TEST_IMAGES.catCheesecake,
        parentId: CATEGORY_CAKES,
        isActive: true,
        productCount: 6,
      },
      {
        id: CATEGORY_CASUAL,
        name: 'Casual Cakes',
        imageUrl: UI_TEST_IMAGES.catCasual,
        parentId: CATEGORY_CAKES,
        isActive: true,
        productCount: 8,
      },
      {
        id: CATEGORY_WEDDING,
        name: 'Wedding / Anniversary',
        imageUrl: UI_TEST_IMAGES.catWedding,
        parentId: CATEGORY_CAKES,
        isActive: true,
        productCount: 5,
      },
      {
        id: CATEGORY_OCCASION,
        name: 'Occasion Cakes',
        imageUrl: UI_TEST_IMAGES.catOccasion,
        parentId: CATEGORY_CAKES,
        isActive: true,
        productCount: 5,
      },
    ],
  },
  {
    id: CATEGORY_BROWNIES_COOKIES,
    name: 'Brownies & Cookies',
    imageUrl: UI_TEST_IMAGES.catCookies,
    isActive: true,
    productCount: 14,
    children: [
      {
        id: CATEGORY_BROWNIES,
        name: 'Brownies',
        imageUrl: UI_TEST_IMAGES.catBrownies,
        parentId: CATEGORY_BROWNIES_COOKIES,
        isActive: true,
        productCount: 6,
      },
      {
        id: CATEGORY_COOKIES,
        name: 'NYC Cookies',
        imageUrl: UI_TEST_IMAGES.catCookies,
        parentId: CATEGORY_BROWNIES_COOKIES,
        isActive: true,
        productCount: 8,
      },
    ],
  },
  {
    id: CATEGORY_DECORATIONS,
    name: 'Decorations',
    imageUrl: UI_TEST_IMAGES.balloons,
    isActive: true,
    productCount: 5,
    children: [
      {
        id: CATEGORY_BALLOONS,
        name: 'Balloons',
        imageUrl: UI_TEST_IMAGES.balloons,
        parentId: CATEGORY_DECORATIONS,
        isActive: true,
        productCount: 1,
      },
      {
        id: CATEGORY_CANDLES,
        name: 'Candles',
        imageUrl: UI_TEST_IMAGES.candles,
        parentId: CATEGORY_DECORATIONS,
        isActive: true,
        productCount: 1,
      },
      {
        id: CATEGORY_TOPPERS,
        name: 'Cake Toppers',
        imageUrl: UI_TEST_IMAGES.toppers,
        parentId: CATEGORY_DECORATIONS,
        isActive: true,
        productCount: 1,
      },
      {
        id: CATEGORY_FLOWERS,
        name: 'Flowers',
        imageUrl: UI_TEST_IMAGES.flowers,
        parentId: CATEGORY_DECORATIONS,
        isActive: true,
        productCount: 1,
      },
      {
        id: CATEGORY_PARTY,
        name: 'Party Decorations',
        imageUrl: UI_TEST_IMAGES.partyDecor,
        parentId: CATEGORY_DECORATIONS,
        isActive: true,
        productCount: 1,
      },
    ],
  },
];

/** GUNUCO cake pricing model — base prices by quantity (absolute, not proportional). */
const CAKE_BASE_PRICES = {
  g500: 39900,
  kg1: 69900,
  kg2: 129900,
  kg3: 189900,
} as const;

function buildCakeCustomization(bases: {
  g500: number;
  kg1: number;
  kg2: number;
  kg3: number;
} = CAKE_BASE_PRICES): ProductOptionGroup[] {
  return [
    {
      id: 'opt-flour',
      label: 'Flour Type',
      required: true,
      type: 'single',
      minSelect: 1,
      maxSelect: 1,
      defaultValueId: 'flour-maida',
      options: [
        {
          id: 'flour-maida',
          label: 'Maida',
          isDefault: true,
          available: true,
          pricePerKgPaise: 0,
          iconName: 'ellipse-outline',
        },
        {
          id: 'flour-wheat',
          label: 'Wheat',
          available: true,
          pricePerKgPaise: 6000,
          iconName: 'leaf-outline',
        },
      ],
    },
    {
      id: 'opt-egg',
      label: 'Egg / Eggless',
      required: true,
      type: 'single',
      minSelect: 1,
      maxSelect: 1,
      defaultValueId: 'egg-egg',
      options: [
        {
          id: 'egg-egg',
          label: 'Egg',
          isDefault: true,
          available: true,
          pricePerKgPaise: 0,
          iconName: 'ellipse-outline',
        },
        {
          id: 'egg-eggless',
          label: 'Eggless',
          available: true,
          pricePerKgPaise: 8000,
          iconName: 'close-circle-outline',
        },
      ],
    },
    {
      id: 'opt-sweetener',
      label: 'Sweetener Type',
      required: true,
      type: 'single',
      minSelect: 1,
      maxSelect: 1,
      defaultValueId: 'sw-mishri',
      options: [
        {
          id: 'sw-mishri',
          label: 'Mishri',
          isDefault: true,
          available: true,
          pricePerKgPaise: 0,
          iconName: 'snow-outline',
        },
        {
          id: 'sw-stevia',
          label: 'Sugar Free Stevia',
          available: true,
          pricePerKgPaise: 10000,
          iconName: 'leaf-outline',
        },
        {
          id: 'sw-dates',
          label: 'Dates Sugar',
          available: true,
          pricePerKgPaise: 8000,
          iconName: 'nutrition-outline',
        },
        {
          id: 'sw-jaggery',
          label: 'Jaggery',
          available: true,
          pricePerKgPaise: 4000,
          iconName: 'cube-outline',
        },
      ],
    },
    {
      id: 'opt-flavour',
      label: 'Flavour Type',
      required: true,
      type: 'single',
      minSelect: 1,
      maxSelect: 1,
      defaultValueId: 'fl-vanilla',
      options: [
        { id: 'fl-vanilla', label: 'Vanilla', isDefault: true, available: true, pricePerKgPaise: 0 },
        {
          id: 'fl-chocolate',
          label: 'Chocolate',
          available: true,
          pricePerKgPaise: 6000,
        },
        {
          id: 'fl-butterscotch',
          label: 'Butterscotch',
          available: true,
          pricePerKgPaise: 6000,
        },
        {
          id: 'fl-strawberry',
          label: 'Strawberry',
          available: true,
          pricePerKgPaise: 6000,
        },
        { id: 'fl-mango', label: 'Mango', available: true, pricePerKgPaise: 6000 },
        {
          id: 'fl-redvelvet',
          label: 'Red Velvet',
          available: true,
          pricePerKgPaise: 10000,
        },
        {
          id: 'fl-pineapple',
          label: 'Pineapple',
          available: true,
          pricePerKgPaise: 6000,
        },
        {
          id: 'fl-blueberry',
          label: 'Blueberry',
          available: true,
          pricePerKgPaise: 6000,
        },
        {
          id: 'fl-blackforest',
          label: 'Black Forest',
          available: true,
          pricePerKgPaise: 6000,
        },
        {
          id: 'fl-chocochip',
          label: 'Chocolate Chip',
          available: true,
          pricePerKgPaise: 6000,
        },
      ],
    },
    {
      id: 'opt-size',
      label: 'Quantity',
      required: true,
      type: 'single',
      minSelect: 1,
      maxSelect: 1,
      defaultValueId: 'size-500',
      options: [
        {
          id: 'size-500',
          label: '500 gm',
          pricePaise: bases.g500,
          isDefault: true,
          available: true,
        },
        { id: 'size-1kg', label: '1 Kg', pricePaise: bases.kg1, available: true },
        { id: 'size-2kg', label: '2 kg', pricePaise: bases.kg2, available: true },
        { id: 'size-3kg', label: '3 kg', pricePaise: bases.kg3, available: true },
      ],
    },
  ];
}

const CAKE_CUSTOMIZATION: ProductOptionGroup[] = buildCakeCustomization();

/** Scale wedding/occasion catalogue bases using pricing-model quantity ratios. */
function scaledCakeBases(g500Paise: number) {
  return {
    g500: g500Paise,
    kg1: Math.round((g500Paise * CAKE_BASE_PRICES.kg1) / CAKE_BASE_PRICES.g500),
    kg2: Math.round((g500Paise * CAKE_BASE_PRICES.kg2) / CAKE_BASE_PRICES.g500),
    kg3: Math.round((g500Paise * CAKE_BASE_PRICES.kg3) / CAKE_BASE_PRICES.g500),
  };
}

const TREAT_SIZE: ProductOptionGroup[] = [
  {
    id: 'opt-pack',
    label: 'Pack size',
    required: false,
    type: 'single',
    minSelect: 0,
    maxSelect: 1,
    defaultValueId: 'pack-6',
    options: [
      { id: 'pack-6', label: 'Box of 6', isDefault: true, available: true },
      { id: 'pack-12', label: 'Box of 12', pricePaise: 24900, available: true },
    ],
  },
];

type FixtureProduct = ProductSummary & {
  categoryId: string;
  description: string;
  optionGroups?: ProductOptionGroup[];
  images?: string[];
  highlights?: ProductHighlight[];
  flavour?: string;
  egg?: string;
};

function discountLabel(price: number, compare?: number): string | undefined {
  if (!compare || compare <= price) {
    return undefined;
  }
  const off = Math.round(((compare - price) / compare) * 100);
  return `${off}% OFF`;
}

function cakeProduct(
  item: Omit<FixtureProduct, 'hasRequiredOptions' | 'weightLabel' | 'discountLabel'> & {
    compareAtPricePaise?: number;
    isPremium?: boolean;
    badgeLabel?: string;
  },
): FixtureProduct {
  // Wedding / high-ticket cakes keep catalogue bases; everyday cakes use the
  // GUNUCO cake pricing model starting at ₹399 / 500g.
  const highTicket = item.pricePaise >= 150000;
  const optionGroups =
    item.optionGroups ??
    (highTicket
      ? buildCakeCustomization(scaledCakeBases(item.pricePaise))
      : CAKE_CUSTOMIZATION);
  const pricePaise = item.optionGroups
    ? item.pricePaise
    : highTicket
      ? item.pricePaise
      : CAKE_BASE_PRICES.g500;
  const compareAtPricePaise = item.optionGroups
    ? item.compareAtPricePaise
    : highTicket
      ? item.compareAtPricePaise
      : item.compareAtPricePaise
        ? Math.round(CAKE_BASE_PRICES.g500 * 1.2)
        : undefined;

  return {
    ...item,
    pricePaise,
    compareAtPricePaise,
    weightLabel: '500 gm',
    hasRequiredOptions: true,
    discountLabel: discountLabel(pricePaise, compareAtPricePaise),
    optionGroups,
    isAvailable: item.isAvailable !== false,
  };
}

const RAW_PRODUCTS: FixtureProduct[] = [
  cakeProduct({
    id: 'prd-choco-truffle',
    name: 'Belgian Chocolate Cake',
    imageUrl: UI_TEST_IMAGES.belgianChocolate,
    images: [UI_TEST_IMAGES.belgianChocolate, UI_TEST_IMAGES.belgianChocolateAlt],
    pricePaise: 59900,
    compareAtPricePaise: 69900,
    ratingAverage: 4.8,
    ratingCount: 214,
    isPremium: true,
    badgeLabel: 'Bestseller',
    categoryId: CATEGORY_PREMIUM,
    flavour: 'Belgian Chocolate',
    egg: 'Eggless',
    description:
      'Layers of dark Belgian chocolate sponge with ganache. A GUNUCO Premium favourite for celebrations.',
  }),
  cakeProduct({
    id: 'prd-red-velvet',
    name: 'Red Velvet Cake',
    imageUrl: UI_TEST_IMAGES.redVelvet,
    images: [UI_TEST_IMAGES.redVelvet, UI_TEST_IMAGES.redVelvetAlt],
    pricePaise: 64900,
    compareAtPricePaise: 74900,
    ratingAverage: 4.7,
    ratingCount: 186,
    isPremium: true,
    badgeLabel: 'Premium',
    categoryId: CATEGORY_PREMIUM,
    flavour: 'Red Velvet',
    egg: 'Eggless',
    description: 'Classic red velvet layers with a light cream cheese frosting.',
  }),
  cakeProduct({
    id: 'prd-black-forest',
    name: 'Black Forest Cake',
    imageUrl: UI_TEST_IMAGES.blackForest,
    images: [UI_TEST_IMAGES.blackForest, UI_TEST_IMAGES.chocolateTruffle],
    pricePaise: 55000,
    compareAtPricePaise: 65000,
    ratingAverage: 4.6,
    ratingCount: 302,
    badgeLabel: 'Bestseller',
    categoryId: CATEGORY_PREMIUM,
    flavour: 'Black Forest',
    egg: 'Eggless',
    description: 'Cherry, cream, and chocolate shavings on a cocoa sponge.',
  }),
  cakeProduct({
    id: 'prd-hazelnut',
    name: 'Belgian Chocolate Hazelnut Cake',
    imageUrl: UI_TEST_IMAGES.hazelnutCake,
    pricePaise: 75000,
    compareAtPricePaise: 89900,
    ratingAverage: 4.8,
    ratingCount: 97,
    isPremium: true,
    categoryId: CATEGORY_PREMIUM,
    flavour: 'Hazelnut Chocolate',
    egg: 'Eggless',
    description: 'Belgian chocolate sponge with roasted hazelnut praline.',
  }),
  cakeProduct({
    id: 'prd-caramel-crunch',
    name: 'Caramel Crunch Cake',
    imageUrl: UI_TEST_IMAGES.caramelCrunch,
    pricePaise: 69900,
    compareAtPricePaise: 79900,
    ratingAverage: 4.5,
    ratingCount: 88,
    categoryId: CATEGORY_PREMIUM,
    flavour: 'Caramel',
    egg: 'Eggless',
    description: 'Salted caramel layers with a crunchy praline finish.',
  }),
  cakeProduct({
    id: 'prd-truffle',
    name: 'Chocolate Truffle Cake',
    imageUrl: UI_TEST_IMAGES.chocolateTruffle,
    pricePaise: 65000,
    compareAtPricePaise: 75000,
    ratingAverage: 4.7,
    ratingCount: 141,
    categoryId: CATEGORY_PREMIUM,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Dense chocolate truffle cake finished with a glossy ganache.',
  }),
  cakeProduct({
    id: 'prd-ny-cheesecake',
    name: 'Classic New York Cheesecake',
    imageUrl: UI_TEST_IMAGES.nyCheesecake,
    pricePaise: 55000,
    compareAtPricePaise: 65000,
    ratingAverage: 4.8,
    ratingCount: 164,
    badgeLabel: 'Bestseller',
    categoryId: CATEGORY_CHEESECAKE,
    flavour: 'Vanilla',
    egg: 'Egg',
    description: 'Baked New York style cheesecake on a biscuit base.',
  }),
  cakeProduct({
    id: 'prd-blueberry-cheesecake',
    name: 'Blueberry Cheesecake',
    imageUrl: UI_TEST_IMAGES.blueberryCheesecake,
    pricePaise: 59900,
    compareAtPricePaise: 69900,
    ratingAverage: 4.7,
    ratingCount: 128,
    categoryId: CATEGORY_CHEESECAKE,
    flavour: 'Blueberry',
    egg: 'Egg',
    description: 'Creamy cheesecake finished with a blueberry compote.',
  }),
  cakeProduct({
    id: 'prd-biscoff-cheesecake',
    name: 'Lotus Biscoff Cheesecake',
    imageUrl: UI_TEST_IMAGES.biscoffCheesecake,
    pricePaise: 65000,
    compareAtPricePaise: 75000,
    ratingAverage: 4.9,
    ratingCount: 211,
    badgeLabel: 'New',
    categoryId: CATEGORY_CHEESECAKE,
    flavour: 'Biscoff',
    egg: 'Eggless',
    description: 'Biscoff biscuit base with a caramelised cookie butter topping.',
  }),
  cakeProduct({
    id: 'prd-choco-cheesecake',
    name: 'Chocolate Cheesecake',
    imageUrl: UI_TEST_IMAGES.chocolateCheesecake,
    pricePaise: 59900,
    compareAtPricePaise: 69900,
    ratingAverage: 4.6,
    ratingCount: 76,
    categoryId: CATEGORY_CHEESECAKE,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Dark chocolate baked cheesecake with a cocoa crust.',
  }),
  cakeProduct({
    id: 'prd-mango-cheesecake',
    name: 'Mango Cheesecake',
    imageUrl: UI_TEST_IMAGES.mangoCheesecake,
    pricePaise: 59900,
    compareAtPricePaise: 69900,
    ratingAverage: 4.5,
    ratingCount: 64,
    categoryId: CATEGORY_CHEESECAKE,
    flavour: 'Mango',
    egg: 'Eggless',
    description: 'Seasonal Alphonso-style mango cheesecake.',
  }),
  cakeProduct({
    id: 'prd-strawberry-cheesecake',
    name: 'Strawberry Cheesecake',
    imageUrl: UI_TEST_IMAGES.strawberryCheesecake,
    pricePaise: 59900,
    compareAtPricePaise: 69900,
    ratingAverage: 4.6,
    ratingCount: 91,
    categoryId: CATEGORY_CHEESECAKE,
    flavour: 'Strawberry',
    egg: 'Eggless',
    description: 'Light cheesecake with fresh strawberry glaze.',
  }),
  cakeProduct({
    id: 'prd-mocha',
    name: 'Chocolate Mocha Cake',
    imageUrl: UI_TEST_IMAGES.mochaCake,
    pricePaise: 49900,
    compareAtPricePaise: 57500,
    ratingAverage: 4.4,
    ratingCount: 73,
    categoryId: CATEGORY_CASUAL,
    flavour: 'Mocha',
    egg: 'Eggless',
    description: 'Coffee-kissed chocolate sponge for everyday celebrations.',
  }),
  cakeProduct({
    id: 'prd-fudge',
    name: 'Crunchy Creamy Fudge Cake',
    imageUrl: UI_TEST_IMAGES.fudgeCake,
    pricePaise: 52500,
    compareAtPricePaise: 59900,
    ratingAverage: 4.5,
    ratingCount: 58,
    categoryId: CATEGORY_CASUAL,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Fudge cake with a crunchy chocolate crumb.',
  }),
  cakeProduct({
    id: 'prd-malted',
    name: 'Malted Chocolate Cake',
    imageUrl: UI_TEST_IMAGES.maltedCake,
    pricePaise: 49900,
    compareAtPricePaise: 57500,
    ratingAverage: 4.3,
    ratingCount: 44,
    categoryId: CATEGORY_CASUAL,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Malt chocolate sponge with a light ganache.',
  }),
  cakeProduct({
    id: 'prd-german-choco',
    name: 'German Chocolate Cake',
    imageUrl: UI_TEST_IMAGES.germanChocolate,
    pricePaise: 55000,
    compareAtPricePaise: 65000,
    ratingAverage: 4.6,
    ratingCount: 81,
    categoryId: CATEGORY_CASUAL,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Coconut-pecan style German chocolate cake.',
  }),
  cakeProduct({
    id: 'prd-death-choco',
    name: 'Death By Chocolate Cake',
    imageUrl: UI_TEST_IMAGES.deathByChocolate,
    pricePaise: 59900,
    compareAtPricePaise: 69900,
    ratingAverage: 4.8,
    ratingCount: 119,
    badgeLabel: 'Bestseller',
    categoryId: CATEGORY_CASUAL,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Triple chocolate cake for serious chocolate lovers.',
  }),
  cakeProduct({
    id: 'prd-butterscotch',
    name: 'Premium Butterscotch Cake',
    imageUrl: UI_TEST_IMAGES.butterscotch,
    pricePaise: 49900,
    compareAtPricePaise: 57500,
    ratingAverage: 4.4,
    ratingCount: 77,
    categoryId: CATEGORY_CASUAL,
    flavour: 'Butterscotch',
    egg: 'Eggless',
    description: 'Butterscotch sponge with caramelised nut crunch.',
  }),
  cakeProduct({
    id: 'prd-casual-red-velvet',
    name: 'Casual Red Velvet Cake',
    imageUrl: UI_TEST_IMAGES.redVelvetAlt,
    pricePaise: 52500,
    compareAtPricePaise: 59900,
    ratingAverage: 4.5,
    ratingCount: 66,
    categoryId: CATEGORY_CASUAL,
    flavour: 'Red Velvet',
    egg: 'Eggless',
    description: 'Everyday red velvet cake from the Casual Cakes range.',
  }),
  cakeProduct({
    id: 'prd-chocochips-cake',
    name: 'Classic Chocochips Cake',
    imageUrl: UI_TEST_IMAGES.maltedCake,
    pricePaise: 45000,
    compareAtPricePaise: 52500,
    ratingAverage: 4.3,
    ratingCount: 52,
    categoryId: CATEGORY_CASUAL,
    flavour: 'Chocolate Chip',
    egg: 'Eggless',
    description: 'Soft vanilla sponge folded with chocolate chips.',
  }),
  cakeProduct({
    id: 'prd-wedding-floral',
    name: 'Elegant Floral Wedding Cake',
    imageUrl: UI_TEST_IMAGES.floralWedding,
    images: [UI_TEST_IMAGES.floralWedding, UI_TEST_IMAGES.whiteTier],
    pricePaise: 249900,
    compareAtPricePaise: 279900,
    ratingAverage: 4.9,
    ratingCount: 42,
    isPremium: true,
    badgeLabel: 'Premium',
    categoryId: CATEGORY_WEDDING,
    flavour: 'Vanilla',
    egg: 'Eggless',
    description: 'Two-tier floral wedding cake from the standard GUNUCO catalogue.',
  }),
  cakeProduct({
    id: 'prd-wedding-rose',
    name: 'Rose Anniversary Cake',
    imageUrl: UI_TEST_IMAGES.roseAnniversary,
    pricePaise: 189900,
    compareAtPricePaise: 219900,
    ratingAverage: 4.8,
    ratingCount: 31,
    isPremium: true,
    categoryId: CATEGORY_WEDDING,
    flavour: 'Rose',
    egg: 'Eggless',
    description: 'Buttercream roses on vanilla sponge for anniversaries.',
  }),
  cakeProduct({
    id: 'prd-wedding-white',
    name: 'Classic White Tier Cake',
    imageUrl: UI_TEST_IMAGES.whiteTier,
    pricePaise: 269900,
    compareAtPricePaise: 299900,
    ratingAverage: 4.7,
    ratingCount: 28,
    isPremium: true,
    categoryId: CATEGORY_WEDDING,
    flavour: 'Vanilla',
    egg: 'Eggless',
    description: 'Classic white tiered cake for weddings.',
  }),
  cakeProduct({
    id: 'prd-wedding-gold',
    name: 'Minimal Gold Wedding Cake',
    imageUrl: UI_TEST_IMAGES.goldWedding,
    pricePaise: 289900,
    compareAtPricePaise: 319900,
    ratingAverage: 4.8,
    ratingCount: 19,
    isPremium: true,
    categoryId: CATEGORY_WEDDING,
    flavour: 'Vanilla',
    egg: 'Eggless',
    description: 'Minimal gold-leaf finish on a white wedding cake.',
  }),
  cakeProduct({
    id: 'prd-wedding-step',
    name: 'Floral Step Cake',
    imageUrl: UI_TEST_IMAGES.floralStep,
    pricePaise: 219900,
    compareAtPricePaise: 249900,
    ratingAverage: 4.6,
    ratingCount: 16,
    categoryId: CATEGORY_WEDDING,
    flavour: 'Vanilla',
    egg: 'Eggless',
    description: 'Stepped floral cake for wedding and anniversary tables.',
  }),
  cakeProduct({
    id: 'prd-christmas',
    name: 'Christmas Special Cake',
    imageUrl: UI_TEST_IMAGES.christmasCake,
    pricePaise: 89900,
    compareAtPricePaise: 109900,
    ratingAverage: 4.7,
    ratingCount: 54,
    badgeLabel: 'Seasonal',
    categoryId: CATEGORY_OCCASION,
    flavour: 'Spiced Chocolate',
    egg: 'Eggless',
    description: 'Festive chocolate cake with seasonal garnish.',
  }),
  cakeProduct({
    id: 'prd-new-year',
    name: 'New Year Special Cake',
    imageUrl: UI_TEST_IMAGES.newYearCake,
    pricePaise: 89900,
    compareAtPricePaise: 109900,
    ratingAverage: 4.5,
    ratingCount: 33,
    badgeLabel: 'Seasonal',
    categoryId: CATEGORY_OCCASION,
    flavour: 'Vanilla',
    egg: 'Eggless',
    description: 'Celebration cake for New Year gatherings.',
  }),
  cakeProduct({
    id: 'prd-valentine',
    name: "Valentine's Special Cake",
    imageUrl: UI_TEST_IMAGES.valentineCake,
    pricePaise: 75000,
    compareAtPricePaise: 89900,
    ratingAverage: 4.8,
    ratingCount: 71,
    categoryId: CATEGORY_OCCASION,
    flavour: 'Red Velvet',
    egg: 'Eggless',
    description: 'Heart-ready red velvet cake for Valentine’s Day.',
  }),
  cakeProduct({
    id: 'prd-diwali',
    name: 'Diwali Special Cake',
    imageUrl: UI_TEST_IMAGES.diwaliCake,
    pricePaise: 79900,
    compareAtPricePaise: 95000,
    ratingAverage: 4.6,
    ratingCount: 40,
    categoryId: CATEGORY_OCCASION,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Festive chocolate cake for Diwali.',
  }),
  cakeProduct({
    id: 'prd-birthday-special',
    name: 'Birthday Special Cake',
    imageUrl: UI_TEST_IMAGES.birthdayCake,
    pricePaise: 65000,
    compareAtPricePaise: 75000,
    ratingAverage: 4.7,
    ratingCount: 122,
    badgeLabel: 'Bestseller',
    categoryId: CATEGORY_OCCASION,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Colourful birthday cake from the Occasion range.',
  }),
  {
    id: 'prd-brownie-choco',
    name: 'Choco Chip Brownie',
    imageUrl: UI_TEST_IMAGES.chocoChipBrownie,
    pricePaise: 24900,
    compareAtPricePaise: 29900,
    ratingAverage: 4.6,
    ratingCount: 188,
    isAvailable: true,
    discountLabel: discountLabel(24900, 29900),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    badgeLabel: 'Bestseller',
    categoryId: CATEGORY_BROWNIES,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Fudgy choco-chip brownies, packed as a box of six.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-brownie-biscoff',
    name: 'Biscoff Brownie',
    imageUrl: UI_TEST_IMAGES.biscoffBrownie,
    pricePaise: 27500,
    compareAtPricePaise: 32500,
    ratingAverage: 4.7,
    ratingCount: 96,
    isAvailable: true,
    discountLabel: discountLabel(27500, 32500),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_BROWNIES,
    flavour: 'Biscoff',
    egg: 'Eggless',
    description: 'Brownies swirled with Biscoff cookie butter.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-brownie-overload',
    name: 'Overload Brownie',
    imageUrl: UI_TEST_IMAGES.overloadBrownie,
    pricePaise: 29900,
    compareAtPricePaise: 34900,
    ratingAverage: 4.8,
    ratingCount: 74,
    isAvailable: true,
    discountLabel: discountLabel(29900, 34900),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_BROWNIES,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Loaded chocolate brownie with extra ganache.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-brownie-cheesecake',
    name: 'Cheesecake Brownie',
    imageUrl: UI_TEST_IMAGES.cheesecakeBrownie,
    pricePaise: 29900,
    compareAtPricePaise: 34900,
    ratingAverage: 4.5,
    ratingCount: 61,
    isAvailable: true,
    discountLabel: discountLabel(29900, 34900),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_BROWNIES,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Brownie base with a baked cheesecake swirl.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-brownie-millionaire',
    name: 'Millionaire Brownie',
    imageUrl: UI_TEST_IMAGES.millionaireBrownie,
    pricePaise: 32500,
    compareAtPricePaise: 37500,
    ratingAverage: 4.6,
    ratingCount: 48,
    isAvailable: true,
    discountLabel: discountLabel(32500, 37500),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_BROWNIES,
    flavour: 'Caramel',
    egg: 'Eggless',
    description: 'Brownie, caramel, and chocolate ganache stack.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-brownie-walnut',
    name: 'Walnut Brownie',
    imageUrl: UI_TEST_IMAGES.walnutBrownie,
    pricePaise: 24900,
    compareAtPricePaise: 29900,
    ratingAverage: 4.4,
    ratingCount: 83,
    isAvailable: true,
    discountLabel: discountLabel(24900, 29900),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_BROWNIES,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'Classic walnut brownies, baked in small batches.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-cookie-choco',
    name: 'Choco Chip Cookie',
    imageUrl: UI_TEST_IMAGES.chocoChipCookie,
    pricePaise: 42500,
    compareAtPricePaise: 49900,
    ratingAverage: 4.7,
    ratingCount: 240,
    isAvailable: true,
    discountLabel: discountLabel(42500, 49900),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    badgeLabel: 'Bestseller',
    categoryId: CATEGORY_COOKIES,
    flavour: 'Chocolate Chip',
    egg: 'Eggless',
    description: 'NYC-style oversized choco chip cookies. Box of six.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-cookie-dark',
    name: 'Dark Chocolate Cookie',
    imageUrl: UI_TEST_IMAGES.darkChocolateCookie,
    pricePaise: 45000,
    compareAtPricePaise: 52500,
    ratingAverage: 4.6,
    ratingCount: 118,
    isAvailable: true,
    discountLabel: discountLabel(45000, 52500),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_COOKIES,
    flavour: 'Dark Chocolate',
    egg: 'Eggless',
    description: 'Deep cocoa NYC cookies with dark chocolate chunks.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-cookie-oreo',
    name: 'Oreo Cookie',
    imageUrl: UI_TEST_IMAGES.oreoCookie,
    pricePaise: 45000,
    compareAtPricePaise: 52500,
    ratingAverage: 4.5,
    ratingCount: 97,
    isAvailable: true,
    discountLabel: discountLabel(45000, 52500),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_COOKIES,
    flavour: 'Cookies & Cream',
    egg: 'Eggless',
    description: 'NYC cookies folded with Oreo-style crumbs.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-cookie-nutella',
    name: 'Nutella Cookie',
    imageUrl: UI_TEST_IMAGES.nutellaCookie,
    pricePaise: 49900,
    compareAtPricePaise: 57500,
    ratingAverage: 4.8,
    ratingCount: 134,
    isAvailable: true,
    discountLabel: discountLabel(49900, 57500),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    badgeLabel: 'New',
    categoryId: CATEGORY_COOKIES,
    flavour: 'Hazelnut',
    egg: 'Eggless',
    description: 'Oversized cookies stuffed with hazelnut chocolate spread.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-cookie-lotus',
    name: 'Lotus Cookie',
    imageUrl: UI_TEST_IMAGES.lotusCookie,
    pricePaise: 49900,
    compareAtPricePaise: 57500,
    ratingAverage: 4.7,
    ratingCount: 88,
    isAvailable: true,
    discountLabel: discountLabel(49900, 57500),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_COOKIES,
    flavour: 'Biscoff',
    egg: 'Eggless',
    description: 'NYC cookies with Lotus Biscoff swirl.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-cookie-kinder',
    name: 'Kinder Cookie',
    imageUrl: UI_TEST_IMAGES.kinderCookie,
    pricePaise: 49900,
    compareAtPricePaise: 57500,
    ratingAverage: 4.6,
    ratingCount: 71,
    isAvailable: true,
    discountLabel: discountLabel(49900, 57500),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_COOKIES,
    flavour: 'Chocolate',
    egg: 'Eggless',
    description: 'NYC cookies with creamy chocolate pieces.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-cookie-coconut',
    name: 'Coconut Caramel Cookie',
    imageUrl: UI_TEST_IMAGES.coconutCookie,
    pricePaise: 45000,
    compareAtPricePaise: 52500,
    ratingAverage: 4.4,
    ratingCount: 46,
    isAvailable: true,
    discountLabel: discountLabel(45000, 52500),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_COOKIES,
    flavour: 'Coconut Caramel',
    egg: 'Eggless',
    description: 'Chewy coconut caramel NYC cookies.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-cookie-duo',
    name: 'Duo Black Cookie',
    imageUrl: UI_TEST_IMAGES.duoBlackCookie,
    pricePaise: 45000,
    compareAtPricePaise: 52500,
    ratingAverage: 4.5,
    ratingCount: 55,
    isAvailable: true,
    discountLabel: discountLabel(45000, 52500),
    hasRequiredOptions: false,
    weightLabel: '6 pc',
    categoryId: CATEGORY_COOKIES,
    flavour: 'Dark Chocolate',
    egg: 'Eggless',
    description: 'Two-tone dark cocoa NYC cookies.',
    optionGroups: TREAT_SIZE,
  },
  {
    id: 'prd-unavailable',
    name: 'Midnight Special Cake',
    imageUrl: UI_TEST_IMAGES.deathByChocolate,
    pricePaise: 79900,
    compareAtPricePaise: 89900,
    ratingAverage: 4.2,
    ratingCount: 18,
    isAvailable: false,
    discountLabel: discountLabel(79900, 89900),
    hasRequiredOptions: false,
    weightLabel: '500 g',
    categoryId: CATEGORY_PREMIUM,
    flavour: 'Dark Chocolate',
    egg: 'Eggless',
    description: 'Temporarily unavailable. Shown so sold-out and Notify states can be reviewed.',
  },
  {
    id: 'prd-balloons',
    name: 'Celebration Balloon Bunch',
    imageUrl: UI_TEST_IMAGES.balloons,
    pricePaise: 39900,
    ratingAverage: 4.5,
    ratingCount: 40,
    isAvailable: true,
    hasRequiredOptions: false,
    weightLabel: '1 set',
    categoryId: CATEGORY_BALLOONS,
    description: 'Helium-ready balloon bunch for cake tables.',
  },
  {
    id: 'prd-candles',
    name: 'Birthday Candle Set',
    imageUrl: UI_TEST_IMAGES.candles,
    pricePaise: 14900,
    ratingAverage: 4.6,
    ratingCount: 88,
    isAvailable: true,
    hasRequiredOptions: false,
    weightLabel: '12 pc',
    categoryId: CATEGORY_CANDLES,
    description: 'Assorted birthday candles for cakes.',
  },
  {
    id: 'prd-toppers',
    name: 'Cake Topper Set',
    imageUrl: UI_TEST_IMAGES.toppers,
    pricePaise: 19900,
    ratingAverage: 4.4,
    ratingCount: 29,
    isAvailable: true,
    hasRequiredOptions: false,
    weightLabel: '1 set',
    categoryId: CATEGORY_TOPPERS,
    description: 'Acrylic cake toppers for birthdays and anniversaries.',
  },
  {
    id: 'prd-flowers',
    name: 'Fresh Cake Flowers',
    imageUrl: UI_TEST_IMAGES.flowers,
    pricePaise: 29900,
    ratingAverage: 4.7,
    ratingCount: 22,
    isAvailable: true,
    hasRequiredOptions: false,
    weightLabel: '1 bunch',
    categoryId: CATEGORY_FLOWERS,
    description: 'Food-safe floral garnish for wedding and occasion cakes.',
  },
  {
    id: 'prd-party',
    name: 'Party Table Kit',
    imageUrl: UI_TEST_IMAGES.partyDecor,
    pricePaise: 49900,
    ratingAverage: 4.3,
    ratingCount: 17,
    isAvailable: true,
    hasRequiredOptions: false,
    weightLabel: '1 kit',
    categoryId: CATEGORY_PARTY,
    description: 'Table decor kit for cake cutting celebrations.',
  },
];

function findCategoryNode(
  id: string,
  nodes: CategoryNode[] = CATEGORIES,
): CategoryNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const nested = findCategoryNode(id, node.children ?? []);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

function collectCategoryIds(id: string): string[] {
  const node = findCategoryNode(id);
  if (!node) {
    return [id];
  }
  const ids = [node.id];
  for (const child of node.children ?? []) {
    ids.push(...collectCategoryIds(child.id));
  }
  return ids;
}

export function productSummary(product: FixtureProduct, wishlisted: boolean): ProductSummary {
  return {
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    pricePaise: product.pricePaise,
    compareAtPricePaise: product.compareAtPricePaise,
    ratingAverage: product.ratingAverage,
    ratingCount: product.ratingCount,
    isAvailable: product.isAvailable,
    discountLabel: product.discountLabel,
    isPremium: product.isPremium,
    isWishlisted: wishlisted,
    hasRequiredOptions: product.hasRequiredOptions,
    weightLabel: product.weightLabel,
    badgeLabel: product.badgeLabel,
  };
}

export function allProducts(): FixtureProduct[] {
  return RAW_PRODUCTS;
}

export function findProduct(id: string): FixtureProduct | undefined {
  return RAW_PRODUCTS.find((item) => item.id === id);
}

export function productsForCategory(categoryId: string): FixtureProduct[] {
  const ids = new Set(collectCategoryIds(categoryId));
  return RAW_PRODUCTS.filter((item) => ids.has(item.categoryId));
}

export function searchProducts(query: string): FixtureProduct[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    return [];
  }
  return RAW_PRODUCTS.filter(
    (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
  );
}

function uniqueFilterOptions(values: (string | undefined | null)[]) {
  const seen = new Set<string>();
  const options: { id: string; label: string; value: string }[] = [];
  for (const value of values) {
    const label = value?.trim();
    if (!label || seen.has(label)) {
      continue;
    }
    seen.add(label);
    options.push({
      id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label,
      value: label,
    });
  }
  return options.sort((a, b) => a.label.localeCompare(b.label));
}

export function applyCatalogFilters(
  products: FixtureProduct[],
  params: Record<string, string>,
): FixtureProduct[] {
  const priceMin = Number(params.priceMin);
  const priceMax = Number(params.priceMax);
  const subcategory = params.subcategory?.trim();
  const flavour = params.flavour?.trim().toLowerCase();
  const egg = params.egg?.trim().toLowerCase();
  const weight = params.weight?.trim().toLowerCase();

  return products.filter((item) => {
    if (Number.isFinite(priceMin) && item.pricePaise < priceMin) {
      return false;
    }
    if (Number.isFinite(priceMax) && item.pricePaise > priceMax) {
      return false;
    }
    if (subcategory && item.categoryId !== subcategory) {
      return false;
    }
    if (flavour && (item.flavour ?? '').toLowerCase() !== flavour) {
      return false;
    }
    if (egg && (item.egg ?? '').toLowerCase() !== egg) {
      return false;
    }
    if (weight && (item.weightLabel ?? '').toLowerCase() !== weight) {
      return false;
    }
    return true;
  });
}

function categoryName(id: string): string {
  return findCategoryNode(id)?.name ?? 'Cakes';
}

export function categoryDisplayName(id: string): string {
  return categoryName(id);
}

function highlightsFor(product: FixtureProduct): ProductHighlight[] {
  if (product.highlights?.length) {
    return product.highlights;
  }
  return [
    { label: 'Product Type', value: categoryName(product.categoryId) },
    { label: 'Flavour', value: product.flavour ?? 'Signature GUNUCO' },
    { label: 'Egg', value: product.egg ?? 'Eggless available' },
    { label: 'Weight', value: product.weightLabel ?? '500 g' },
    { label: 'Suitable For', value: 'Birthday / Celebration' },
  ];
}

export function productDetailPayload(product: FixtureProduct, wishlisted: boolean): ProductDetail {
  const images = (product.images ?? [product.imageUrl]).filter(Boolean) as string[];
  return {
    ...productSummary(product, wishlisted),
    description: product.description,
    images: images.map((url, index) => ({
      id: `${product.id}-img-${index + 1}`,
      url,
      alt: `${product.name} photo ${index + 1}`,
    })),
    availabilityStatus: product.isAvailable === false ? 'UNAVAILABLE' : 'AVAILABLE',
    availabilityLabel:
      product.isAvailable === false ? 'Currently unavailable' : 'Preorder · fresh baked to order',
    quantityMin: 1,
    quantityMax: 5,
    highlights: highlightsFor(product),
    infoSections: [
      {
        title: 'Information',
        body: 'Images are for representation. Actual garnish may vary slightly with fresh bake. Made in a bakery that also handles nuts, gluten, and dairy.',
      },
      {
        title: 'Customization Details',
        body: product.optionGroups?.length
          ? 'Choose flavour, flour, egg or eggless, sweetener, and weight. Price updates as you customise.'
          : 'This item is packed as shown. No extra customisation is required.',
      },
      {
        title: 'Delivery Information',
        body: 'Same-day delivery where slots are open. Wedding and anniversary cakes follow the catalogue lead time shown at checkout.',
      },
      {
        title: 'Bakery Information',
        body: 'Seller: GUNUCO Bakery — HITEC City, Hyderabad. Customer care: hello@gunuco.example',
      },
    ],
    optionGroups: product.optionGroups,
    category: { id: product.categoryId, name: categoryName(product.categoryId) },
    offer:
      product.discountLabel != null
        ? { title: product.discountLabel, subtitle: 'Auto-applied catalogue price' }
        : null,
  };
}

export function productOptionsPayload(product: FixtureProduct): ProductOptionsResponse {
  return { groups: product.optionGroups ?? [] };
}

export function homePayload(
  wishlisted: (id: string) => boolean,
  unread: number,
  empty: boolean,
): HomeResponse {
  if (empty) {
    return {
      deliveryContext: { label: 'HITEC City, Hyderabad', isServiceable: true },
      banners: [],
      mainCategories: [],
      cakeCategories: [],
      subcategories: [],
      featuredProducts: [],
      bestSellers: [],
      offers: [],
      recommendedProducts: [],
      productSections: [],
      unreadNotificationCount: 0,
    };
  }
  const toSummaries = (categoryId: string, limit = 6) =>
    productsForCategory(categoryId)
      .slice(0, limit)
      .map((item) => productSummary(item, wishlisted(item.id)));

  const featured = toSummaries(CATEGORY_PREMIUM, 8);
  const coolCakes = toSummaries(CATEGORY_CASUAL, 6);
  const cheeseCakes = toSummaries(CATEGORY_CHEESECAKE, 6);
  const decorators = toSummaries(CATEGORY_DECORATIONS, 12);
  const best = RAW_PRODUCTS.filter((item) => item.badgeLabel === 'Bestseller').map((item) =>
    productSummary(item, wishlisted(item.id)),
  );
  const recommended = RAW_PRODUCTS.filter((item) =>
    [CATEGORY_CASUAL, CATEGORY_BROWNIES, CATEGORY_COOKIES].includes(item.categoryId),
  )
    .slice(0, 8)
    .map((item) => productSummary(item, wishlisted(item.id)));
  const cakesRoot = findCategoryNode(CATEGORY_CAKES);
  const cakeCategories =
    cakesRoot?.children
      ?.filter((item) => item.isActive !== false)
      .map((category) => ({
        id: category.id,
        name: category.name,
        imageUrl: category.imageUrl,
        productCount: category.productCount,
      })) ?? [];
  const flavourCategories = [
    ...(findCategoryNode(CATEGORY_BROWNIES_COOKIES)?.children ?? []),
    ...(findCategoryNode(CATEGORY_DECORATIONS)?.children ?? []),
  ]
    .filter((item) => item.isActive !== false)
    .slice(0, 8)
    .map((category) => ({
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl,
      productCount: category.productCount,
    }));
  const banners: HomeBanner[] = [
    {
      id: 'ban-1',
      title: 'Fresh cakes, baked to order',
      imageUrl: UI_TEST_IMAGES.bannerCakes,
      linkType: 'category',
      linkId: CATEGORY_PREMIUM,
    },
    {
      id: 'ban-2',
      title: 'Wedding & anniversary collection',
      imageUrl: UI_TEST_IMAGES.bannerWedding,
      linkType: 'category',
      linkId: CATEGORY_WEDDING,
    },
    {
      id: 'ban-3',
      title: 'NYC Cookies, nationwide style',
      imageUrl: UI_TEST_IMAGES.bannerCookies,
      linkType: 'category',
      linkId: CATEGORY_COOKIES,
    },
  ];
  const offers: HomeOffer[] = [
    {
      id: 'off-1',
      title: 'Weekend bake offer',
      subtitle: 'Save on Premium Cakes this week',
      badgeLabel: 'Offer',
      imageUrl: UI_TEST_IMAGES.offerTreats,
    },
    {
      id: 'off-2',
      title: 'Cookie box deal',
      subtitle: 'NYC Cookies from ₹425',
      badgeLabel: 'Offer',
      imageUrl: UI_TEST_IMAGES.chocoChipCookie,
    },
    {
      id: 'off-3',
      title: 'Decorator specials',
      subtitle: 'Balloons & toppers starting ₹48',
      badgeLabel: 'Offer',
      imageUrl: UI_TEST_IMAGES.partyDecor,
    },
  ];
  return {
    deliveryContext: { label: '54-2, Bharathinagar, Vijayawada, 520008', isServiceable: true },
    banners,
    mainCategories: CATEGORIES.map((category) => ({
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl,
      productCount: category.productCount,
    })),
    cakeCategories,
    subcategories: flavourCategories.length
      ? flavourCategories
      : [
          { id: CATEGORY_PREMIUM, name: 'Premium Cakes', imageUrl: UI_TEST_IMAGES.catPremium },
          { id: CATEGORY_CHEESECAKE, name: 'Cheesecakes', imageUrl: UI_TEST_IMAGES.catCheesecake },
          { id: CATEGORY_BROWNIES, name: 'Brownies', imageUrl: UI_TEST_IMAGES.catBrownies },
          { id: CATEGORY_COOKIES, name: 'NYC Cookies', imageUrl: UI_TEST_IMAGES.catCookies },
          { id: CATEGORY_WEDDING, name: 'Wedding', imageUrl: UI_TEST_IMAGES.catWedding },
          { id: CATEGORY_OCCASION, name: 'Occasion', imageUrl: UI_TEST_IMAGES.catOccasion },
        ],
    featuredProducts: featured,
    bestSellers: best.length ? best : featured,
    offers,
    recommendedProducts: recommended,
    productSections: [
      {
        id: 'sec-premium',
        title: 'Premium Cakes',
        categoryId: CATEGORY_PREMIUM,
        products: featured.slice(0, 6),
      },
      {
        id: 'sec-cool',
        title: 'Cool Cakes',
        categoryId: CATEGORY_CASUAL,
        products: coolCakes,
      },
      {
        id: 'sec-cheese',
        title: 'Cheese Cakes',
        categoryId: CATEGORY_CHEESECAKE,
        products: cheeseCakes,
      },
      {
        id: 'sec-decorators',
        title: 'Decorators',
        categoryId: CATEGORY_DECORATIONS,
        products: decorators,
      },
    ],
    unreadNotificationCount: unread,
  };
}

export function catalogFilters() {
  const prices = RAW_PRODUCTS.map((item) => item.pricePaise);
  return {
    availableFilters: [
      {
        id: 'price',
        label: 'Price',
        type: 'range' as const,
        minPaise: Math.min(...prices),
        maxPaise: Math.max(...prices),
      },
      {
        id: 'flavour',
        label: 'Flavour',
        type: 'single' as const,
        options: uniqueFilterOptions(RAW_PRODUCTS.map((item) => item.flavour)),
      },
      {
        id: 'egg',
        label: 'Egg',
        type: 'single' as const,
        options: uniqueFilterOptions(RAW_PRODUCTS.map((item) => item.egg)),
      },
      {
        id: 'weight',
        label: 'Weight',
        type: 'single' as const,
        options: uniqueFilterOptions(RAW_PRODUCTS.map((item) => item.weightLabel)),
      },
    ],
    availableSorts: [
      { id: 'popular', label: 'Popular' },
      { id: 'price_asc', label: 'Price: Low to High' },
      { id: 'price_desc', label: 'Price: High to Low' },
      { id: 'newest', label: 'Newest' },
    ],
  };
}

export function seedReviews(productId: string): ProductReview[] {
  return [
    {
      id: `${productId}-rev-1`,
      rating: 5,
      text: 'Fresh, rich, and delivered on time.',
      createdAt: '2026-07-12T10:00:00.000Z',
      createdAtLabel: '12 Jul 2026',
      reviewerDisplayName: 'A. K.',
    },
    {
      id: `${productId}-rev-2`,
      rating: 4,
      text: 'Loved the frosting. Would order again.',
      createdAt: '2026-06-02T10:00:00.000Z',
      createdAtLabel: '2 Jun 2026',
      reviewerDisplayName: 'S. R.',
    },
    {
      id: `${productId}-rev-3`,
      rating: 5,
      text: 'Perfect for a birthday at home.',
      createdAt: '2026-05-18T10:00:00.000Z',
      createdAtLabel: '18 May 2026',
      reviewerDisplayName: 'M. P.',
    },
  ];
}

export const LEGAL_COPY: Record<LegalType, { title: string; content: string }> = {
  terms: {
    title: 'Terms & Conditions',
    content:
      'These are UI-test Terms for GUNUCO. This is synthetic markdown for LegalDocumentView. Not a live legal document.',
  },
  privacy: {
    title: 'Privacy Policy',
    content:
      'UI-test Privacy Policy. GUNUCO does not collect real customer data in UI test mode. Synthetic content only.',
  },
  refund: {
    title: 'Refund Policy',
    content: 'UI-test Refund Policy. Refunds in this mode are simulated and never move real money.',
  },
  cancellation: {
    title: 'Cancellation Policy',
    content:
      'UI-test Cancellation Policy. Eligibility is returned by the mock order APIs, not calculated on the client.',
  },
};

export const PICKUP_INFO = {
  name: 'GUNUCO Bakery — HITEC City',
  address: 'Plot 12, HITEC City, Hyderabad 500081',
  instructions: 'Ask for GUNUCO pickup at the bakery counter.',
  hours: '10:00 AM – 10:00 PM',
  phone: '9000000099',
  lat: 17.4486,
  lng: 78.3908,
};

export const DEFAULT_ADDRESS_A = {
  id: 'addr-a-home',
  addressType: 'Home' as const,
  name: 'Home',
  phone: '9000000001',
  house: 'Padmavathi Nilayam, 4th Floor',
  street: 'Sri Nagar Colony Road',
  area: 'HITEC City',
  landmark: 'Near Cyber Towers',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500081',
  lat: 17.4486,
  lng: 78.3908,
  isDefault: true,
  distanceKm: 5.7,
};

export const DEFAULT_ADDRESS_B = {
  id: 'addr-b-home',
  addressType: 'Home' as const,
  name: 'Home',
  phone: '9000000002',
  house: '88',
  street: 'Banjara Hills Road',
  area: 'Banjara Hills',
  landmark: 'Near City Center',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500034',
  lat: 17.414,
  lng: 78.435,
  isDefault: true,
  distanceKm: 8.2,
};

export const OFFICE_ADDRESS_A = {
  id: 'addr-a-office',
  addressType: 'Office' as const,
  name: 'Work',
  phone: '9000000001',
  house: 'Floor 4',
  street: 'Mindspace',
  area: 'Madhapur',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500081',
  lat: 17.441,
  lng: 78.391,
  isDefault: false,
  distanceKm: 1.4,
};

export const OTHER_ADDRESS_A = {
  id: 'addr-a-other',
  addressType: 'Other' as const,
  name: 'Other',
  phone: '9000000001',
  house: 'Villa 9',
  street: 'Hitech City Road',
  area: 'Gachibowli',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500032',
  lat: 17.44,
  lng: 78.348,
  isDefault: false,
  distanceKm: 3.2,
};

export function isServiceablePoint(lat: number, lng: number): boolean {
  return lat >= 17.2 && lat <= 17.6 && lng >= 78.2 && lng <= 78.6;
}

export const DELIVERY_FEE_PAISE = 4900;
export const COUPON_CODE = 'GUNUCO10';
export const TAX_BPS = 500;
export const UI_TEST_RAZORPAY_KEY = 'rzp_test_ui_mode';
