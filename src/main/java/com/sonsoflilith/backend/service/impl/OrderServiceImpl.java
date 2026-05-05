package com.sonsoflilith.backend.service.impl;

import com.sonsoflilith.backend.dto.request.OrderItemRequest;
import com.sonsoflilith.backend.dto.request.OrderRequest;
import com.sonsoflilith.backend.dto.response.OrderItemResponse;
import com.sonsoflilith.backend.dto.response.OrderResponse;
import com.sonsoflilith.backend.entity.Order;
import com.sonsoflilith.backend.entity.OrderItem;
import com.sonsoflilith.backend.entity.Product;
import com.sonsoflilith.backend.entity.User;
import com.sonsoflilith.backend.exception.OrderNotFoundException;
import com.sonsoflilith.backend.exception.ProductNotFoundException;
import com.sonsoflilith.backend.exception.UserNotFoundException;
import com.sonsoflilith.backend.repository.OrderRepository;
import com.sonsoflilith.backend.repository.ProductRepository;
import com.sonsoflilith.backend.repository.UserRepository;
import com.sonsoflilith.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public OrderResponse create(OrderRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException(itemRequest.getProductId()));

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }

            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setPriceAtPurchase(product.getPrice());

            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            items.add(item);
        }

        Order order = new Order();
        order.setUser(user);
        order.setItems(items);
        order.setTotal(total);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        items.forEach(item -> item.setOrder(order));
        orderRepository.save(order);

        return mapToResponse(order);
    }

    @Override
    public List<OrderResponse> getMyOrders(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
        return orderRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        orderRepository.delete(order);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getPriceAtPurchase()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getUser().getUsername(),
                itemResponses,
                order.getTotal(),
                order.getStatus().name(),
                order.getCreatedAt()
        );
    }
}