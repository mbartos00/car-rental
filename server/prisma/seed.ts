import {
  CarType,
  Gearbox,
  PrismaClient,
  ReservationStatus,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const LOCATIONS = ['Warsaw', 'Cracow', 'Gdansk', 'Wroclaw', 'Poznan'];

const PROMO_CODES = [
  { code: 'SUMMER10', discountPercent: 10, active: true },
  { code: 'WELCOME15', discountPercent: 15, active: true },
  { code: 'MORENT20', discountPercent: 20, active: true },
  { code: 'SPRING5', discountPercent: 5, active: false },
];

const USERS = [
  {
    email: 'demo@morent.dev',
    firstName: 'Demo',
    lastName: 'User',
    password: 'Demo1234!',
    role: Role.USER,
  },
  {
    email: 'admin@morent.dev',
    firstName: 'Morent',
    lastName: 'Admin',
    password: 'Admin1234!',
    role: Role.ADMIN,
  },
  {
    email: 'anna.kowalska@morent.dev',
    firstName: 'Anna',
    lastName: 'Kowalska',
    password: 'Seed1234!',
    role: Role.USER,
  },
  {
    email: 'piotr.nowak@morent.dev',
    firstName: 'Piotr',
    lastName: 'Nowak',
    password: 'Seed1234!',
    role: Role.USER,
  },
  {
    email: 'marta.wisniewska@morent.dev',
    firstName: 'Marta',
    lastName: 'Wisniewska',
    password: 'Seed1234!',
    role: Role.USER,
  },
];

const CARS = [
  {
    name: 'BMW M4 Coupe',
    description:
      'A twin-turbo straight-six coupe that mixes daily comfort with serious track ability. Carbon accents and an M-tuned chassis included.',
    price: 189,
    carType: CarType.COUPE,
    gearbox: Gearbox.AUTOMATIC,
    seats: 4,
    tankCapacity: 59,
    images: [
      img('1676761136448-d160bcd84ddc'),
      img('1676761136574-9115492da2bf'),
      img('1676761136486-3d5aaa4773cb'),
      img('1676761136587-e9443fbd5273'),
    ],
  },
  {
    name: 'Porsche 911 Carrera S',
    description:
      'The definitive sports car. Rear-engined balance, a howling flat-six and a cabin trimmed in tan leather make every trip an event.',
    price: 249,
    carType: CarType.COUPE,
    gearbox: Gearbox.AUTOMATIC,
    seats: 4,
    tankCapacity: 64,
    images: [
      img('1680530943234-5a228d5feacd'),
      img('1680530943583-9b0db80fac69'),
      img('1680530943423-e36b8864e8d8'),
      img('1680530943577-abad91aa2e0e'),
    ],
  },
  {
    name: 'Range Rover Sport SVR',
    description:
      'A supercharged V8 luxury SUV that hauls five people in first-class comfort and still embarrasses hot hatches at the lights.',
    price: 199,
    carType: CarType.SUV,
    gearbox: Gearbox.AUTOMATIC,
    seats: 5,
    tankCapacity: 105,
    images: [
      img('1679506640602-0144b3bb5053'),
      img('1679506640605-acaa4c7d46ed'),
      img('1679506640617-e429ddc31e52'),
      img('1679506640597-1829760d011b'),
    ],
  },
  {
    name: 'Jeep Gladiator Rubicon',
    description:
      'Part Wrangler, part pickup, all adventure. Solid axles, chunky tyres and an open-air cabin for weekends far away from tarmac.',
    price: 119,
    carType: CarType.SUV,
    gearbox: Gearbox.MANUAL,
    seats: 5,
    tankCapacity: 83,
    images: [
      img('1636880813869-911745da9ab2'),
      img('1636880833826-e9da83c336e0'),
      img('1636880827805-adbc35b7c69d'),
      img('1636880817403-4ea20b68d54e'),
    ],
  },
  {
    name: 'Volkswagen Golf GTI Mk2',
    description:
      'A lovingly kept classic hot hatch. Light, analogue and endlessly charming — the way driving used to feel, with a proper manual box.',
    price: 69,
    carType: CarType.HATCHBACK,
    gearbox: Gearbox.MANUAL,
    seats: 5,
    tankCapacity: 55,
    images: [
      img('1564988190342-4976fa6445c9'),
      img('1564988190124-bbe5ee340e29'),
      img('1564988190211-cfee63481d3a'),
      img('1564988190168-b73c4ca6d0ed'),
    ],
  },
  {
    name: 'Audi RS3 Sportback',
    description:
      'A five-cylinder pocket rocket with quattro grip. Practical hatchback body, four-hundred horsepower character.',
    price: 159,
    carType: CarType.HATCHBACK,
    gearbox: Gearbox.AUTOMATIC,
    seats: 5,
    tankCapacity: 55,
    images: [
      img('1752033039267-3e6ce5e12c65'),
      img('1752033038783-fbe2a3262319'),
      img('1752033038700-77c05340e6f9'),
      img('1752803593639-41c71403973d'),
    ],
  },
  {
    name: 'Mazda MX-5 Roadster',
    description:
      'Top down, revs up. The featherweight roadster that proves you do not need big power to have an unforgettable drive.',
    price: 89,
    carType: CarType.CONVERTIBLE,
    gearbox: Gearbox.MANUAL,
    seats: 2,
    tankCapacity: 45,
    images: [
      img('1705769946326-870b90753fbb'),
      img('1705769943125-4a8bf2ca3add'),
      img('1705769940669-9f0dcf0057ff'),
      img('1705769939334-1ec8632f5c60'),
    ],
  },
  {
    name: 'Ford Mustang Convertible',
    description:
      'American open-top cruising with a soft top that drops for sunny days. Effortless, relaxed and full of character.',
    price: 99,
    carType: CarType.CONVERTIBLE,
    gearbox: Gearbox.MANUAL,
    seats: 4,
    tankCapacity: 60,
    images: [
      img('1759187875422-b1270c3d1c05'),
      img('1759187875416-5c652c2e89f2'),
      img('1759187875415-328469ac908d'),
    ],
  },
  {
    name: 'Mercedes-Benz C-Class',
    description:
      'A serene executive sedan with an S-Class-inspired cabin. Quiet, composed and ideal for long business trips.',
    price: 139,
    carType: CarType.SEDAN,
    gearbox: Gearbox.AUTOMATIC,
    seats: 5,
    tankCapacity: 66,
    images: [
      img('1722088386522-7cafb8a7e234'),
      img('1722088353797-ddfe6e2faf34'),
      img('1722088354368-5fc810337f77'),
      img('1722088353797-854b8600d97a'),
    ],
  },
  {
    name: 'BMW M340i',
    description:
      'The sweet spot of the 3 Series range: silky straight-six power, xDrive traction and genuine four-door practicality.',
    price: 169,
    carType: CarType.SEDAN,
    gearbox: Gearbox.AUTOMATIC,
    seats: 5,
    tankCapacity: 59,
    images: [
      img('1759428115996-42d06c895664'),
      img('1759428132279-ce620fa51047'),
      img('1759428174389-f1741ded6ac6'),
      img('1759428148883-9bde8c93d9bc'),
    ],
  },
];

const REVIEWS: {
  email: string;
  car: string;
  rating: number;
  description: string;
}[] = [
  {
    email: 'anna.kowalska@morent.dev',
    car: 'Porsche 911 Carrera S',
    rating: 5,
    description: 'Absolute dream to drive, pickup and drop-off were seamless.',
  },
  {
    email: 'piotr.nowak@morent.dev',
    car: 'Porsche 911 Carrera S',
    rating: 5,
    description: 'Worth every penny. The car was spotless and full of fuel.',
  },
  {
    email: 'marta.wisniewska@morent.dev',
    car: 'Porsche 911 Carrera S',
    rating: 4,
    description:
      'Fantastic weekend car, though visibility takes getting used to.',
  },
  {
    email: 'anna.kowalska@morent.dev',
    car: 'BMW M4 Coupe',
    rating: 5,
    description:
      'Brutally fast yet comfortable on the motorway. Would rent again.',
  },
  {
    email: 'piotr.nowak@morent.dev',
    car: 'BMW M4 Coupe',
    rating: 4,
    description: 'Great condition and a lovely engine note. Firm ride in town.',
  },
  {
    email: 'marta.wisniewska@morent.dev',
    car: 'Mazda MX-5 Roadster',
    rating: 5,
    description: 'Perfect little roadster for the coast road. Pure joy.',
  },
  {
    email: 'anna.kowalska@morent.dev',
    car: 'Mazda MX-5 Roadster',
    rating: 5,
    description: 'Light, nimble and easy to park. The manual box is a delight.',
  },
  {
    email: 'piotr.nowak@morent.dev',
    car: 'Volkswagen Golf GTI Mk2',
    rating: 4,
    description: 'Charming classic, well maintained. No aircon, but who cares.',
  },
  {
    email: 'marta.wisniewska@morent.dev',
    car: 'Volkswagen Golf GTI Mk2',
    rating: 5,
    description: 'Turned more heads than the sports cars. Lovely honest hatch.',
  },
  {
    email: 'anna.kowalska@morent.dev',
    car: 'Range Rover Sport SVR',
    rating: 4,
    description:
      'Insanely comfortable and the V8 sounds amazing. Thirsty though.',
  },
  {
    email: 'piotr.nowak@morent.dev',
    car: 'Range Rover Sport SVR',
    rating: 4,
    description:
      'Swallowed all our luggage for a family trip without breaking a sweat.',
  },
  {
    email: 'marta.wisniewska@morent.dev',
    car: 'Jeep Gladiator Rubicon',
    rating: 4,
    description:
      'Took it to the mountains, handled everything. Loud on the highway.',
  },
  {
    email: 'piotr.nowak@morent.dev',
    car: 'Audi RS3 Sportback',
    rating: 5,
    description:
      'That five-cylinder sound is addictive. Practical and savage at once.',
  },
  {
    email: 'anna.kowalska@morent.dev',
    car: 'Mercedes-Benz C-Class',
    rating: 4,
    description: 'Quiet, elegant and efficient. Ideal for a business week.',
  },
  {
    email: 'marta.wisniewska@morent.dev',
    car: 'Mercedes-Benz C-Class',
    rating: 5,
    description: 'Felt like a much more expensive car inside. Superb comfort.',
  },
  {
    email: 'piotr.nowak@morent.dev',
    car: 'Ford Mustang Convertible',
    rating: 3,
    description:
      'Fun cruiser with the top down, but the interior shows its age.',
  },
  {
    email: 'marta.wisniewska@morent.dev',
    car: 'BMW M340i',
    rating: 5,
    description: 'The perfect all-rounder. Fast, comfortable and understated.',
  },
];

async function verifyImages() {
  const urls = [...new Set(CARS.flatMap((car) => car.images))];
  const results = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url, { method: 'HEAD' });
      return { url, ok: res.ok, status: res.status };
    }),
  );
  const broken = results.filter((r) => !r.ok);

  if (broken.length) {
    for (const b of broken) console.error(`  ${b.status} ${b.url}`);
    throw new Error(`${broken.length} car image URL(s) are unreachable`);
  }
  console.log(`Verified ${urls.length} image URLs`);
}

