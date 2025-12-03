package com.tander.tandermobile.dto.register;
import com.tander.tandermobile.domain.profle.Profile;
import com.tander.tandermobile.domain.user.User;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Represents the register entity.
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class Register extends User {
    private User user;
    private Profile profile;
}
