package graphql.controller;

import graphql.entity.Category;
import graphql.input.CategoryInput;
import graphql.service.CategoryService;
import jakarta.validation.Valid; // Đảm bảo import đúng
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Controller
@Validated // Kích hoạt validation
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @QueryMapping
    public List<Category> allCategories() {
        return categoryService.getAllCategories();
    }

    @QueryMapping
    public Category categoryById(@Argument Long id) {
        return categoryService.getCategoryById(id).orElse(null);
    }

    @MutationMapping
    public Category createCategory(@Argument @Valid CategoryInput categoryInput) {
        return categoryService.createCategory(categoryInput);
    }

    @MutationMapping
    public Category updateCategory(@Argument Long id, @Argument @Valid CategoryInput categoryInput) {
        return categoryService.updateCategory(id, categoryInput).orElse(null);
    }

    @MutationMapping
    public boolean deleteCategory(@Argument Long id) {
        return categoryService.deleteCategory(id);
    }
}