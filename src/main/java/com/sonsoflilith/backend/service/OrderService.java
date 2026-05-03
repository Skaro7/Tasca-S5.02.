package com.sonsoflilith.backend.service;

import com.sonsoflilith.backend.dto.request.OrderRequest;
import com.sonsoflilith.backend.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse create(OrderRequest request, String username);
    List<OrderResponse> getMyOrders(String username);
    List<OrderResponse> getAllOrders();
    void delete(Long id);
}