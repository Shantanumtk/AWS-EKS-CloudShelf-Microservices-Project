package com.cloudshelf.cartservice.client;

import com.cloudshelf.cartservice.dto.OrderRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "order-service")
public interface OrderServiceClient {

    @PostMapping("/api/orders")
    String placeOrder(@RequestBody OrderRequest request);
}
