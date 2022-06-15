import { Injectable, Inject } from "@nestjs/common";
import { User } from "../data/entities/user.entity";
import { Repository } from "typeorm";
import { UserVerifyRequestBody } from "../interfaces";

@Injectable()
export class UserService {
    constructor(
        @Inject("USER_REPOSITORY")
        private userRepository: Repository<User>
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async create(newUser: UserVerifyRequestBody): Promise<User> {
        return this.userRepository.save(newUser);
    }
}
