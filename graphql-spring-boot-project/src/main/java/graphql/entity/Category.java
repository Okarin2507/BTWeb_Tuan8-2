package graphql.entity;

import jakarta.persistence.*;
import lombok.Data; 
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.Set;

@Entity
@Table(name = "categories")
@Data 
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String images;
    
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany(mappedBy = "categories", fetch = FetchType.EAGER)
    private Set<Product> products;
}