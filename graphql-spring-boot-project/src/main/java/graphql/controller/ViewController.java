package graphql.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String index() {
        return "index"; // Trang chủ cho user
    }
    
    @GetMapping("/admin")
    public String admin() {
        return "admin"; // Trang quản lý cho admin
    }
}