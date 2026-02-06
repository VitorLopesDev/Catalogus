package io.thalita.vitor.catalogus.controller;

import io.thalita.vitor.catalogus.model.Book;
import io.thalita.vitor.catalogus.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/book")
public class BookController {

    @Autowired
    private BookRepository bookRepository;


    @PostMapping("/addbook")
    public ResponseEntity addBook(@RequestBody Book book){
        var findBook = this.bookRepository.findByTitle(book.getTitle());
        if(findBook != null){
           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Livro já cadastrado!");
        }
        var bookSave = this.bookRepository.save(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(bookSave);
    }
}
