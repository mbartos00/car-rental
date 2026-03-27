import { Provider } from '@nestjs/common';
import Stripe from 'stripe';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

export const stripeProvider: Provider = {
  provide: STRIPE_CLIENT,
  useFactory: () => new Stripe(process.env.STRIPE_SECRET_KEY as string),
};
