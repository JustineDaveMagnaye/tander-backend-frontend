package com.tander.tandermobile.domain.profle;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
/**
 * Represents the user entity.
 */
@Entity
@Data
public class Profile implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false, updatable = false)
    private Long id;
    String firstName;
    String lastName;
    String middleName;
    String nickName;
    String address;
    String phone;
    String email;
    Date birthDate;
    int age;
    String country;
    String city;
    String civilStatus;
    String hobby;
}
