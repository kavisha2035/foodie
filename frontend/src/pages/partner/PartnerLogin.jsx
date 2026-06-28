import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginPartner } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function PartnerLogin() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });
  const { setPartner } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await loginPartner(data);
      setPartner(res.data.foodPartner);
      toast.success("Welcome back, Partner! 👨‍🍳");
      navigate("/partner/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed, please check credentials");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-4xl font-black text-brand tracking-tighter">FOODIE</span>
          <span className="block text-xxs font-extrabold tracking-widest text-gray-400 mt-1 uppercase">
            Partner Control Panel
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Merchant Sign In</h2>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Log in to manage your food reels, track analytical views, and fulfil incoming customer orders.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register("email")}
              type="email"
              placeholder="Email address"
              className="input-field"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="input-field"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full shadow-lg shadow-brand/10"
          >
            {isSubmitting ? "Signing in..." : "Merchant Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-gray-500">
            Want to partner with us?{" "}
            <Link to="/partner/register" className="text-brand font-bold hover:underline">
              Register Here
            </Link>
          </p>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              Looking to order food?{" "}
              <Link to="/login" className="text-brand font-bold hover:underline">
                Customer Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