async function seedUsers() {
  const users = new Map<string, { id: string }>();
  for (const { password, ...user } of USERS) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        password: await bcrypt.hash(password, SALT_ROUNDS),
        favouritesList: { create: {} },
      },
      select: { id: true },
    });
    users.set(user.email, record);
  }
  console.log(`Users: ${users.size}`);
  return users;
}

async function seedLocations() {
  const locations: { id: string; name: string }[] = [];
  for (const name of LOCATIONS) {
    locations.push(
      await prisma.location.upsert({
        where: { name },
        update: {},
        create: { name },
        select: { id: true, name: true },
      }),
    );
  }
  console.log(`Locations: ${locations.length}`);
  return locations;
}

async function seedPromoCodes() {
  for (const promo of PROMO_CODES) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: { discountPercent: promo.discountPercent, active: promo.active },
      create: promo,
    });
  }
  console.log(`Promo codes: ${PROMO_CODES.length}`);
}

async function seedCars() {
  const cars = new Map<string, { id: string; price: number }>();
  for (const car of CARS) {
    const existing = await prisma.car.findFirst({
      where: { name: car.name },
      select: { id: true },
    });
    const record = existing
      ? await prisma.car.update({
          where: { id: existing.id },
          data: car,
          select: { id: true, price: true },
        })
      : await prisma.car.create({
          data: car,
          select: { id: true, price: true },
        });
    cars.set(car.name, record);
  }
  console.log(`Cars: ${cars.size}`);
  return cars;
}

