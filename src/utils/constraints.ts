import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments
} from "class-validator";
import { BigNumber } from "ethers";

@ValidatorConstraint({ name: "isUnsignedBigNumberString", async: false })
export class IsUnsignedBigNumberString implements ValidatorConstraintInterface {
    validate(text: string) {
        try {
            const bn = BigNumber.from(text);
            return bn.gte(0);
        } catch (e) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must be a positive integer string value`;
    }
}
