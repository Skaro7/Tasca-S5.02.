import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
  }, [id]);

  if (!product) return <div style={styles.loading}>Cargando...</div>;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate('/')}>← Volver al catálogo</button>
      <div style={styles.card}>
        <div style={styles.imageContainer}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={styles.image} />
          ) : (
            <div style={styles.placeholder}>🖼️</div>
          )}
        </div>
        <div style={styles.info}>
          <span style={styles.category}>{product.categoryName}</span>
          <h1 style={styles.name}>{product.name}</h1>
          <p style={styles.description}>{product.description}</p>
          <p style={styles.price}>{product.price}€</p>
          <p style={product.stock > 0 ? styles.inStock : styles.outOfStock}>
            {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
          </p>
          {product.stock > 0 && (
            <div style={styles.actions}>
              <div style={styles.quantityControl}>
                <button style={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span style={styles.qty}>{quantity}</span>
                <button style={styles.qtyBtn} onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button style={added ? styles.addBtnSuccess : styles.addBtn} onClick={handleAddToCart}>
                {added ? '✓ Añadido' : 'Añadir al carrito'}
              </button>
            </div>
          )}
          {added && (
            <div style={styles.addedMsg}>
              <span>Producto añadido al carrito. </span>
              <button style={styles.goCartBtn} onClick={() => navigate('/cart')}>Ver carrito →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#0a0a0a', minHeight: '100vh', padding: '2rem' },
  loading: { color: '#fff', textAlign: 'center', padding: '2rem' },
  back: { backgroundColor: 'transparent', border: 'none', color: '#C057E0', cursor: 'pointer', fontSize: '1rem', marginBottom: '1.5rem' },
  card: { display: 'flex', gap: '2rem', backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid #9B4DB8', overflow: 'hidden', maxWidth: '900px', margin: '0 auto' },
  imageContainer: { width: '400px', minHeight: '300px', backgroundColor: '#2a2a2a', flexShrink: 0 },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', fontSize: '4rem' },
  info: { padding: '2rem', flex: 1 },
  category: { color: '#C057E0', fontSize: '0.8rem', textTransform: 'uppercase' },
  name: { color: '#fff', fontSize: '2rem', margin: '0.5rem 0' },
  description: { color: '#aaa', marginBottom: '1rem' },
  price: { color: '#C057E0', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' },
  inStock: { color: '#44ff88', marginBottom: '1.5rem' },
  outOfStock: { color: '#ff4444', marginBottom: '1.5rem' },
  actions: { display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' },
  quantityControl: { display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#2a2a2a', borderRadius: '8px', padding: '0.25rem' },
  qtyBtn: { backgroundColor: '#9B4DB8', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.2rem' },
  qty: { color: '#fff', minWidth: '30px', textAlign: 'center' },
  addBtn: { backgroundColor: '#9B4DB8', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
  addBtnSuccess: { backgroundColor: '#44aa44', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
  addedMsg: { marginTop: '1rem', color: '#aaa', fontSize: '0.9rem' },
  goCartBtn: { backgroundColor: 'transparent', border: 'none', color: '#C057E0', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' },
};