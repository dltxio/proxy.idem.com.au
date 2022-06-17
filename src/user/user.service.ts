import { Injectable, Inject } from "@nestjs/common";
import { User } from "../data/entities/user.entity";
import { Repository } from "typeorm";
import {
    UserExpoPushTokenRequestBody,
    UserVerifyRequestBody
} from "../interfaces";

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
        const user = await this.userRepository.findOneBy({
            email: newUser.email
        });
        if (!user) {
            return this.userRepository.save(newUser);
        }
        return user;
    }

    async putToken(
        userId: string,
        token: UserExpoPushTokenRequestBody
    ): Promise<User> {
        const user = await this.userRepository.findOneBy({ userId: userId });
        if (!user) {
            throw new Error("User not found");
        }
        user.expoPushToken = token.token;
        return this.userRepository.save(user);
    }
}
