import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { categoryService } from '../services/categoryService';
import { Pencil, Trash2, Check, X, Tag } from 'lucide-react';
import { Alert } from '../components/ui/Alert';

export const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await categoryService.getAllCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await categoryService.createCategory({ name: newCategory.trim() });
      setSuccess('Category added successfully!');
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  // Edit category
  const handleEditCategory = (cat) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
    setError('');
    setSuccess('');
  };

  const handleUpdateCategory = async (catId) => {
    if (!editingName.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await categoryService.updateCategory(catId, { name: editingName.trim() });
      setSuccess('Category updated successfully!');
      setEditingId(null);
      setEditingName('');
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await categoryService.deleteCategory(catId);
      setSuccess('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#020617] min-h-screen text-[#f8fafc] pt-20 pb-12 overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-slate-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Tag className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Categories</h1>
            <p className="text-gray-400 text-sm">Create and modify course categories</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <form onSubmit={handleAddCategory} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Enter new category name..."
                  disabled={loading}
                  className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 h-10"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !newCategory.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 rounded-lg shadow-lg shadow-blue-500/20"
              >
                {loading ? <Spinner size="sm" /> : 'Add Category'}
              </Button>
            </form>
          </div>

          <div className="p-6">
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {success && <Alert variant="success" className="mb-4">{success}</Alert>}

            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              Existing Categories
              <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">{categories.length}</span>
            </h2>

            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/5 dashed">
                <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No categories found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat._id} className="group p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all flex items-center justify-between">
                    {editingId === cat._id ? (
                      <div className="flex items-center gap-2 w-full animate-in fade-in">
                        <Input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="bg-black/50 border-blue-500/50 text-white h-9 flex-1"
                          disabled={loading}
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleUpdateCategory(cat._id)} disabled={loading || !editingName.trim()} className="h-9 w-9 p-0 bg-green-500/20 text-green-400 hover:bg-green-500/30">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditingName(''); }} disabled={loading} className="h-9 w-9 p-0 text-gray-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-gray-200 pl-2">{cat.name}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" onClick={() => handleEditCategory(cat)} disabled={loading} className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(cat._id)} disabled={loading} className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
