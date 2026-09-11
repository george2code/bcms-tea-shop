import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { EnumOrderStatus } from '../generated/prisma/enums';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

const IMG = {
  sencha:
    'https://images.unsplash.com/photo-1556679343-c7306c197480?w=800&q=80',
  leaves:
    'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80',
  cup: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
  matcha:
    'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80',
  pot: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3009?w=800&q=80',
  herbal:
    'https://images.unsplash.com/photo-1597314052574-54f5ab65d4a3?w=800&q=80',
  white:
    'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=800&q=80',
  oolong:
    'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&q=80',
  puerh:
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
  steam:
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
  tin: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80',
};

function daysAgo(days: number, hour = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 15, 0, 0);
  return date;
}

function pickUserId(userIds: string[], index: number): string | null {
  if (userIds.length === 0) {
    return null;
  }
  return userIds[index % userIds.length];
}

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, name: true },
  });

  const userIds = users.map((user) => user.id);
  const ownerId = userIds[0] ?? null;

  console.log(
    users.length
      ? `Linking catalog to ${users.length} existing user(s); users table will not be changed.`
      : 'No users found. Seeding catalog without user relations.',
  );

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.color.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();

  const store = await prisma.store.create({
    data: {
      title: 'Leaf & Steam',
      description:
        'A small-batch tea house with seasonal greens, classic blacks, and ceremonial matcha.',
      userId: ownerId,
    },
  });

  const techFarmOwnerId = 'cmsohixpq0000tkuyzg5qxcc6';
  const techFarmOwner = users.find((user) => user.id === techFarmOwnerId);

  if (!techFarmOwner) {
    throw new Error(
      `Cannot seed Tech Farm: user ${techFarmOwnerId} was not found.`,
    );
  }

  const techFarm = await prisma.store.create({
    data: {
      title: 'Tech Farm',
      description: 'Hardware, tools, and workshop supplies.',
      userId: techFarmOwnerId,
    },
  });

  const [green, black, oolong, white, puerh, herbal, matcha] =
    await prisma.$transaction([
      prisma.category.create({
        data: {
          title: 'Green Tea',
          description:
            'Steamed or pan-fired leaves with a fresh, vegetal character.',
          storeId: store.id,
        },
      }),
      prisma.category.create({
        data: {
          title: 'Black Tea',
          description: 'Fully oxidized teas for breakfast cups and afternoon blends.',
          storeId: store.id,
        },
      }),
      prisma.category.create({
        data: {
          title: 'Oolong',
          description: 'Partially oxidized teas ranging from floral to roasted.',
          storeId: store.id,
        },
      }),
      prisma.category.create({
        data: {
          title: 'White Tea',
          description: 'Minimally processed buds and leaves with a delicate finish.',
          storeId: store.id,
        },
      }),
      prisma.category.create({
        data: {
          title: 'Pu-erh',
          description: 'Aged and fermented teas from Yunnan with earthy depth.',
          storeId: store.id,
        },
      }),
      prisma.category.create({
        data: {
          title: 'Herbal',
          description: 'Caffeine-free botanicals for evening and wellness cups.',
          storeId: store.id,
        },
      }),
      prisma.category.create({
        data: {
          title: 'Matcha',
          description: 'Stone-milled Japanese green tea powder for whisking.',
          storeId: store.id,
        },
      }),
    ]);

  const [jade, amber, charcoal, ivory, crimson, forest, gold] =
    await prisma.$transaction([
      prisma.color.create({
        data: { name: 'Jade', value: '#3D6B4F', storeId: store.id },
      }),
      prisma.color.create({
        data: { name: 'Amber', value: '#C4A35A', storeId: store.id },
      }),
      prisma.color.create({
        data: { name: 'Charcoal', value: '#2F2F2F', storeId: store.id },
      }),
      prisma.color.create({
        data: { name: 'Ivory', value: '#F3EDE1', storeId: store.id },
      }),
      prisma.color.create({
        data: { name: 'Crimson', value: '#8C2F39', storeId: store.id },
      }),
      prisma.color.create({
        data: { name: 'Forest', value: '#1F4D3A', storeId: store.id },
      }),
      prisma.color.create({
        data: { name: 'Gold', value: '#D4A017', storeId: store.id },
      }),
    ]);

  const favoriteUserId = ownerId;

  const products = await prisma.$transaction([
    prisma.product.create({
      data: {
        title: 'Uji Sencha',
        description:
          'First-flush sencha from Uji with steamed spinach notes and a sweet finish. 50 g.',
        price: 349,
        images: [IMG.sencha, IMG.leaves],
        storeId: store.id,
        categoryId: green.id,
        colorId: jade.id,
        userId: favoriteUserId,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Dragon Well Longjing',
        description:
          'Pan-fired West Lake longjing with toasted chestnut aroma and a flat leaf shape. 50 g.',
        price: 429,
        images: [IMG.leaves, IMG.cup],
        storeId: store.id,
        categoryId: green.id,
        colorId: forest.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Gyokuro Shade-Grown',
        description:
          'Three weeks under shade before harvest. Brothy umami and marine sweetness. 40 g.',
        price: 890,
        images: [IMG.sencha, IMG.steam],
        storeId: store.id,
        categoryId: green.id,
        colorId: jade.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Assam Breakfast',
        description:
          'Malty second-flush Assam that stands up to milk and a morning pot. 100 g.',
        price: 279,
        images: [IMG.pot, IMG.tin],
        storeId: store.id,
        categoryId: black.id,
        colorId: charcoal.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Earl Grey Bergamot',
        description:
          'Ceylon black tea scented with cold-pressed bergamot oil. Bright and citrusy. 80 g.',
        price: 319,
        images: [IMG.cup, IMG.pot],
        storeId: store.id,
        categoryId: black.id,
        colorId: gold.id,
        userId: favoriteUserId,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Darjeeling First Flush',
        description:
          'Muscatel first flush from a high-elevation garden. Floral, light, and brisk. 50 g.',
        price: 459,
        images: [IMG.leaves, IMG.steam],
        storeId: store.id,
        categoryId: black.id,
        colorId: amber.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Tie Guan Yin',
        description:
          'Lightly oxidized Anxi oolong with orchid aroma and a lingering finish. 50 g.',
        price: 389,
        images: [IMG.oolong, IMG.cup],
        storeId: store.id,
        categoryId: oolong.id,
        colorId: ivory.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Dong Ding',
        description:
          'Taiwanese oolong with a gentle roast, honeyed body, and mineral aftertaste. 50 g.',
        price: 520,
        images: [IMG.oolong, IMG.tin],
        storeId: store.id,
        categoryId: oolong.id,
        colorId: amber.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Bai Mu Dan',
        description:
          'White peony with plump buds and leaves. Apricot sweetness and a soft mouthfeel. 40 g.',
        price: 399,
        images: [IMG.white, IMG.leaves],
        storeId: store.id,
        categoryId: white.id,
        colorId: ivory.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Silver Needle',
        description:
          'Fuding bai hao yin zhen. Silvery buds, melon notes, and a long pale liquor. 30 g.',
        price: 749,
        images: [IMG.white, IMG.steam],
        storeId: store.id,
        categoryId: white.id,
        colorId: ivory.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Ripe Pu-erh Cake',
        description:
          'Shou pu-erh pressed in Yunnan. Earthy, smooth, and excellent for multiple steeps. 357 g.',
        price: 560,
        images: [IMG.puerh, IMG.tin],
        storeId: store.id,
        categoryId: puerh.id,
        colorId: charcoal.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Chamomile Blossom',
        description:
          'Whole Egyptian chamomile flowers. Apple-honey aroma for late evenings. 60 g.',
        price: 249,
        images: [IMG.herbal, IMG.cup],
        storeId: store.id,
        categoryId: herbal.id,
        colorId: gold.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Peppermint Leaf',
        description:
          'Cut peppermint from Oregon farms. Cooling, clean, and naturally caffeine-free. 60 g.',
        price: 229,
        images: [IMG.herbal, IMG.leaves],
        storeId: store.id,
        categoryId: herbal.id,
        colorId: forest.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Ceremonial Matcha',
        description:
          'Stone-milled first-harvest tencha. Whisked thick or thin, with a vivid jade foam. 40 g.',
        price: 1290,
        images: [IMG.matcha, IMG.sencha],
        storeId: store.id,
        categoryId: matcha.id,
        colorId: jade.id,
        userId: favoriteUserId,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Culinary Matcha',
        description:
          'Second-harvest powder for lattes, baking, and iced drinks. Balanced and vivid. 80 g.',
        price: 489,
        images: [IMG.matcha, IMG.cup],
        storeId: store.id,
        categoryId: matcha.id,
        colorId: forest.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Keemun Mao Feng',
        description:
          'Anhui black tea with cocoa and orchid notes. Smooth enough to drink plain. 80 g.',
        price: 339,
        images: [IMG.pot, IMG.leaves],
        storeId: store.id,
        categoryId: black.id,
        colorId: crimson.id,
      },
    }),
  ]);

  const [
    ujiSencha,
    longjing,
    gyokuro,
    assam,
    earlGrey,
    darjeeling,
    tieGuanYin,
    dongDing,
    baiMuDan,
    silverNeedle,
    ripePuerh,
    chamomile,
    peppermint,
    ceremonialMatcha,
    culinaryMatcha,
    keemun,
  ] = products;

  const reviewRows = [
    {
      text: 'The Uji sencha is exactly what I wanted — sweet, grassy, and never bitter if you keep the water under 80°C.',
      rating: 5,
      productId: ujiSencha.id,
    },
    {
      text: 'Dragon Well arrived very fresh. Chestnut aroma is strong on the first steep.',
      rating: 5,
      productId: longjing.id,
    },
    {
      text: 'Gyokuro is a splurge, but the umami is restaurant-level. Will reorder for guests.',
      rating: 5,
      productId: gyokuro.id,
    },
    {
      text: 'Solid breakfast Assam. A little brisk without milk, perfect with it.',
      rating: 4,
      productId: assam.id,
    },
    {
      text: 'Bergamot is natural, not perfume-y. Makes a great iced tea as well.',
      rating: 5,
      productId: earlGrey.id,
    },
    {
      text: 'First flush Darjeeling was lighter than I expected. Nice, just not as muscatel as last year.',
      rating: 4,
      productId: darjeeling.id,
    },
    {
      text: 'Tie Guan Yin opened up on the third infusion. Floral and very clean.',
      rating: 5,
      productId: tieGuanYin.id,
    },
    {
      text: 'Dong Ding has a gentle roast that does not hide the honey note. Excellent gongfu tea.',
      rating: 5,
      productId: dongDing.id,
    },
    {
      text: 'Chamomile flowers are whole and fragrant. One teaspoon is enough for a large mug.',
      rating: 4,
      productId: chamomile.id,
    },
    {
      text: 'Ceremonial matcha whisks into a thick foam with almost no bitterness. Worth the price.',
      rating: 5,
      productId: ceremonialMatcha.id,
    },
    {
      text: 'Culinary grade is fine in lattes but a bit dusty on its own. Still a fair everyday tin.',
      rating: 3,
      productId: culinaryMatcha.id,
    },
  ];

  await prisma.review.createMany({
    data: reviewRows.map((review, index) => ({
      ...review,
      storeId: store.id,
      userId: pickUserId(userIds, index + 1),
    })),
  });

  const orderSpecs: Array<{
    daysAgo: number;
    hour: number;
    status: EnumOrderStatus;
    userIndex: number;
    items: Array<{ product: (typeof products)[number]; quantity: number }>;
  }> = [
    {
      daysAgo: 1,
      hour: 10,
      status: EnumOrderStatus.PAYED,
      userIndex: 0,
      items: [
        { product: ujiSencha, quantity: 2 },
        { product: ceremonialMatcha, quantity: 1 },
      ],
    },
    {
      daysAgo: 2,
      hour: 18,
      status: EnumOrderStatus.PAYED,
      userIndex: 1,
      items: [
        { product: earlGrey, quantity: 1 },
        { product: chamomile, quantity: 2 },
      ],
    },
    {
      daysAgo: 4,
      hour: 11,
      status: EnumOrderStatus.PENDING,
      userIndex: 2,
      items: [{ product: gyokuro, quantity: 1 }],
    },
    {
      daysAgo: 6,
      hour: 15,
      status: EnumOrderStatus.PAYED,
      userIndex: 0,
      items: [
        { product: dongDing, quantity: 1 },
        { product: tieGuanYin, quantity: 1 },
      ],
    },
    {
      daysAgo: 8,
      hour: 9,
      status: EnumOrderStatus.PAYED,
      userIndex: 1,
      items: [
        { product: assam, quantity: 3 },
        { product: keemun, quantity: 1 },
      ],
    },
    {
      daysAgo: 11,
      hour: 16,
      status: EnumOrderStatus.PAYED,
      userIndex: 3,
      items: [
        { product: silverNeedle, quantity: 1 },
        { product: baiMuDan, quantity: 1 },
      ],
    },
    {
      daysAgo: 14,
      hour: 12,
      status: EnumOrderStatus.PAYED,
      userIndex: 2,
      items: [
        { product: culinaryMatcha, quantity: 2 },
        { product: peppermint, quantity: 1 },
      ],
    },
    {
      daysAgo: 18,
      hour: 19,
      status: EnumOrderStatus.PAYED,
      userIndex: 0,
      items: [
        { product: ripePuerh, quantity: 1 },
        { product: longjing, quantity: 1 },
      ],
    },
    {
      daysAgo: 22,
      hour: 8,
      status: EnumOrderStatus.PAYED,
      userIndex: 1,
      items: [{ product: darjeeling, quantity: 2 }],
    },
    {
      daysAgo: 27,
      hour: 14,
      status: EnumOrderStatus.PENDING,
      userIndex: 4,
      items: [
        { product: ujiSencha, quantity: 1 },
        { product: chamomile, quantity: 1 },
        { product: peppermint, quantity: 1 },
      ],
    },
  ];

  for (const spec of orderSpecs) {
    const items = spec.items.map((item) => ({
      quantity: item.quantity,
      price: item.product.price,
      productId: item.product.id,
      storeId: store.id,
    }));
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    await prisma.order.create({
      data: {
        status: spec.status,
        total,
        userId: pickUserId(userIds, spec.userIndex),
        createdAt: daysAgo(spec.daysAgo, spec.hour),
        items: { create: items },
      },
    });
  }

  const counts = {
    stores: await prisma.store.count(),
    categories: await prisma.category.count(),
    colors: await prisma.color.count(),
    products: await prisma.product.count(),
    reviews: await prisma.review.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    users: await prisma.user.count(),
  };

  console.log('Seed complete:', counts);
  console.log(`Store id: ${store.id}`);
  console.log(`Tech Farm store id: ${techFarm.id} (owner ${techFarmOwnerId})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
