package com.sonsoflilith.backend.service;

import com.sonsoflilith.backend.dto.request.ProductRequest;
import com.sonsoflilith.backend.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {
    ProductResponse create(ProductRequest request);
    ProductResponse getById(Long id);
    List<ProductResponse> getAll();
    List<ProductResponse> getAllIncludingInactive();
    List<ProductResponse> getByCategory(Long categoryId);
    ProductResponse update(Long id, ProductRequest request);
    void delete(Long id);
}