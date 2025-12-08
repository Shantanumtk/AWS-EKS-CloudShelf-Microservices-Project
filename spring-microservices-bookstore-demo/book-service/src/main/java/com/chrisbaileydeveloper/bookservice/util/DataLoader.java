package com.chrisbaileydeveloper.bookservice.util;

import com.chrisbaileydeveloper.bookservice.model.Book;
import com.chrisbaileydeveloper.bookservice.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final BookRepository bookRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if the repository is empty and load initial data if needed
        if (bookRepository.count() < 1) {
            Book book1 = new Book();
            book1.setName("To Kill a Mockingbird");
            book1.setDescription("A classic novel about racial injustice in the American South, seen through the eyes of young Scout Finch. Harper Lee's Pulitzer Prize-winning masterpiece explores themes of morality, innocence, and the loss of childhood.");
            book1.setPrice(14.99);

            Book book2 = new Book();
            book2.setName("1984");
            book2.setDescription("George Orwell's dystopian masterpiece about a totalitarian regime that controls every aspect of life. A chilling exploration of surveillance, propaganda, and the manipulation of truth.");
            book2.setPrice(13.99);

            Book book3 = new Book();
            book3.setName("Pride and Prejudice");
            book3.setDescription("Jane Austen's beloved romantic novel following Elizabeth Bennet as she navigates issues of manners, morality, and marriage in early 19th-century England.");
            book3.setPrice(12.99);

            Book book4 = new Book();
            book4.setName("The Great Gatsby");
            book4.setDescription("F. Scott Fitzgerald's iconic portrayal of the Jazz Age, following the mysterious millionaire Jay Gatsby and his obsessive pursuit of the American Dream.");
            book4.setPrice(11.99);

            Book book5 = new Book();
            book5.setName("One Hundred Years of Solitude");
            book5.setDescription("Gabriel García Márquez's magical realist epic chronicling seven generations of the Buendía family in the fictional town of Macondo. A landmark of world literature.");
            book5.setPrice(16.99);

            bookRepository.save(book1);
            bookRepository.save(book2);
            bookRepository.save(book3);
            bookRepository.save(book4);
            bookRepository.save(book5);
        }
    }
}