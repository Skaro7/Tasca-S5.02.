package com.sonsoflilith.backend.service;

import com.sonsoflilith.backend.dto.request.CategoryRequest;
import com.sonsoflilith.backend.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse create(CategoryRequest request);
    CategoryResponse getById(Long id);
    List<CategoryResponse> getAll();
    CategoryResponse update(Long id, CategoryRequest request);
    void delete(Long id);
}