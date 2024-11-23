// src/controllers/subscriptionController.ts
import { Request, Response } from 'express';
import { Users } from '../Entities/Users';
import Stripe from 'stripe';
import paystack from 'paystack';


const stripe = new Stripe('sk_test_51PBDGoRtP8rhcXVs05q2No0D9zQiuXCpPq8XQzVSBaH387rq9zcFfAKNGIduASomWE4VBspWMIACtMYwZB0DA4by00MgECoDgm', { apiVersion: '2024-06-20' });

export const subscribe = async (req: Request, res: Response) => {
    console.log("Subscribing");
    const { userId, plan } = req.body;

    const user = await Users.findOne(userId);
    if (user) {
        user.subscriptionPlan = plan;
        await user.save();

        res.status(200).send({ success: true });
    } else {
        res.status(400).send({ error: 'User not found' });
    }
};

export const getSubscription = async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await Users.findOne({where: {id : Number(userId)}});
    if (user) {
        res.status(200).send({ subscriptionPlan: user.subscriptionPlan });
    } else {
        res.status(400).send({ error: 'User not found' });
    }
};


const paystackClient = paystack('sk_test_5fab2c0a2dcb0a15b93c276c214966460b9e31ab');

const priceIdMap: { [key: string]: string } = {
  'Essential plan': 'PLN_1i2i3i4i5i6', // Replace with your actual plan IDs from Paystack
  'Advanced plan': 'PLN_7j8j9j0j1j2',
  'Ultimate plan': 'PLN_3k4k5k6k7k8',
};

export const createSubscription = async (req: Request, res: Response) => {
  const { email, first_name, last_name, phone_number, userId, plan, paymentMethodId } = req.body;

  console.log("Subscribing");

  try {
      // Create a new customer
      const customerResponse = await paystackClient.customer.create({
          email: email,
          first_name: first_name,
          last_name: last_name,
          phone: phone_number,
      });

      const customerId = customerResponse.data.customer_code;

      // Create the subscription
      const subscriptionResponse = await paystackClient.subscription.create({
          customer: customerId,
          plan: priceIdMap[plan],
          authorization: paymentMethodId,
      });

      console.log("Paystack subscription info:", subscriptionResponse);
      res.status(200).send({ success: true, subscription: subscriptionResponse.data });
  } catch (error: any) {
      console.log("error", error);
      res.status(400).send({ error: error.message });
  }
};