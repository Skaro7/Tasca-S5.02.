package com.sonsoflilith.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String username;
    private List<OrderItemResponse> items;
    private BigDecimal total;
    private String status;
    private LocalDateTime createdAt;
}