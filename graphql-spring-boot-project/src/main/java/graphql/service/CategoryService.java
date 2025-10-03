package graphql.service;

import graphql.entity.Category;
import graphql.input.CategoryInput;
import graphql.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category createCategory(CategoryInput categoryInput) {
        Category category = new Category();
        category.setName(categoryInput.getName());
        category.setImages(categoryInput.getImages());
        return categoryRepository.save(category);
    }

    public Optional<Category> updateCategory(Long id, CategoryInput categoryInput) {
        return categoryRepository.findById(id).map(category -> {
            category.setName(categoryInput.getName());
            category.setImages(categoryInput.getImages());
            return categoryRepository.save(category);
        });
    }

    public boolean deleteCategory(Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}