package com.cloudshelf.cartservice.service;

import com.cloudshelf.cartservice.client.OrderServiceClient;
import com.cloudshelf.cartservice.client.StockCheckClient;
import com.cloudshelf.cartservice.dto.OrderItem;
import com.cloudshelf.cartservice.dto.OrderRequest;
import com.cloudshelf.cartservice.dto.StockCheckResponse;
import com.cloudshelf.cartservice.model.Cart;
import com.cloudshelf.cartservice.model.CartItem;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final StockCheckClient stockCheckClient;
    private final OrderServiceClient orderServiceClient;

    private String key(String userId) {
        return "cart:" + userId;
    }

    public Cart getCart(String userId) {
        Cart cart = (Cart) redisTemplate.opsForValue().get(key(userId));
        return cart != null ? cart : new Cart(userId, new ArrayList<>());
    }

    public Cart addToCart(String userId, CartItem item) {

        StockCheckResponse response =
                stockCheckClient.checkStock(item.getBookId(), item.getQuantity());

        if (!response.isInStock()) {
            throw new RuntimeException("Not enough stock available.");
        }

        Cart cart = getCart(userId);

        cart.getItems().removeIf(i -> i.getBookId().equals(item.getBookId()));

        cart.getItems().add(item);

        redisTemplate.opsForValue().set(key(userId), cart);

        return cart;
    }

    public Cart removeItem(String userId, String bookId) {
        Cart cart = getCart(userId);

        cart.getItems().removeIf(i -> i.getBookId().equals(bookId));

        redisTemplate.opsForValue().set(key(userId), cart);

        return cart;
    }

    public void clearCart(String userId) {
        redisTemplate.delete(key(userId));
    }

    public String checkout(String userId) {

        Cart cart = getCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot checkout.");
        }

        OrderRequest request = new OrderRequest();
        request.setUserId(userId);

        List<OrderItem> orderItems = cart.getItems()
                .stream()
                .map(i -> new OrderItem(i.getBookId(), i.getQuantity()))
                .collect(Collectors.toList());

        request.setItems(orderItems);

        Map<String, String> response = orderServiceClient.placeOrder(request);

    if (!"success".equals(response.get("status"))) {
        throw new RuntimeException("Order failed: " + response.get("message"));
    }

        clearCart(userId);

        return response.get("orderId");
    }
}
