import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFood } from "../../api/food.api";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Upload, Video, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "Food name is required"),
  description: z.string().optional(),
  price: z.preprocess((val) => parseFloat(val), z.number().positive("Price must be a positive number")),
  city: z.string().min(1, "City is required"),
});

const MOOD_OPTIONS = ['late_night', 'spicy', 'comfort_food', 'healthy', 'sweet', 'rainy_day', 'breakfast', 'quick_bite'];
const CUISINE_OPTIONS = ['north_indian', 'south_indian', 'chinese', 'italian', 'mexican', 'thai', 'continental', 'street_food'];

export default function UploadReel() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const handleVideoChange = (e) => {
    setErrorMsg("");
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setErrorMsg("Please select a valid video file (mp4, webm, etc.)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setErrorMsg("Video size exceeds 50MB limit");
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const toggleMood = (tag) => {
    setSelectedMoods(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleCuisine = (tag) => {
    setSelectedCuisines(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const onSubmit = async (data) => {
    setErrorMsg("");
    if (!videoFile) {
      setErrorMsg("Please choose a food video reel to upload");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("price", data.price);
    formData.append("city", data.city);
    formData.append("moodTags", JSON.stringify(selectedMoods));
    formData.append("cuisineTags", JSON.stringify(selectedCuisines));

    try {
      await createFood(formData);
      toast.success("Food reel uploaded successfully! 📽️");
      navigate("/partner/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload food item");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
        <Link to="/partner/dashboard" className="p-1 rounded-full hover:bg-gray-100 text-gray-700 transition">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-extrabold text-gray-900 text-sm">Upload Food Reel</span>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Video Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
              Food Video Reel
            </label>
            {videoPreview ? (
              <div className="relative aspect-[9/16] max-h-[320px] mx-auto rounded-2xl overflow-hidden bg-black border border-gray-100">
                <video src={videoPreview} className="w-full h-full object-cover" controls playsInline />
                <button
                  type="button"
                  onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                  className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full"
                >
                  Change
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-brand/50 rounded-2xl p-8 cursor-pointer transition bg-gray-50 h-[180px]">
                <Upload className="text-gray-400 mb-2" size={28} />
                <span className="text-xs font-bold text-gray-700">Choose Video File</span>
                <span className="text-[10px] text-gray-400 mt-1">MP4, WebM (Max 50MB)</span>
                <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              </label>
            )}
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs mt-2 font-medium">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Form details */}
          <div>
            <input
              {...register("name")}
              placeholder="Food name (e.g. Special Chicken Biryani)"
              className="input-field"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
          </div>

          <div>
            <textarea
              {...register("description")}
              placeholder="Short description (ingredients, spice levels, etc.)"
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                {...register("price")}
                type="number"
                placeholder="Price (₹)"
                className="input-field"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1 font-medium">{errors.price.message}</p>}
            </div>
            <div>
              <input
                {...register("city")}
                placeholder="City location"
                className="input-field"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1 font-medium">{errors.city.message}</p>}
            </div>
          </div>

          {/* Mood Tags */}
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select Mood Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map(tag => {
                const active = selectedMoods.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleMood(tag)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition active:scale-95 capitalize
                      ${active ? "bg-brand text-white border-brand shadow-sm shadow-brand/10" : "bg-white text-gray-500 border-gray-200"}`}
                  >
                    {tag.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuisine Tags */}
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select Cuisine Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map(tag => {
                const active = selectedCuisines.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleCuisine(tag)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition active:scale-95 capitalize
                      ${active ? "bg-brand text-white border-brand shadow-sm shadow-brand/10" : "bg-white text-gray-500 border-gray-200"}`}
                  >
                    {tag.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full shadow-lg shadow-brand/10 mt-2"
          >
            {isSubmitting ? "Uploading food item..." : "Publish Food Reel"}
          </button>

        </form>
      </div>
    </div>
  );
}
