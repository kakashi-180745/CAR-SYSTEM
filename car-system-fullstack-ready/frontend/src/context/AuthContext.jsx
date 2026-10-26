import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";
import {
  adminSignup as adminSignupApi,
  getUser,
  isLoggedIn,
  login as loginApi,
  logout as logoutApi,
  me,
  signup as signupApi,
  updateStoredUser
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(isLoggedIn());
  const [wishlistIds, setWishlistIds] = useState(() => new Set());
  const [cartCount, setCartCount] = useState(0);

  const setUser = useCallback((u) => {
    setUserState(u);
    if (u) updateStoredUser(u);
  }, []);

  const refreshCollections = useCallback(async () => {
    if (!isLoggedIn()) {
      setWishlistIds(new Set());
      setCartCount(0);
      return;
    }
    try {
      const [wRes, cRes] = await Promise.all([api.get("/wishlist"), api.get("/cart")]);
      setWishlistIds(new Set((wRes.data || []).map((x) => Number(x.carId))));
      const totalQty = (cRes.data || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      setCartCount(totalQty);
    } catch {
      // Ignore collection fetch failures cleanly
    }
  }, []);

  useEffect(() => {
    const onExpired = () => {
      logoutApi();
      setUserState(null);
      setWishlistIds(new Set());
      setCartCount(0);
    };
    window.addEventListener("auth-expired", onExpired);

    if (isLoggedIn()) {
      me()
        .then((u) => {
          setUser(u);
          return refreshCollections();
        })
        .catch(() => {
          logoutApi();
          setUserState(null);
          setWishlistIds(new Set());
          setCartCount(0);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => window.removeEventListener("auth-expired", onExpired);
  }, [refreshCollections, setUser]);

  const login = async (payload) => {
    const d = await loginApi(payload);
    const full = await me().catch(() => ({
      id: d.id,
      name: d.name,
      email: d.email,
      role: d.role
    }));
    setUser(full);
    await refreshCollections();
    return full;
  };

  const signup = async (payload) => {
    const d = await signupApi(payload);
    const full = await me().catch(() => ({
      id: d.id,
      name: d.name,
      email: d.email,
      role: d.role
    }));
    setUser(full);
    await refreshCollections();
    return full;
  };

  const adminSignup = async (payload) => {
    const d = await adminSignupApi(payload);
    const full = await me().catch(() => ({
      id: d.id,
      name: d.name,
      email: d.email,
      role: d.role
    }));
    setUser(full);
    await refreshCollections();
    return full;
  };

  const logout = () => {
    logoutApi();
    setUserState(null);
    setWishlistIds(new Set());
    setCartCount(0);
  };

  const toggleWishlist = async (carId) => {
    const numId = Number(carId);
    const currentlyLiked = wishlistIds.has(numId);
    if (currentlyLiked) {
      await api.delete(`/wishlist/${numId}`);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(numId);
        return next;
      });
      return false;
    } else {
      await api.post(`/wishlist/${numId}`);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.add(numId);
        return next;
      });
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        adminSignup,
        logout,
        setUser,
        wishlistIds,
        cartCount,
        toggleWishlist,
        refreshCollections
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
