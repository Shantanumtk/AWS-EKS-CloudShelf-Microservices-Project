package com.cloudshelf.cartservice.client;

import com.cloudshelf.cartservice.dto.StockCheckResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
    name = "stock-check-service", 
    url = "${STOCK_CHECK_SERVICE_URL:http://stock-check-service.cloudshelf.svc.cluster.local:8083}"
)
public interface StockCheckClient {

    @GetMapping("/api/stock/check")
    StockCheckResponse checkStock(@RequestParam("bookId") String bookId,
                                  @RequestParam("quantity") int quantity);
}