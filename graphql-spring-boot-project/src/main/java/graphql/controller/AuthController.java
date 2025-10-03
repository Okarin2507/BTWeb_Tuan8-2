package graphql.controller;

import graphql.config.security.JwtService;
import graphql.input.LoginInput;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserDetailsService userDetailsService;

    @GetMapping("/login")
    public String showLoginForm(Model model) {
        model.addAttribute("loginInput", new LoginInput());
        return "login";
    }

    @PostMapping("/login")
    @ResponseBody
    public ResponseEntity<String> login(@Valid @RequestBody LoginInput loginInput) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginInput.getEmail(), loginInput.getPassword())
        );
        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginInput.getEmail());
        final String jwt = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(jwt);
    }
    
    @GetMapping("/logout")
    public String logout() {
        // Frontend sẽ xử lý việc xóa token
        return "redirect:/login";
    }
}