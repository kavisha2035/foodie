import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await registerUser(data);
      setUser(res.data.user);
      toast.success("Account created successfully! Welcome! 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Email might be in use.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12">
      <div className="w-full max-w-sm mx-auto">
        {/* App Logo */}
        <div className="text-center mb-10">
          <span className="text-4xl font-black text-brand tracking-tighter">FOODIE</span>
          <span className="block text-xxs font-extrabold tracking-widest text-gray-400 mt-1 uppercase">
            FlavorLoop Client
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Create Account</h2>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Sign up to explore visual food reels and order directly from local chefs.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register("fullName")}
              type="text"
              placeholder="Full name"
              className="input-field"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

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
              placeholder="Password (min. 6 characters)"
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
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-brand font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
