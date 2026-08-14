declare module 'react-native-razorpay' {
  export type RazorpayCheckoutSuccess = {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  };

  const RazorpayCheckout: {
    open: (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name?: string;
      description?: string;
      prefill?: {
        name?: string;
        email?: string;
        contact?: string;
      };
      theme?: { color?: string };
    }) => Promise<RazorpayCheckoutSuccess>;
  };

  export default RazorpayCheckout;
}
