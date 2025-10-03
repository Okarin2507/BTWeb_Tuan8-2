package graphql.input;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ProductInput {
    @NotEmpty(message = "Title is required.")
    private String title;

    @Min(value = 0, message = "Quantity must be non-negative.")
    private int quantity;

    private String description;

    @Min(value = 0, message = "Price must be non-negative.")
    private double price;

    @NotNull(message = "User ID is required.")
    private Long userId;

    private List<Long> categoryIds;
}