import { PrismaClient, ReservationStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const E2E_USER = {
  email: process.env.E2E_USER_EMAIL ?? 'testauth@example.com',
  password: process.env.E2E_USER_PASSWORD ?? 'Test123!@#',
  firstName: 'Test',
  lastName: 'Auth',
};

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('seed:e2e must never run against a production database');
  }

  const user = await prisma.user.upsert({
    where: { email: E2E_USER.email },
    update: {},
    create: {
      email: E2E_USER.email,
      firstName: E2E_USER.firstName,
      lastName: E2E_USER.lastName,
      password: await bcrypt.hash(E2E_USER.password, SALT_ROUNDS),
      role: Role.USER,
      favouritesList: { create: {} },
    },
    select: { id: true },
  });

  const car = await prisma.car.findFirst({
    where: { name: 'Ford Mustang Convertible' },
    select: { id: true, price: true },
  });
  const location = await prisma.location.findFirst({ select: { id: true } });

  if (!car || !location) {
    throw new Error(
      'Run `yarn seed` first — the e2e fixture needs a car and a location',
    );
  }

  const start = new Date(Date.now() - 14 * DAY_MS);
  const end = new Date(start.getTime() + 3 * DAY_MS);

  await prisma.reservation.upsert({
    where: { paymentIntentId: 'seed_pi_e2e_past' },
    update: { startDate: start, endDate: end },
    create: {
      startDate: start,
      endDate: end,
      status: ReservationStatus.CONFIRMED,
      totalPrice: 3 * car.price,
      paymentIntentId: 'seed_pi_e2e_past',
      marketingConsent: false,
      billingInfo: {
        name: `${E2E_USER.firstName} ${E2E_USER.lastName}`,
        phoneNumber: '+48600100200',
        address: 'Test Street 1',
        city: 'Warsaw',
      },
      pickupLocationId: location.id,
      dropoffLocationId: location.id,
      userId: user.id,
      carId: car.id,
    },
  });

  console.log(`E2E fixture ready: ${E2E_USER.email} + 1 finished rental`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
