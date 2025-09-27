// store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage
import authReducer from "../modules/Users/users.slice";
import orderReducer from "../modules/Orders/redux/orderSlice";

const orderPersistConfig = {
  key: "order",
  storage,
};

const persistedOrderReducer = persistReducer(orderPersistConfig, orderReducer);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    order: persistedOrderReducer,
  },
});

export const persistor = persistStore(store);
