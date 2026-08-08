import { Role } from "../../../prisma/generated/prisma/enums";


export interface RegisterUserPayload{
    name: string;
    email: string;
    password: string;
    role  :    Role ;      
    phone? :    string;
    photo? :    string

    // name, email, password, profilePhoto 
}
