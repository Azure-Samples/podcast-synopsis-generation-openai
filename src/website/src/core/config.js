export const API_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "https://YOUR_FUNCTION_APP_URL_HERE.azurewebsites.net/"
    : "http://localhost:5000/";
