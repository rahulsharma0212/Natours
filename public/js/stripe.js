import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51LEZd7SIEylnfb8DPy2Pn2L4ys0jeK86d6zU88n6vVUdoc1LxN0NEozR81q4DOA2wGKWWZXkviut9WaXXtPtAHiZ00lwedAhZg'
);

export const bookTour = async (tourId) => {
  try {
    //1) get checkout session from Api
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    // 2) create checkout form + charge  credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
