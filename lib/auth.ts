import Cookies from "js-cookie";

const COOKIE_EXPIRE_DAYS = 365;

export const isLoggedIn = () => {
  return Cookies.get("auth") === "true";
};

export const login = (username: string) => {
  Cookies.set("auth", "true", { expires: COOKIE_EXPIRE_DAYS });
  Cookies.set("username", username, { expires: COOKIE_EXPIRE_DAYS });
};

export const logout = () => {
  Cookies.remove("auth");
  Cookies.remove("username");
};

export const getUsername = () => {
  return Cookies.get("username");
};
