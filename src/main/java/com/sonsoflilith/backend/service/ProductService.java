package com.sonsoflilith.backend.service;

import com.sonsoflilith.backend.dto.request.ProductRequest;
import com.sonsoflilith.backend.dto.response.PagedResponse;
import com.sonsoflilith.backend.dto.response.ProductResponse;

public interface ProductService {
    ProductResponse create(ProductRequest request);
    ProductResponse getById(Long id);
    ProductResponse update(Long id, ProductRequest request);
    void delete(Long id);
    PagedResponse<ProductResponse> getAll(int page, int size, String sort, String dir);
    PagedResponse<ProductResponse> getAllIncludingInactive(int page, int size, String sort, String dir);
    PagedResponse<ProductResponse> getByCategory(Long categoryId, int page, int size, String sort, String dir);
}