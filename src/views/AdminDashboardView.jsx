import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, RefreshCw, CheckCircle2, XCircle, KeyRound, Building2, Store, Clock, Mail, Phone, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';

export const AdminDashboardView = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [staffApplications, setStaffApplications] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('products'); // 'products' | 'categories' | 'applications' | 'provision'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Category Form
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Product Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodUnit, setProdUnit] = useState('KG');
  const [prodMrp, setProdMrp] = useState(100);
  const [prodSelling, setProdSelling] = useState(85);
  const [prodStock, setProdStock] = useState(50);
  const [prodImage, setProdImage] = useState('');

  // Staff Creation (Direct Provision)
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('STAFF');

  // Staff Application Approval Modal
  const [selectedAppForApproval, setSelectedAppForApproval] = useState(null);
  const [customApprovalPassword, setCustomApprovalPassword] = useState('');
  const [approvalAdminNote, setApprovalAdminNote] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [catRes, prodRes, appRes] = await Promise.all([
        apiClient.get('/api/v1/admin/categories').catch(() => ({ data: [] })),
        apiClient.get('/api/v1/admin/products?size=100').catch(() => ({ data: { content: [] } })),
        apiClient.get('/api/v1/admin/staff-requests').catch(() => ({ data: [] })),
      ]);
      const catList = catRes.data || [];
      const prodList = prodRes.data?.content || prodRes.data || [];
      const appList = appRes.data || [];

      setCategories(catList);
      setProducts(prodList);
      setStaffApplications(appList);

      if (catList.length > 0 && !prodCategoryId) {
        setProdCategoryId(catList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiClient.post('/api/v1/admin/categories', {
        name: catName,
        description: catDesc,
        imageUrl: catImage,
      });
      toast.success(`Category "${catName}" created successfully!`);
      setShowCategoryModal(false);
      setCatName('');
      setCatDesc('');
      setCatImage('');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to create category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiClient.post('/api/v1/admin/products', {
        name: prodName,
        description: prodDesc,
        categoryId: Number(prodCategoryId),
        unit: prodUnit,
        mrpPrice: Number(prodMrp),
        sellingPrice: Number(prodSelling),
        stockQuantity: Number(prodStock),
        minStockAlert: 10,
        imageUrl: prodImage,
      });
      toast.success(`Product "${prodName}" added to catalog!`);
      setShowProductModal(false);
      setProdName('');
      setProdDesc('');
      setProdImage('');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to create product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiClient.post(`/api/v1/admin/users?role=${staffRole}`, {
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        confirmPassword: staffPassword,
        phone: staffPhone,
      });
      toast.success(`Account for "${staffName}" created with role ${staffRole}! 🎉`);
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffPhone('');
    } catch (err) {
      toast.error(err.message || 'Failed to create account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveApplication = async (e) => {
    e.preventDefault();
    if (!selectedAppForApproval) return;
    setActionLoading(true);
    try {
      await apiClient.post(`/api/v1/admin/staff-requests/${selectedAppForApproval.id}/approve`, {
        customPassword: customApprovalPassword,
        adminNote: approvalAdminNote,
      });
      toast.success(`Staff account approved & login password emailed to ${selectedAppForApproval.email}! 🎉`);
      setSelectedAppForApproval(null);
      setCustomApprovalPassword('');
      setApprovalAdminNote('');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (id) => {
    const reason = window.prompt('Please enter a rejection reason:', 'Application does not meet current requirements');
    if (reason === null) return;
    try {
      await apiClient.post(`/api/v1/admin/staff-requests/${id}/reject?reason=${encodeURIComponent(reason)}`);
      toast.info('Staff application marked as rejected.');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to reject application.');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate "${name || 'this product'}"?`)) return;
    try {
      await apiClient.delete(`/api/v1/admin/products/${id}`);
      toast.success('Product deactivated successfully.');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate product.');
    }
  };

  const pendingAppsCount = staffApplications.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-xs">
      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-sky-400 border border-orange-200 p-6 sm:p-8 rounded-3xl text-white shadow-lg flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="bg-white/20 text-white border border-white/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
            Admin Governance Console
          </span>
          <h2 className="text-2xl font-black mt-2">Supermarket & Partner Management</h2>
          <p className="text-xs text-white/90 mt-1">Review partner applications, generate staff credentials, and manage catalog.</p>
        </div>

        <button 
          onClick={fetchAdminData} 
          className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition shadow-lg flex items-center gap-2 font-black backdrop-blur-sm border border-white/30 btn-ripple"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 flex gap-2 font-bold text-xs shadow-sm">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex-1 py-3 rounded-xl transition-all duration-200 btn-ripple ${
            activeSubTab === 'products' ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white font-black shadow-md glow-orange' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`flex-1 py-3 rounded-xl transition-all duration-200 btn-ripple ${
            activeSubTab === 'categories' ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white font-black shadow-md glow-sky' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`flex-1 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 btn-ripple ${
            activeSubTab === 'applications' ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white font-black shadow-md glow-sky' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Store className="w-4 h-4" />
          Partner Applications {pendingAppsCount > 0 && <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black">{pendingAppsCount}</span>}
        </button>
        <button
          onClick={() => setActiveSubTab('provision')}
          className={`flex-1 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 btn-ripple ${
            activeSubTab === 'provision' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black shadow-md glow-purple' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Direct Provision
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-slate-100 p-6 h-36 skeleton" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-500 p-6 rounded-3xl text-center space-y-2">
          <p className="font-black">{error}</p>
          <button onClick={fetchAdminData} className="px-5 py-2 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-400 transition btn-ripple">
            Retry
          </button>
        </div>
      ) : activeSubTab === 'products' ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-base text-slate-800">All Products Catalog</h3>
            <button
              onClick={() => setShowProductModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-black rounded-xl shadow-lg glow-orange transition flex items-center gap-2 btn-ripple"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="divide-y divide-slate-100 stagger-children">
            {products.map((p) => (
              <div key={p.id} className="py-3.5 flex justify-between items-center hover:bg-slate-50 px-3 rounded-xl transition">
                <div>
                  <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                  <span className="text-slate-400 ml-2">({p.categoryName})</span>
                  <div className="text-slate-500 text-xs mt-1">
                    MRP: ₹{p.mrpPrice} | Selling: <strong className="text-orange-500">₹{p.sellingPrice}</strong> ({p.discountPercent}% OFF) | Stock: {p.stockQuantity} {p.unit}
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteProduct(p.id, p.name)} 
                  className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition btn-ripple"
                  title="Deactivate product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : activeSubTab === 'categories' ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-base text-slate-800">Categories List</h3>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-black rounded-xl shadow-lg glow-sky transition flex items-center gap-2 btn-ripple"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <div className="divide-y divide-slate-100 stagger-children">
            {categories.map((c) => (
              <div key={c.id} className="py-3.5 flex justify-between items-center hover:bg-slate-50 px-3 rounded-xl transition">
                <div>
                  <span className="font-bold text-slate-700 text-sm">{c.name}</span>
                  <p className="text-slate-400 text-xs">{c.description || 'No description'}</p>
                </div>
                <span className="bg-sky-100 text-sky-600 border border-sky-200 px-3 py-1 rounded-full font-bold">
                  {c.productCount} Products
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : activeSubTab === 'applications' ? (
        /* ─── Staff & Partner Applications Management ─── */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-base text-slate-800">Staff & Restaurant Partner Applications</h3>
              <p className="text-slate-400 text-xs mt-0.5">Review applications submitted by staff partners and generate their login passwords.</p>
            </div>
          </div>

          {staffApplications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Store className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="font-bold text-slate-600">No partner applications submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4 stagger-children">
              {staffApplications.map((app) => (
                <div key={app.id} className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-800">{app.name}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-600 border-red-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {app.status}
                      </span>
                      {app.storeName && (
                        <span className="bg-sky-100 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {app.storeName}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3.5 rounded-xl border border-slate-100 text-xs">
                    <div><strong className="text-slate-600">Email:</strong> {app.email}</div>
                    <div><strong className="text-slate-600">Phone:</strong> {app.phone}</div>
                    <div><strong className="text-slate-600">Store:</strong> {app.storeName || 'General Store'}</div>
                    {app.reason && (
                      <div className="col-span-full pt-1 border-t border-slate-100 text-slate-500">
                        <strong className="text-slate-700">Notes:</strong> {app.reason}
                      </div>
                    )}
                  </div>

                  {app.status === 'APPROVED' && app.generatedPassword && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                      <span>✅ <strong>Generated Password:</strong> <code className="bg-white px-2 py-0.5 rounded font-mono font-bold">{app.generatedPassword}</code></span>
                      <span className="text-[10px] text-emerald-600">Emailed to partner</span>
                    </div>
                  )}

                  {app.status === 'PENDING' && (
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => handleRejectApplication(app.id)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition btn-ripple"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppForApproval(app);
                          setCustomApprovalPassword('');
                          setApprovalAdminNote('');
                        }}
                        className="px-5 py-2 bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-black rounded-xl shadow-md glow-sky transition btn-ripple flex items-center gap-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Approve & Generate Password
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ─── Direct Staff Provision ─── */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md mx-auto space-y-4 shadow-sm animate-page">
          <div>
            <h3 className="font-black text-base text-slate-800">Direct Staff / Admin Provision</h3>
            <p className="text-slate-400 text-xs mt-0.5">Manually create a staff operator or admin account directly.</p>
          </div>

          <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Role</label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition"
              >
                <option value="STAFF">STAFF (Store & Restaurant Operations)</option>
                <option value="ADMIN">ADMIN (Full Super Admin Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Full Name</label>
              <input type="text" required value={staffName} onChange={(e) => setStaffName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition" />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Email</label>
              <input type="email" required value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition" />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Password</label>
              <input type="password" required minLength={8} value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition" />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Phone</label>
              <input type="tel" required pattern="[6-9][0-9]{9}" value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition" />
            </div>

            <button 
              type="submit" 
              disabled={actionLoading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-sky-400 text-white font-black text-sm rounded-xl shadow-lg transition btn-ripple disabled:opacity-50"
            >
              {actionLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      )}

      {/* Approve Application & Generate Password Modal */}
      {selectedAppForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={() => setSelectedAppForApproval(null)} />
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-in">
            <div>
              <h3 className="font-black text-base text-slate-800">Generate Staff Password & Approve</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Applicant: <strong>{selectedAppForApproval.name}</strong> ({selectedAppForApproval.email})
              </p>
            </div>

            <form onSubmit={handleApproveApplication} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Custom Password (Optional — Leave blank to auto-generate)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Staff#2026 (or leave empty for auto-generated code)"
                  value={customApprovalPassword}
                  onChange={(e) => setCustomApprovalPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-sky transition"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Admin Approval Note (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Welcome to Mini D-Mart Partner team!"
                  value={approvalAdminNote}
                  onChange={(e) => setApprovalAdminNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-sky transition resize-none"
                />
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-[11px] flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                <span>The login ID and generated password will be automatically emailed to the applicant upon clicking approve.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForApproval(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl border border-slate-200 btn-ripple"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-black rounded-xl shadow glow-sky btn-ripple disabled:opacity-50"
                >
                  {actionLoading ? 'Approving & Sending Email...' : 'Approve & Email Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={() => setShowProductModal(false)} />
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-3 shadow-2xl animate-scale-in">
            <h3 className="font-black text-sm text-slate-800">Add New Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-2 text-xs">
              <input type="text" placeholder="Product Name" required value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition" />
              <input type="text" placeholder="Description" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition" />
              <select value={prodCategoryId} onChange={(e) => setProdCategoryId(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={prodUnit} onChange={(e) => setProdUnit(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition">
                <option value="KG">KG</option>
                <option value="GRAMS">GRAMS</option>
                <option value="LITERS">LITERS</option>
                <option value="ML">ML</option>
                <option value="PIECES">PIECES</option>
                <option value="PACK">PACK</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="MRP Price" required value={prodMrp} onChange={(e) => setProdMrp(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition" />
                <input type="number" placeholder="Selling Price" required value={prodSelling} onChange={(e) => setProdSelling(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition" />
              </div>
              <input type="number" placeholder="Initial Stock Qty" required value={prodStock} onChange={(e) => setProdStock(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition" />
              <input type="text" placeholder="Image URL (Optional)" value={prodImage} onChange={(e) => setProdImage(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-orange transition" />

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl border border-slate-200 btn-ripple">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-black rounded-xl shadow glow-orange btn-ripple disabled:opacity-50">
                  {actionLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={() => setShowCategoryModal(false)} />
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-3 shadow-2xl animate-scale-in">
            <h3 className="font-black text-sm text-slate-800">Add New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-2 text-xs">
              <input type="text" placeholder="Category Name" required value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-sky transition" />
              <input type="text" placeholder="Description" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-sky transition" />
              <input type="text" placeholder="Image URL (Optional)" value={catImage} onChange={(e) => setCatImage(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 input-sky transition" />

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl border border-slate-200 btn-ripple">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-black rounded-xl shadow glow-sky btn-ripple disabled:opacity-50">
                  {actionLoading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
