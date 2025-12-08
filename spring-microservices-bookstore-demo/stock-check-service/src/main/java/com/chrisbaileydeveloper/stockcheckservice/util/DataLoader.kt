package com.chrisbaileydeveloper.stockcheckservice.util

import com.chrisbaileydeveloper.stockcheckservice.model.StockCheck
import com.chrisbaileydeveloper.stockcheckservice.repository.StockCheckRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class DataLoader(private val stockCheckRepository: StockCheckRepository) : CommandLineRunner {
    override fun run(vararg args: String?) {
        // Clear existing data to avoid duplicates on restart
        if (stockCheckRepository.count() == 0L) {
            val books = listOf(
                // Famous books matching book-service DataLoader
                StockCheck(skuCode = "To Kill a Mockingbird", quantity = 50),
                StockCheck(skuCode = "1984", quantity = 75),
                StockCheck(skuCode = "Pride and Prejudice", quantity = 60),
                StockCheck(skuCode = "The Great Gatsby", quantity = 80),
                StockCheck(skuCode = "One Hundred Years of Solitude", quantity = 40),
                
                // Test book with zero stock
                StockCheck(skuCode = "out_of_stock_test", quantity = 0)
            )
            
            stockCheckRepository.saveAll(books)
        }
    }
}