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
                // All books from book-service DataLoader
                StockCheck(skuCode = "Design Patterns: Elements of Reusable Object-Oriented Software", quantity = 100),
                StockCheck(skuCode = "The Pragmatic Programmer: Your Journey to Mastery", quantity = 100),
                StockCheck(skuCode = "Clean Code: A Handbook of Agile Software Craftsmanship", quantity = 100),
                StockCheck(skuCode = "Refactoring: Improving the Design of Existing Code", quantity = 100),
                StockCheck(skuCode = "Code Complete: A Practical Handbook of Software Construction", quantity = 100),
                
                // Keep legacy SKU codes for backward compatibility
                StockCheck(skuCode = "design_patterns_gof", quantity = 100),
                StockCheck(skuCode = "pragmatic_programmer", quantity = 100),
                StockCheck(skuCode = "clean_code", quantity = 100),
                StockCheck(skuCode = "refactoring", quantity = 100),
                StockCheck(skuCode = "code_complete", quantity = 100),
                
                // Test book with zero stock
                StockCheck(skuCode = "mythical_man_month", quantity = 0),
                StockCheck(skuCode = "The Mythical Man-Month", quantity = 0)
            )
            
            stockCheckRepository.saveAll(books)
        }
    }
}
