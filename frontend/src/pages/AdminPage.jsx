import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('products');
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' });
  const [editingId, setEditingId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.roles?.includes('ROLE_ADMIN')) { navigate('/'); return; }
    loadData();
  }, []);

  const loadData = () => {
    api.get('/products/all', { params: { page: 0, size: 100, sort: 'name' } })
      .then(res => setProducts(res.data.content));
    api.get('/categories').then(res => setCategories(res.data));
    api.get('/orders').then(res => setOrders(res.data));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return form.imageUrl;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      const res = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al subir la imagen';
      alert(msg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrl = await uploadImage();
      if (imageFile && !imageUrl) return;

      const payload = {
        ...form,
        imageUrl: imageUrl || form.imageUrl,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId)
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setForm({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' });
      setImageFile(null);
      setImagePreview(null);
      setEditingId(null);
      loadData();
    } catch { alert('Error al guardar el producto.'); }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setImageFile(null);
    setImagePreview(product.imageUrl || null);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      categoryId: categories.find(c => c.name === product.categoryName)?.id || ''
    });
    setTab('products');
  };

  const handleCancel = () => {
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setForm({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' });
  };

  const handleToggleActive = async (product) => {
    try {
      await api.put(`/products/${product.id}`, {
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl || '',
        categoryId: categories.find(c => c.name === product.categoryName)?.id,
        active: !product.active
      });
      loadData();
    } catch { alert('Error al cambiar el estado del producto.'); }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('¿Eliminar este pedido?')) return;
    try {
      await api.delete(`/orders/${id}`);
      loadData();
    } catch { alert('Error al eliminar el pedido.'); }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', categoryForm);
      setCategoryForm({ name: '', description: '' });
      loadData();
    } catch { alert('Error al crear la categoría. Puede que ya exista.'); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      loadData();
    } catch { alert('No se puede eliminar una categoría con productos asociados.'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Panel Admin</h1>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Tienda</button>
      </div>

      <div style={styles.tabs}>
        {['products', 'categories', 'orders'].map(t => (
          <button key={t} style={tab === t ? styles.tabActive : styles.tab} onClick={() => setTab(t)}>
            {t === 'products' ? 'Productos' : t === 'categories' ? 'Categorías' : 'Pedidos'}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div>
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
            <div style={styles.formGrid}>
              <input style={styles.input} placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input style={styles.input} placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input style={styles.input} placeholder="Precio" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              <input style={styles.input} placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
              <select style={styles.input} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Selecciona categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={styles.imageSection}>
              <label style={styles.imageLabel}>Imagen del producto</label>
              <div style={styles.imageRow}>
                {imagePreview && (
                  <img src={imagePreview} alt="preview" style={styles.imagePreview} />
                )}
                <div style={styles.imageInputWrapper}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" style={styles.fileLabel}>
                    {imageFile ? imageFile.name : '📁 Seleccionar imagen'}
                  </label>
                  <span style={styles.fileHint}>JPG, PNG o WEBP · máx 5MB</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button style={uploading ? styles.submitBtnDisabled : styles.submitBtn} type="submit" disabled={uploading}>
                {uploading ? 'Subiendo imagen...' : editingId ? 'Actualizar' : 'Crear'}
              </button>
              {editingId && (
                <button style={styles.cancelBtn} type="button" onClick={handleCancel}>Cancelar</button>
              )}
            </div>
          </form>

          <table style={styles.table}>
            <thead>
              <tr>
                {['Imagen', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ ...styles.tr, opacity: p.active ? 1 : 0.5 }}>
                  <td style={styles.td}>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} style={styles.tableImg} />
                      : <span style={{ color: '#555' }}>—</span>
                    }
                  </td>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.categoryName}</td>
                  <td style={styles.td}>{p.price}€</td>
                  <td style={styles.td}>{p.stock}</td>
                  <td style={styles.td}>
                    <span style={p.active ? styles.activeTag : styles.inactiveTag}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => handleEdit(p)}>Editar</button>
                    <button
                      style={p.active ? styles.deactivateBtn : styles.activateBtn}
                      onClick={() => handleToggleActive(p)}
                    >
                      {p.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'categories' && (
        <div>
          <form onSubmit={handleCategorySubmit} style={styles.form}>
            <h3 style={styles.formTitle}>Nueva categoría</h3>
            <div style={styles.formGrid}>
              <input style={styles.input} placeholder="Nombre" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
              <input style={styles.input} placeholder="Descripción" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            </div>
            <button style={styles.submitBtn} type="submit">Crear categoría</button>
          </form>

          <table style={styles.table}>
            <thead>
              <tr>
                {['ID', 'Nombre', 'Descripción', 'Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.td}>#{c.id}</td>
                  <td style={styles.td}>{c.name}</td>
                  <td style={styles.td}>{c.description}</td>
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => handleDeleteCategory(c.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <table style={styles.table}>
          <thead>
            <tr>
              {['ID', 'Usuario', 'Total', 'Estado', 'Fecha', 'Acciones'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={styles.tr}>
                <td style={styles.td}>#{o.id}</td>
                <td style={styles.td}>{o.username}</td>
                <td style={styles.td}>{o.total}€</td>
                <td style={styles.td}>{o.status}</td>
                <td style={styles.td}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button style={styles.deleteBtn} onClick={() => handleDeleteOrder(o.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#0a0a0a', minHeight: '100vh', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { color: '#C057E0', margin: 0 },
  backBtn: { backgroundColor: 'transparent', border: '1px solid #9B4DB8', color: '#C057E0', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '2rem' },
  tab: { backgroundColor: 'transparent', border: '1px solid #9B4DB8', color: '#9B4DB8', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer' },
  tabActive: { backgroundColor: '#9B4DB8', border: '1px solid #9B4DB8', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer' },
  form: { backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #2a2a2a', marginBottom: '2rem' },
  formTitle: { color: '#C057E0', marginBottom: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  input: { padding: '0.6rem', backgroundColor: '#2a2a2a', border: '1px solid #9B4DB8', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' },
  imageSection: { marginTop: '1rem' },
  imageLabel: { color: '#C057E0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' },
  imageRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  imagePreview: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #9B4DB8' },
  imageInputWrapper: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  fileInput: { display: 'none' },
  fileLabel: { backgroundColor: '#2a2a2a', border: '1px solid #9B4DB8', color: '#C057E0', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  fileHint: { color: '#555', fontSize: '0.75rem' },
  submitBtn: { backgroundColor: '#9B4DB8', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer' },
  submitBtnDisabled: { backgroundColor: '#555', color: '#888', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'not-allowed' },
  cancelBtn: { backgroundColor: 'transparent', color: '#aaa', border: '1px solid #555', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#C057E0', padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2a2a2a' },
  tr: { borderBottom: '1px solid #1a1a1a' },
  td: { color: '#fff', padding: '0.75rem' },
  tableImg: { width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' },
  editBtn: { backgroundColor: '#9B4DB8', color: '#fff', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem' },
  deleteBtn: { backgroundColor: '#ff4444', color: '#fff', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer' },
  deactivateBtn: { backgroundColor: '#ff8800', color: '#fff', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer' },
  activateBtn: { backgroundColor: '#44aa44', color: '#fff', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer' },
  activeTag: { color: '#44ff88', fontSize: '0.85rem' },
  inactiveTag: { color: '#ff4444', fontSize: '0.85rem' },
};
