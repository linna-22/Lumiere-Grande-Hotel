<!-- ==============Authentication============ -->

1. Provider = indentifyer oauth service such as google github it tell our api which login method have created

2.provider_id = Unqiue user supplied direct by google/oauth Prevents duplicate account creation on repeated social logins.

3. avatar =  Direct image URL of user's Google profile picture.	Allows frontend to display user avatar without manual uploads.

4.is_2fa_enabled =Boolean flag (true/false) toggling 2FA requirement.	Determines if /login must generate an OTP or issue a token directly.