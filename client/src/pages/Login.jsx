import { useState, useEffect } from "react"; // Ensure useEffect is imported
import { Link, useLocation, useNavigate } from "react-router-dom";
import login from "../assets/login.webp";
import { loginUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from "../redux/slices/cartSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  // Get redirect parameter (e.g., "checkout") or default to "/"
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  // Check if the redirect target includes "checkout"
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    if (user) {
      const shouldMerge = cart?.products?.length > 0 && guestId;

      if (shouldMerge) {
        // Logged in user has a guest cart: Merge cart first, then navigate.
        // We rely on the promise resolution (.then) to ensure navigation happens after the merge API call completes.
        dispatch(mergeCart({ guestId, user }))
          .then(() => {
            navigate(isCheckoutRedirect ? "/checkout" : redirect);
          })
          .catch((error) => {
            console.error("Cart merge failed, navigating anyway.", error);
            navigate(isCheckoutRedirect ? "/checkout" : redirect);
          });
      } else {
        // Logged in, no guest cart to merge: Navigate immediately.
        // Navigate to /checkout if requested, otherwise use the general redirect path.
        navigate(isCheckoutRedirect ? "/checkout" : redirect);
      }
    }
  }, [user, guestId, cart, navigate, isCheckoutRedirect, redirect, dispatch]); // Added 'redirect' to dependency array for completeness

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch login action
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-lg" // Improved shadow
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-3xl font-bold"> Rabbit</h2>
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">
            {" "}
            Welcome Back! 👋🏻
          </h1>
          <p className="text-center mb-6 text-gray-600">
            Sign in to access your account.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2"> Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:ring-black focus:border-black"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:ring-black focus:border-black"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-500"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <p className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            {/* Redirect logic is correctly passed to the Register component */}
            <Link
              to={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden md:block w-1/2">
        <div className="h-full">
          <img
            src={login}
            alt="Person shopping"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;