import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerPartner } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact person name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function PartnerRegister() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });
  const { setPartner } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await registerPartner(data);
      setPartner(res.data.foodPartner);
      toast.success("Merchant registered successfully! Welcome! 👨‍🍳");
      navigate("/partner/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Email might be in use.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl font-black text-brand tracking-tighter">FOODIE</span>
          <span className="block text-xxs font-extrabold tracking-widest text-gray-400 mt-1 uppercase">
            Partner Registration
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Register Restaurant</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Sign up to list your kitchen, upload video menus, and receive instant orders.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register("name")}
              type="text"
              placeholder="Restaurant name"
              className="input-field"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("contactName")}
              type="text"
              placeholder="Contact person name"
              className="input-field"
            />
            {errors.contactName && (
              <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                {errors.contactName.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("phone")}
              type="text"
              placeholder="Contact phone number"
              className="input-field"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("address")}
              type="text"
              placeholder="Full restaurant address"
              className="input-field"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                {errors.address.message}
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
            {isSubmitting ? "Registering kitchen..." : "Register Restaurant"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already registered?{" "}
          <Link to="/partner/login" className="text-brand font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
