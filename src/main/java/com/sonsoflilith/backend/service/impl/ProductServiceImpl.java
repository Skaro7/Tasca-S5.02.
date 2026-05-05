package com.sonsoflilith.backend.service.impl;

import com.sonsoflilith.backend.dto.request.ProductRequest;
import com.sonsoflilith.backend.dto.response.PagedResponse;
import com.sonsoflilith.backend.dto.response.ProductResponse;
import com.sonsoflilith.backend.entity.Category;
import com.sonsoflilith.backend.entity.Product;
import com.sonsoflilith.backend.exception.CategoryNotFoundException;
import com.sonsoflilith.backend.exception.ProductNotFoundException;
import com.sonsoflilith.backend.repository.CategoryRepository;
import com.sonsoflilith.backend.repository.ProductRepository;
import com.sonsoflilith.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // ── Helper ────────────────────────────────────────────────────────────────

    private Pageable buildPageable(int page, int size, String sort) {
        return PageRequest.of(page, size, Sort.by(sort).ascending());
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    @Override
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return mapToResponse(product);
    }

    @Override
    public PagedResponse<ProductResponse> getAll(int page, int size, String sort) {
        return PagedResponse.from(
                productRepository.findByActiveTrue(buildPageable(page, size, sort))
                        .map(this::mapToResponse)
        );
    }

    @Override
    public PagedResponse<ProductResponse> getAllIncludingInactive(int page, int size, String sort) {
        return PagedResponse.from(
                productRepository.findAll(buildPageable(page, size, sort))
                        .map(this::mapToResponse)
        );
    }

    @Override
    public PagedResponse<ProductResponse> getByCategory(Long categoryId, int page, int size, String sort) {
        return PagedResponse.from(
                productRepository.findByCategoryIdAndActiveTrue(categoryId, buildPageable(page, size, sort))
                        .map(this::mapToResponse)
        );
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    @Override
    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new CategoryNotFoundException(request.getCategoryId()));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new CategoryNotFoundException(request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        product.setActive(false);
        productRepository.save(product);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getImageUrl(),
                product.getCategory().getName(),
                product.isActive()
        );
    }
}