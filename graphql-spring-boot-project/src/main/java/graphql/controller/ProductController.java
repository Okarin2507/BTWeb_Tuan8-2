package graphql.controller;

import graphql.entity.Product;
import graphql.input.ProductInput;
import graphql.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import java.util.Optional;
import java.util.List;

@Controller
@Validated
public class ProductController {
    @Autowired
    private ProductService productService;

    // Record để đóng gói dữ liệu phân trang trả về cho GraphQL
    public record ProductPage(List<Product> content, int totalPages, int currentPage, long totalElements) {}

    @QueryMapping
    public ProductPage allProductsByPrice(@Argument int page, @Argument int size) {
        Page<Product> productPage = productService.getAllProductsSortedByPrice(page, size);
        return new ProductPage(productPage.getContent(), productPage.getTotalPages(), productPage.getNumber(), productPage.getTotalElements());
    }

    @QueryMapping
    public ProductPage productsByCategory(@Argument Long categoryId, @Argument int page, @Argument int size) {
        Page<Product> productPage = productService.getProductsByCategoryId(categoryId, page, size);
        return new ProductPage(productPage.getContent(), productPage.getTotalPages(), productPage.getNumber(), productPage.getTotalElements());
    }

    @QueryMapping
    public Optional<Product> productById(@Argument Long id) {
        return productService.getProductById(id);
    }

    @MutationMapping
    public Product createProduct(@Argument @Valid ProductInput productInput) {
        return productService.createProduct(productInput);
    }

    @MutationMapping
    public Product updateProduct(@Argument Long id, @Argument @Valid ProductInput productInput) {
        return productService.updateProduct(id, productInput).orElse(null);
    }

    @MutationMapping
    public boolean deleteProduct(@Argument Long id) {
        return productService.deleteProduct(id);
    }
}