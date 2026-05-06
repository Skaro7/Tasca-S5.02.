package com.sonsoflilith.backend;

import com.sonsoflilith.backend.dto.request.OrderItemRequest;
import com.sonsoflilith.backend.dto.request.OrderRequest;
import com.sonsoflilith.backend.dto.response.OrderResponse;
import com.sonsoflilith.backend.entity.*;
import com.sonsoflilith.backend.exception.InsufficientStockException;
import com.sonsoflilith.backend.exception.ProductNotFoundException;
import com.sonsoflilith.backend.exception.UserNotFoundException;
import com.sonsoflilith.backend.repository.OrderRepository;
import com.sonsoflilith.backend.repository.ProductRepository;
import com.sonsoflilith.backend.repository.UserRepository;
import com.sonsoflilith.backend.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User user;
    private Product product;
    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Ropa");

        product = new Product();
        product.setId(1L);
        product.setName("Camiseta Lilith");
        product.setPrice(BigDecimal.valueOf(29.99));
        product.setStock(10);
        product.setActive(true);
        product.setCategory(category);

        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
    }

    // ── Happy paths ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("Happy path: crear pedido con stock suficiente")
    void create_shouldCreateOrder_whenStockIsSufficient() {
        OrderItemRequest itemRequest = new OrderItemRequest(1L, 2);
        OrderRequest request = new OrderRequest(List.of(itemRequest));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        OrderResponse response = orderService.create(request, "testuser");

        assertThat(response).isNotNull();
        assertThat(response.getTotal()).isEqualByComparingTo(BigDecimal.valueOf(59.98));
        assertThat(product.getStock()).isEqualTo(8); // stock decrementado
        verify(productRepository).save(product);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Happy path: crear pedido compra exactamente el stock disponible")
    void create_shouldCreateOrder_whenQuantityEqualsStock() {
        product.setStock(5);
        OrderItemRequest itemRequest = new OrderItemRequest(1L, 5);
        OrderRequest request = new OrderRequest(List.of(itemRequest));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(2L);
            return o;
        });

        OrderResponse response = orderService.create(request, "testuser");

        assertThat(response).isNotNull();
        assertThat(product.getStock()).isEqualTo(0);
        verify(orderRepository).save(any(Order.class));
    }

    // ── Sad paths ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Sad path: lanza InsufficientStockException cuando stock es 0")
    void create_shouldThrow_whenStockIsZero() {
        product.setStock(0);
        OrderItemRequest itemRequest = new OrderItemRequest(1L, 1);
        OrderRequest request = new OrderRequest(List.of(itemRequest));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> orderService.create(request, "testuser"))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Camiseta Lilith");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Sad path: lanza InsufficientStockException cuando se pide más del stock disponible")
    void create_shouldThrow_whenRequestedQuantityExceedsStock() {
        product.setStock(3);
        OrderItemRequest itemRequest = new OrderItemRequest(1L, 10);
        OrderRequest request = new OrderRequest(List.of(itemRequest));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> orderService.create(request, "testuser"))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("requested 10")
                .hasMessageContaining("available 3");

        verify(orderRepository, never()).save(any());
        verify(productRepository, never()).save(any()); // stock no se toca
    }

    @Test
    @DisplayName("Sad path: lanza UserNotFoundException si el usuario no existe")
    void create_shouldThrow_whenUserNotFound() {
        OrderRequest request = new OrderRequest(List.of(new OrderItemRequest(1L, 1)));

        when(userRepository.findByUsername("fantasma")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.create(request, "fantasma"))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("fantasma");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Sad path: lanza ProductNotFoundException si el producto no existe")
    void create_shouldThrow_whenProductNotFound() {
        OrderRequest request = new OrderRequest(List.of(new OrderItemRequest(99L, 1)));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.create(request, "testuser"))
                .isInstanceOf(ProductNotFoundException.class)
                .hasMessageContaining("99");

        verify(orderRepository, never()).save(any());
    }
}