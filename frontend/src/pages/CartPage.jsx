import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const items = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
      await api.post('/orders', { items });
      clearCart();
      alert('¡Pedido realizado con éxito!');
      navigate('/');
    } catch {
      alert('Error al realizar el pedido.');
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate('/')}>← Volver al catálogo</button>
      <h2 style={styles.title}>Tu Carrito</h2>
      {cart.length === 0 ? (
        <p style={styles.empty}>Tu carrito está vacío.</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} style={styles.item}>
              <div>
                <p style={styles.itemName}>{item.name}</p>
                <p style={styles.itemPrice}>{item.price}€ x {item.quantity}</p>
              </div>
              <div style={styles.itemActions}>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span style={styles.qty}>{item.quantity}</span>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)}>🗑️</button>
              </div>
            </div>
          ))}
          <div style={styles.total}>
            <span style={styles.totalLabel}>Total:</span>
            <span style={styles.totalPrice}>{total.toFixed(2)}€</span>
          </div>
          <button style={styles.orderBtn} onClick={handleOrder}>Confirmar pedido</button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#0a0a0a', minHeight: '100vh', padding: '2rem', maxWidth: '700px', margin: '0 auto' },
  back: { backgroundColor: 'transparent', border: 'none', color: '#C057E0', cursor: 'pointer', fontSize: '1rem', marginBottom: '1.5rem' },
  title: { color: '#C057E0', marginBottom: '1.5rem' },
  empty: { color: '#aaa', textAlign: 'center' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', border: '1px solid #2a2a2a' },
  itemName: { color: '#fff', margin: 0 },
  itemPrice: { color: '#C057E0', margin: '0.25rem 0 0' },
  itemActions: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  qtyBtn: { backgroundColor: '#9B4DB8', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer' },
  qty: { color: '#fff', minWidth: '20px', textAlign: 'center' },
  removeBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' },
  total: { display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid #2a2a2a', marginTop: '1rem' },
  totalLabel: { color: '#fff', fontSize: '1.2rem' },
  totalPrice: { color: '#C057E0', fontSize: '1.5rem', fontWeight: 'bold' },
  orderBtn: { width: '100%', padding: '1rem', backgroundColor: '#9B4DB8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', marginTop: '1rem' },
};