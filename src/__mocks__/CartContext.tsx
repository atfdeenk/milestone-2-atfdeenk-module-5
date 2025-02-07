import React from 'react';

export const CartContext = React.createContext({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  totalItems: 0,
});

export const CartProvider = ({ children, value }: { children: React.ReactNode; value?: any }) => {
  return (
    <CartContext.Provider value={value || { cartItems: [], addToCart: () => {}, removeFromCart: () => {}, clearCart: () => {}, totalItems: 0 }}>
      {children}
    </CartContext.Provider>
  );
};
