import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function AddInventory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🌟 Keys strictly match Mongoose Schema fields
  const [formData, setFormData] = useState({
    resourceName: "",
    category: "",
    quantity: 0,
    unit: "items",
    status: "available",
    notes: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 🌟 Absolute backend path configuration along with credentials for CORS cookie exchange
      const response = await axios.post(
        "/api/v1/inventory/create", 
        formData, 
        { withCredentials: true }
      );

      if (response.status === 201) {
        setSuccess("Stock asset updated successfully! 📦");
        setTimeout(() => {
          navigate("/dashboard"); 
        }, 1500);
      }
    } catch (err) {
      console.error("Inventory error:", err);
      setError(err.response?.data?.message || "Failed to register inventory item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 font-sans flex items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl"></div>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-white">Log Stock Inventory</h1>
            <Link to="/dashboard/ngo" className="text-xs text-slate-400 hover:text-sky-400 transition-colors">
              ← Back to Control Panel
            </Link>
          </div>
          <p className="text-slate-400 text-sm mt-1">Register logistics, medical kits, or survival assets into the regional database.</p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold flex items-center gap-2">
            ✅ {success}
          </div>
        )}

        {/* Form Layer */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Resource Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resource Name</label>
            <input
              type="text"
              name="resourceName"
              required
              placeholder="e.g., Packaged Drinking Water, First Aid Kit"
              value={formData.resourceName}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 p-3 rounded-xl text-sm outline-none transition-all text-slate-200"
            />
          </div>

          {/* Grid Area: Category & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 p-3 rounded-xl text-sm outline-none transition-all text-slate-300"
              >
                <option value="">Select Category</option>
                <option value="food">Food & Rations</option>
                <option value="water">Water Supply</option>
                <option value="medical">Medical Supplies</option>
                <option value="clothing">Clothing & Blankets</option>
                <option value="rescue">Rescue Equipment</option>
                <option value="other">Other Essentials</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity</label>
              <input
                type="number"
                name="quantity"
                required
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 p-3 rounded-xl text-sm outline-none transition-all text-slate-200"
              />
            </div>
          </div>

          {/* Grid Area: Unit & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Unit</label>
              <input
                type="text"
                name="unit"
                placeholder="e.g., kgs, boxes, items"
                value={formData.unit}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 p-3 rounded-xl text-sm outline-none transition-all text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 p-3 rounded-xl text-sm outline-none transition-all text-slate-300"
              >
                <option value="available">Available / In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Operational Notes (Optional)</label>
            <textarea
              name="notes"
              rows="3"
              placeholder="Provide expiry date, storage handling parameters, or specific distribution instructions..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 p-3 rounded-xl text-sm outline-none transition-all text-slate-200 resize-none"
            ></textarea>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-sky-500 hover:bg-sky-600 active:scale-[0.99] disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-sm font-extrabold py-3.5 rounded-xl transition-all tracking-wider uppercase shadow-xl shadow-sky-500/10"
          >
            {loading ? "Registering Asset Log..." : "📦 Deploy Asset to Inventory"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddInventory;