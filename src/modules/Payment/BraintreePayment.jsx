import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, message } from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dropin from "braintree-web-drop-in";
import {
  getBraintreeClientToken,
  processBraintreePayment,
  createPayment,
} from "../Payment/payment.api";
import { clearCartByUser } from "../Cart/cart.api.js";

export default function BraintreePayment({
  amount,
  firstName,
  emailId,
  orderId,
  userId,
  address,
}) {
  const [clientToken, setClientToken] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const dropinContainerRef = useRef(null);
  const instanceRef = useRef(null);
  const navigate = useNavigate();
  console.log(emailId);

  useEffect(() => {
    getBraintreeClientToken().then((res) => {
      setClientToken(res.data.clientToken);
    });
  }, []);

  useEffect(() => {
    if (!isModalVisible || !clientToken || !dropinContainerRef.current) return;

    dropin.create(
      {
        authorization: clientToken,
        container: dropinContainerRef.current,
        paymentOptionPriority: ["paypal", "card"],
      },
      (err, instance) => {
        if (err) {
          console.error("Drop-in error:", err);
          message.error("Failed to load Braintree UI");
          return;
        }
        instanceRef.current = instance;
      }
    );

    return () => {
      instanceRef.current?.teardown().catch(() => {});
      instanceRef.current = null;
    };
  }, [clientToken, isModalVisible]);

  const handleBraintreeSubmit = () => {
    if (!instanceRef.current) {
      message.error("Braintree UI not ready");
      return;
    }

    instanceRef.current.requestPaymentMethod(async (err, payload) => {
      if (err) {
        console.error("Payment method error:", err);
        message.error("Failed to get payment method");
        return;
      }

      const paymentData = {
        paymentMethodNonce: payload.nonce,
        amount: amount,
        firstName: firstName,
        email: emailId,
        BillingAddress: {
          streetAddress: address.addressLine1+address.addressLine2,
          locality: address.city,
          postalCode: address.zip,
          countryCodeAlpha2: "IN",
        },
      };
      console.log(paymentData);

      try {
        const result = await processBraintreePayment(paymentData);
        result.data.success
          ? message.success("Payment succeeded!")
          : message.error(
              `Payment failed: ${result.data.message || "Unknown"}`
            );
        setIsModalVisible(false);
        if (result.data.success === true) {
          console.log(result.data);
          //  call the payment api and post the data into the payment table
          const payData = {
            paymentMethod: "card",
            paymentStatus: result.data.success.toString(),
            paymentDate: new Date().toISOString(),
            amount: paymentData.amount,
            orderId: orderId,
            userId: userId,
            transactionId: result.data.transactionId,
            paymentGateway: "BrainTree",
          };
          console.log(payData);
          const res = await createPayment(payData);
          console.log(res);
          const deleted =await clearCartByUser(userId);
          console.log(deleted);

          navigate("/pastorder");
        } else {
          const payData = {
            paymentMethod: "card",
            paymentStatus: result.data.success.toString(),
            paymentDate: new Date().toISOString(),
            amount: paymentData.amount,
            orderId: 1,
            userId: 5,
            transactionId: result.data.transactionId,
            paymentGateway: "BrainTree",
          };
          console.log(payData);
          const res = await createPayment(payData);
          console.log(res);
        }
      } catch (err) {
        console.error("Transaction error:", err);
        message.error("Payment error");
      }
    });
  };

  return (
    <Modal
      title="Braintree Payment"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setIsModalVisible(false)}>
          Cancel Payment
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<CreditCardOutlined />}
          onClick={handleBraintreeSubmit}
        >
          Pay ${amount}
        </Button>,
      ]}
      centered
    >
      <div ref={dropinContainerRef} style={{ minHeight: "200px" }} />
    </Modal>
  );
}
