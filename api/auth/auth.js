export const checkAuth = (redirectingURL1, redirectingURL2) => {
  try {
    if (!window.localStorage.getItem("user_id")) {
      window.location.href = redirectingURL1;
    } else {
      window.location.href = redirectingURL2;
    }
  } catch (error) {
    console.log(error);
  }
};
