package io.thalita.vitor.catalogus.dto;

public class BookRequestDTo {
    private String title;
    private String author;
    private String isbn;

    public String getAuthor() {
        return author;
    }
    public String getTitle() {
        return title;
    }
    public String getIsbn() {
        return isbn;
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
}
