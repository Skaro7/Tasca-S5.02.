import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const filterByCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      api.get(`/products/category/${categoryId}`).then(res => setProducts(res.data));
    } else {
      api.get('/products').then(res => setProducts(res.data));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>Sons of Lilith</h1>
        <div style={styles.navRight}>
          {user && <span style={styles.welcome}>Hola, {user.username}</span>}
          <button style={styles.cartBtn} onClick={() => navigate('/cart')}>🛒 Carrito</button>
          {user?.roles?.includes('ROLE_ADMIN') && (
            <button style={styles.adminBtn} onClick={() => navigate('/admin')}>Admin</button>
          )}
          {user ? (
            <button style={styles.logoutBtn} onClick={handleLogout}>Salir</button>
          ) : (
            <button style={styles.logoutBtn} onClick={() => navigate('/login')}>Login</button>
          )}
        </div>
      </nav>

      <div style={styles.filters}>
        <button
          style={selectedCategory === null ? styles.filterActive : styles.filterBtn}
          onClick={() => filterByCategory(null)}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            style={selectedCategory === cat.id ? styles.filterActive : styles.filterBtn}
            onClick={() => filterByCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {products.map(product => (
          <div key={product.id} style={styles.card}>
            <div style={styles.imageContainer}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={styles.image} />
              ) : (
                <div style={styles.placeholder}>🖼️</div>
              )}
            </div>
            <div style={styles.cardBody}>
              <span style={styles.category}>{product.categoryName}</span>
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.description}>{product.description}</p>
              <div style={styles.cardFooter}>
                <span style={styles.price}>{product.price}€</span>
                <span style={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                  {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                </span>
              </div>
              <button
                style={product.stock > 0 ? styles.addBtn : styles.addBtnDisabled}
                disabled={product.stock === 0}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                Ver detalle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#0a0a0a', minHeight: '100vh' },
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 2rem', backgroundColor: '#111', borderBottom: '1px solid #9B4DB8',
  },
  logo: { color: '#C057E0', fontSize: '1.5rem', margin: 0 },
  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  welcome: { color: '#aaa' },
  cartBtn: { backgroundColor: 'transparent', border: '1px solid #9B4DB8', color: '#C057E0', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' },
  adminBtn: { backgroundColor: '#9B4DB8', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' },
  logoutBtn: { backgroundColor: 'transparent', border: '1px solid #555', color: '#aaa', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' },
  filters: { display: 'flex', gap: '0.5rem', padding: '1rem 2rem', flexWrap: 'wrap' },
  filterBtn: { backgroundColor: 'transparent', border: '1px solid #9B4DB8', color: '#9B4DB8', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer' },
  filterActive: { backgroundColor: '#9B4DB8', border: '1px solid #9B4DB8', color: '#fff', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', padding: '1rem 2rem' },
  card: { backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a', overflow: 'hidden', transition: 'border-color 0.2s' },
  imageContainer: { height: '200px', overflow: 'hidden', backgroundColor: '#2a2a2a' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' },
  cardBody: { padding: '1rem' },
  category: { color: '#C057E0', fontSize: '0.75rem', textTransform: 'uppercase' },
  productName: { color: '#fff', margin: '0.5rem 0', fontSize: '1.1rem' },
  description: { color: '#aaa', fontSize: '0.85rem', marginBottom: '0.75rem' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  price: { color: '#C057E0', fontWeight: 'bold', fontSize: '1.2rem' },
  inStock: { color: '#44ff88', fontSize: '0.8rem' },
  outOfStock: { color: '#ff4444', fontSize: '0.8rem' },
  addBtn: { width: '100%', padding: '0.6rem', backgroundColor: '#9B4DB8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  addBtnDisabled: { width: '100%', padding: '0.6rem', backgroundColor: '#444', color: '#888', border: 'none', borderRadius: '8px', cursor: 'not-allowed' },
};