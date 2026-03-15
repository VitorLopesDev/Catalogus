package io.thalita.vitor.catalogus.controller;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
class RegisterRequest {
    private String nickName;
    private String email;
    private String password;
}
