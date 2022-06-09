import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IExampleService } from "../interfaces";

/* 
    This is a service that is not associated with a controller or module.
*/

@Injectable()
export class ExampleService implements IExampleService {
    private mySetting: string;
    constructor(private config: ConfigService) {
        this.mySetting = this.config.get("EXAMPLESERVICE_SETTING");
    }   

    public getAll() {
        return ["1", "2", "3"];
    }

    public getById(id: string) {
        // dummy impl
        return id;
    }

    public getMySetting() {
        return this.mySetting;
    }
}
