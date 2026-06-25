import React, { useState, useEffect } from "react";
import axios from "axios"; // 1. Imported Axios
import { 
  Boxes, Menu, X, PlusCircle, ListTodo, Search, 
  Utensils, Droplet, Heart, Shirt, ShieldAlert, Box, 
  MessageSquare, PenSquare, Trash2, CheckCircle, RefreshCw
} from "lucide-react";

// API Config Base URL
const API_BASE_URL = "/api/v1/inventory"; 

export default function InventoryDashboard() {
  const [currentView, setCurrentView] = useState("list-view"); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 

  // Dynamic Data & Loading States
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  
  // Filter States
  const [searchName, setSearchName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Form States
  const [createForm, setCreateForm] = useState({
    resourceName: "", category: "food", quantity: 0, unit: "items", status: "available", notes: ""
  });
  const [updateForm, setUpdateForm] = useState({
    _id: "", resourceName: "", category: "", quantity: 0, unit: "", status: "", notes: ""
  });

  // 2. Helper: Set up headers config with standard Axios interceptor style or simple function
  const getAxiosConfig = () => {
    const token = localStorage.getItem("accessToken");
    return {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    };
  };

  // 1. GET ALL MY INVENTORY (Axios GET)
  const fetchInventory = async () => {
    setIsLoading(true);
    setApiError("");
    try {
      // Axios natively handles query parameters passing an object to 'params'
      const response = await axios.get(`${API_BASE_URL}/my-inventory`, {
        ...getAxiosConfig(),
        params: {
          ...(searchName && { resourceName: searchName }),
          ...(filterCategory && { category: filterCategory }),
          ...(filterStatus && { status: filterStatus }),
        }
      });
      
      // Axios packs payload into response.data
      setInventory(response.data.data || []);
    } catch (err) {
      // Catching errors safely. If backend responds with a custom message, use it.
      setApiError(err.response?.data?.message || err.message || "Failed to fetch inventory");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch items instantly when query parameters change
  useEffect(() => {
    fetchInventory();
  }, [searchName, filterCategory, filterStatus]);

  // 2. CREATE INVENTORY (Axios POST)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (createForm.quantity < 0) return alert("Quantity cannot be negative");

    try {
      // body data goes as the second argument, configuration as the third
      await axios.post(`${API_BASE_URL}/create`, createForm, getAxiosConfig());

      alert("Inventory created successfully!");
      setCreateForm({ resourceName: "", category: "food", quantity: 0, unit: "items", status: "available", notes: "" });
      setCurrentView("list-view");
      fetchInventory(); 
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to create resource");
    }
  };
const handleUpdateSubmit = async (e) => {
  e.preventDefault();
  if (updateForm.quantity < 0) return alert("Quantity cannot be negative");

  try {
    // Sirf wahi fields nikalein jo backend allow karta hai
    const updateData = {
      resourceName: updateForm.resourceName,
      category: updateForm.category,
      quantity: updateForm.quantity,
      unit: updateForm.unit,
      status: updateForm.status,
      notes: updateForm.notes
    };

    console.log(`${API_BASE_URL}/update/${updateForm._id}`);
    
    // updateForm ke bajay updateData bhejiye
    await axios.patch(`${API_BASE_URL}/update/${updateForm._id}`, updateData, getAxiosConfig());

    setSelectedItem(null);
    fetchInventory(); 
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Failed to update resource");
  }
};

  // 4. DELETE INVENTORY (Axios POST configuration)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) return;

    try {
      // Kept as POST request to perfectly align with your backend express routing style
      await axios.delete(`${API_BASE_URL}/delete/${id}`, {}, getAxiosConfig());

      setSelectedItem(null);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete item");
    }
  };

  // Resolvers for Dynamic View Styles
  const getCategoryIcon = (category) => {
    switch (category) {
      case "food": return <Utensils className="w-5 h-5 text-amber-500" />;
      case "water": return <Droplet className="w-5 h-5 text-blue-500" />;
      case "medical": return <Heart className="w-5 h-5 text-rose-500" />; 
      case "clothing": return <Shirt className="w-5 h-5 text-indigo-500" />;
      case "rescue": return <ShieldAlert className="w-5 h-5 text-emerald-500" />;
      default: return <Box className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      'available': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'low-stock': 'bg-amber-100 text-amber-800 border-amber-200',
      'out-of-stock': 'bg-rose-100 text-rose-800 border-rose-200'
    };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${classes[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-800">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 md:translate-x-0 md:relative md:flex md:flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-400" /> StockMaster
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setCurrentView("list-view"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${currentView === "list-view" ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <ListTodo className="w-5 h-5" /> All My Inventory
          </button>
          <button 
            onClick={() => { setCurrentView("create-view"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${currentView === "create-view" ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <PlusCircle className="w-5 h-5" /> Create Inventory
          </button>
        </nav>
      </aside>

      {/* VIEW WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* 2. TOP BAR */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {currentView === "list-view" ? "All My Inventory" : "Create New Entry"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchInventory} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" title="Refresh data">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Live Database
            </span>
          </div>
        </header>

        {/* 3. DYNAMIC WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {apiError && (
            <div className="mb-4 p-3 bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-sm font-medium">
              Error connecting to database: {apiError}
            </div>
          )}
          
          {/* LIST SCREEN */}
          {currentView === "list-view" && (
            <div className="space-y-6">
              {/* Dynamic Filter Row */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Search Resource</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Category</label>
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  >
                    <option value="">All Categories</option>
                    {["food", "water", "medical", "clothing", "rescue", "other"].map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Status</label>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Data Grid Rendering */}
              {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading your inventory...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory.map((item) => (
                    <div 
                      key={item._id} 
                      onClick={() => { setSelectedItem(item); setUpdateForm({ ...item }); }}
                      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(item.category)}
                            <h3 className="font-bold text-gray-900 line-clamp-1">{item.resourceName}</h3>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-2xl font-black text-slate-800">
                          {item.quantity} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-400 mt-2 line-clamp-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 flex-shrink-0" /> {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setSelectedItem(item); setUpdateForm({ ...item }); }} className="text-sm text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1">
                          <PenSquare className="w-4 h-4" /> Update
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="text-sm text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {inventory.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 font-medium">No active inventory records found.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CREATE SCREEN */}
          {currentView === "create-view" && (
            <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name *</label>
                    <input 
                      type="text" required value={createForm.resourceName}
                      onChange={(e) => setCreateForm({...createForm, resourceName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select 
                      value={createForm.category}
                      onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {["food", "water", "medical", "clothing", "rescue", "other"].map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input 
                      type="number" min="0" required value={createForm.quantity}
                      onChange={(e) => setCreateForm({...createForm, quantity: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input 
                      type="text" value={createForm.unit} placeholder="items, kgs, boxes"
                      onChange={(e) => setCreateForm({...createForm, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={createForm.status}
                    onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea 
                    rows="3" value={createForm.notes}
                    onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  ></textarea>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">
                    Create Inventory
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* 4. DETAILS POPUP MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden transform transition-all">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold">Inventory Details</h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Resource Name</label>
                <input 
                  type="text" required value={updateForm.resourceName}
                  onChange={(e) => setUpdateForm({...updateForm, resourceName: e.target.value})}
                  className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Category</label>
                  <select 
                    value={updateForm.category}
                    onChange={(e) => setUpdateForm({...updateForm, category: e.target.value})}
                    className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {["food", "water", "medical", "clothing", "rescue", "other"].map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Status</label>
                  <select 
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                    className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Quantity</label>
                  <input 
                    type="number" min="0" required value={updateForm.quantity}
                    onChange={(e) => setUpdateForm({...updateForm, quantity: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Unit</label>
                  <input 
                    type="text" value={updateForm.unit}
                    onChange={(e) => setUpdateForm({...updateForm, unit: e.target.value})}
                    className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Notes</label>
                <textarea 
                  rows="2" value={updateForm.notes}
                  onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                  className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                ></textarea>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row justify-between gap-2 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => handleDelete(updateForm._id)}
                  className="bg-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-600 order-last sm:order-first transition flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Delete Item
                </button>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setSelectedItem(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                    Cancel
                  </button>
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}