type SeededMaps = {
  users: Map<string, { id: string }>;
  cars: Map<string, { id: string; price: number }>;
  locations: { id: string; name: string }[];
};

function billingFor(email: string) {
  const user = USERS.find((u) => u.email === email);
  return {
    name: `${user?.firstName} ${user?.lastName}`,
    phoneNumber: '+48 600 100 200',
    address: 'Marszalkowska 1',
    city: 'Warsaw',
  };
}

async function upsertReservation(
  key: string,
  data: {
    userId: string;
    carId: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    email: string;
    pickupLocationId: string;
    dropoffLocationId: string;
    promoCode?: string;
    discountPercent?: number;
  },
) {
  const { email, ...reservation } = data;
  await prisma.reservation.upsert({
    where: { paymentIntentId: key },
    update: {
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      totalPrice: reservation.totalPrice,
    },
    create: {
      ...reservation,
      status: ReservationStatus.CONFIRMED,
      paymentIntentId: key,
      marketingConsent: false,
      promoCode: reservation.promoCode ?? null,
      discountPercent: reservation.discountPercent ?? null,
      billingInfo: billingFor(email),
    },
  });
}

async function seedReviewsWithReservations({
  users,
  cars,
  locations,
}: SeededMaps) {
  const now = Date.now();

  for (const [i, review] of REVIEWS.entries()) {
    const user = users.get(review.email);
    const car = cars.get(review.car);
    if (!user || !car) continue;

    const days = 3;
    const start = new Date(now - (30 + i * 9) * DAY_MS);
    const end = new Date(start.getTime() + days * DAY_MS);
    const pickup = locations[i % locations.length];
    const dropoff = locations[(i + 1) % locations.length];

    await upsertReservation(`seed_pi_review_${i}`, {
      userId: user.id,
      carId: car.id,
      startDate: start,
      endDate: end,
      totalPrice: days * car.price,
      email: review.email,
      pickupLocationId: pickup.id,
      dropoffLocationId: dropoff.id,
    });

    await prisma.review.upsert({
      where: { userId_carId: { userId: user.id, carId: car.id } },
      update: { rating: review.rating, description: review.description },
      create: {
        userId: user.id,
        carId: car.id,
        rating: review.rating,
        description: review.description,
        createdAt: new Date(end.getTime() + 2 * DAY_MS),
      },
    });
  }
  console.log(`Reviews with backing reservations: ${REVIEWS.length}`);
}

async function seedDemoReservations({ users, cars, locations }: SeededMaps) {
  const demo = users.get('demo@morent.dev');
  const golf = cars.get('Volkswagen Golf GTI Mk2');
  const porsche = cars.get('Porsche 911 Carrera S');
  if (!demo || !golf || !porsche) return;

  const now = Date.now();

  const pastStart = new Date(now - 21 * DAY_MS);
  await upsertReservation('seed_pi_demo_past', {
    userId: demo.id,
    carId: golf.id,
    startDate: pastStart,
    endDate: new Date(pastStart.getTime() + 4 * DAY_MS),
    totalPrice: 4 * golf.price * 0.9,
    email: 'demo@morent.dev',
    pickupLocationId: locations[0].id,
    dropoffLocationId: locations[1].id,
    promoCode: 'SUMMER10',
    discountPercent: 10,
  });

  const futureStart = new Date(now + 21 * DAY_MS);
  await upsertReservation('seed_pi_demo_upcoming', {
    userId: demo.id,
    carId: porsche.id,
    startDate: futureStart,
    endDate: new Date(futureStart.getTime() + 3 * DAY_MS),
    totalPrice: 3 * porsche.price,
    email: 'demo@morent.dev',
    pickupLocationId: locations[0].id,
    dropoffLocationId: locations[0].id,
  });

  console.log(
    'Demo reservations: 1 past (reviewable), 1 upcoming (cancellable)',
  );
}

async function main() {
  await verifyImages();
  const users = await seedUsers();
  const locations = await seedLocations();
  await seedPromoCodes();
  const cars = await seedCars();
  await seedReviewsWithReservations({ users, cars, locations });
  await seedDemoReservations({ users, cars, locations });
  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
