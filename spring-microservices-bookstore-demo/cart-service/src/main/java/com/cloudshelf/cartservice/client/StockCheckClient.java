package com.cloudshelf.cartservice.client;

import com.cloudshelf.cartservice.dto.StockCheckResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "stock-check-service")
public interface StockCheckClient {

    @GetMapping("/api/stock/check")
    StockCheckResponse checkStock(@RequestParam("bookId") String bookId,
                                  @RequestParam("quantity") int quantity);
}
