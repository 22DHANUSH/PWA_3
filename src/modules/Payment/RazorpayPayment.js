import { message } from "antd";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPayment,
} from "../Payment/payment.api";
import { useSelector } from "react-redux";
const chekout_url =import.meta.env.VITE_RAZOR_CHECKOUT_URL;
export async function handleRazorpayPayment({
  amount,
  userId,
  orderId,
  userName,
  phoneNumber,
  emailId,
}) 

{
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = chekout_url;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const isScriptLoaded = await loadRazorpayScript();
  if (!isScriptLoaded) {
    message.error("Razorpay SDK failed to load. Please try again.");
    return;
  }

  try {
    const response = await createRazorpayOrder(amount);
    const {
      amount: orderAmount,
      currency,
      key,
      orderId: razorpayOrderId,
    } = response.data;

    const verifyPayment = async ({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    }) => {
      try {
        const verifyData = await verifyRazorpayPayment({
          PaymentId: razorpay_payment_id,
          OrderId: razorpay_order_id,
          Signature: razorpay_signature,
        });

        if (verifyData.data.success === true) {
          message.success(verifyData.data.message);

          const payData = {
            paymentMethod: verifyData.data.paymentMethod,
            paymentStatus: verifyData.data.success.toString(),
            paymentDate: new Date().toISOString(),
            amount: orderAmount,
            orderId,
            userId,
            transactionId: verifyData.data.transactionId,
            paymentGateway: "Razorpay",
          };

          await createPayment(payData);
          window.location.href = "/pastorder";
        } else {
          message.error(verifyData.data.message);
        }
      } catch (err) {
        console.error("Verification error:", err);
        message.error("Payment verification failed.");
      }
    };

    const options = {
      key,
      amount: orderAmount,
      currency,
      name: "Columbia Sportswear",
      description: "Order Payment",
      order_id: razorpayOrderId,
      handler: async (response) => {
        await verifyPayment(response);
      },
      prefill: {
        name: userName,
        email: emailId,
        contact: phoneNumber,
      },
      theme: {
        color: "#528FF0",
      },
    };

    const razorpayInstance = new window.Razorpay(options);

    razorpayInstance.on("payment.failed", async (response) => {
      const { payment_id, order_id } = response.error.metadata;
      await verifyPayment({
        razorpay_payment_id: payment_id,
        razorpay_order_id: order_id,
        razorpay_signature: null,
      });
    });

    razorpayInstance.open();
  } catch (error) {
    console.error("Payment error:", error);
    message.error("Unable to initiate payment.");
  }
}
