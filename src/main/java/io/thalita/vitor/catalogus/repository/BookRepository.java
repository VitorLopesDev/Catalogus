package io.thalita.vitor.catalogus.repository;

import io.thalita.vitor.catalogus.model.Book;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {
    Book findByTitle(@NonNull String title);
    void deleteByTitle(String title);
}