import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  cart: { items: [] },
  loading: false,
  error: null
};
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cart = action.payload;
    },
    clearCart: (state) => {
      state.cart = { items: [] };
    }
  }
});
export const { setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;