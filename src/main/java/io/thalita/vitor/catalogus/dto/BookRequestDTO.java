package io.thalita.vitor.catalogus.dto;

public class BookRequestDTO {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String description;

    public Long getId(){
        return id;
    }
    public String getAuthor() {
        return author;
    }
    public String getTitle() {
        return title;
    }
    public String getIsbn() {
        return isbn;
    }
    public String getDescription() {
        return description;
    }

    public void setAuthor(String author) {
        this.author = author;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }
    public void setDescription(String description) {
        this.description = description;
    }
}
