package graphql.input;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CategoryInput {
    @NotEmpty(message = "Category name cannot be empty.")
    private String name;
    private String images;
}