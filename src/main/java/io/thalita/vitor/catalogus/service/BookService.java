package io.thalita.vitor.catalogus.service;

import io.thalita.vitor.catalogus.dto.BookRequestDTO;
import io.thalita.vitor.catalogus.model.Book;
import io.thalita.vitor.catalogus.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> findAllBooks(){
        return bookRepository.findAll();
    }


    public Book createBook(BookRequestDTO dto) {

        Book bookExist = bookRepository.findByTitle(dto.getTitle());

        if (bookExist != null) {
            throw new RuntimeException("O Livro já cadastrado");
        }

        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setIsbn(dto.getIsbn());
        book.setDescription(dto.getDescription());
        return bookRepository.save(book);
    }

    public void deleteBook(String title){
        Book book = bookRepository.findByTitle(title);
        if(book == null){
            throw new RuntimeException("Livro não encontrado");
        }
        bookRepository.delete(book);
    }


    public Book findBookByTitle(String title){
        Book book = bookRepository.findByTitle(title);
        if(book == null){
            throw new RuntimeException("Livro não encontrado");
        }
        return book;
    }

    public Book replaceBook(BookRequestDTO dto){
        Book book = bookRepository.findByTitle(dto.getTitle());
        if(book == null){
            throw new RuntimeException("Livro não encontrado");
        }
        book.setAuthor(dto.getAuthor());
        book.setTitle(dto.getTitle());
        book.setIsbn(dto.getIsbn());
        book.setDescription(dto.getDescription());

        bookRepository.saveAndFlush(book);

        return book;
    }
}
