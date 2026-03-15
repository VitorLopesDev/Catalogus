package io.thalita.vitor.catalogus.dto;

import io.thalita.vitor.catalogus.model.ReadingStatus;

public class BookRequestDTO {
    private Long id;
    private String ownerEmail;
    private ReadingStatus status;
    private String title;
    private String author;
    private String isbn;
    private String description;
    private Double rating;

    public Long getId(){
        return id;
    }
    public String getOwnerEmail() {
        return ownerEmail;
    }
    public ReadingStatus getStatus() {
        return status;
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
    public Double getRating(){
        return rating;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }
    public void setAuthor(String author) {
        this.author = author;
    }
    public void setStatus(ReadingStatus status) {
        this.status = status;
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
    public void setRating(Double rating){
        this.rating = rating;
    }
}
