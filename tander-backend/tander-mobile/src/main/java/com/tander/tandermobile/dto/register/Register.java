package com.tander.tandermobile.dto.register;
import com.tander.tandermobile.domain.profle.Profile;
import com.tander.tandermobile.domain.user.User;
import lombok.Data;

/**
 * Represents the register entity.
 */
@Data
public class Register extends User {
    private User user;
    private Profile profile;
}
