import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Orders_api from "../../../app/Orders.api";
import cart_api from "../../../app/cart.axios";

export const createOrder = async ({ userId, addressId, totalAmount }) => {
  try {
    const response = await Orders_api.post(`/orders`, {
      orderDate: new Date().toISOString(),
      status: "Payment Pending",
      totalAmount,
      userId,
      addressId,
    });
    console.log(response);
    return response.data;
  } catch (err) {
    console.error("Failed to create order", err);
    throw new Error("Failed to create order");
  }
};

export const confirmOrder = async ({ orderItems, orderId }) => {
  try {
    const payload = orderItems.map((item) => ({
      quantity: item.quantity,
      price: item.totalItemPrice,
      orderId: orderId,
      productSkuId: parseInt(item.productSkuId),
    }));

    const response = await Orders_api.post(`order_items`, payload);
    return response.data;
  } catch (err) {
    console.error("Failed to confirm order", err);
    throw new Error("Failed to confirm order");
  }
};

export const fetchOrderSummary = createAsyncThunk(
  "order/fetchOrderSummary",
  async ({ userId, orderId }, { rejectWithValue }) => {
    try {
      const response = await Orders_api.get(
        `/orders/summary/${userId}/${orderId}`
      );
      return response.data;
    } catch (err) {
      return rejectWithValue("Failed to fetch order summary");
    }
  }
);

export const fetchCartSummary = createAsyncThunk(
  "order/fetchCartSummary",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const cartRes = await cart_api.get(`/carts/user/${userId}`);
      const cartId = cartRes.data.cartId;
      const itemsRes = await cart_api.get(
        `/cart_items/display/by-cart/${cartId}`
      );
      console.log("itemsRes",itemsRes);
      return { ...itemsRes.data, cartId };//should return an array
    } catch (err) {
      return rejectWithValue("Failed to fetch cart summary");
    }
  }
);

export const fetchAllOrdersByUser = createAsyncThunk(
  "order/fetchAllOrdersByUser",
  async (userId, pageNumber = 1, pageSize = 30) => {
    const response = await Orders_api.get(`/orders/orderByUser/${userId}`, {
      params: { pageNumber, pageSize },
    });
    return response.data;
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    buyNow: false,
    data: null,
    orders: [],
    loading: false,
    error: null,
    paymentSession: null,
    orderId: null,
    addressId: null,
    totalAmount: null,
  },
  reducers: {
    setBuyNow: (state, action) => {
      state.buyNow = action.payload;
    },
    setOrderMeta: (state, action) => {
      state.orderId = action.payload.orderId;
      state.addressId = action.payload.addressId;
      state.totalAmount = action.payload.totalAmount;
    },
    setPaymentSession: (state, action) => {
      state.paymentSession = action.payload;
    },
    setOrderItems: (state, action) => {
      const { orderId, items } = action.payload;
      state.orders = state.orders.map((order) =>
        order.orderId === orderId ? { ...order, items } : order
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchOrderSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCartSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCartSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllOrdersByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrdersByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrdersByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setBuyNow, setOrderMeta, setPaymentSession, setOrderItems } =
  orderSlice.actions;
export default orderSlice.reducer;
