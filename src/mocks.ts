import { IExampleService } from "./interfaces";

export class MockExampleService implements IExampleService {
    public getById(id: string): string {
        return "mock" + id;
    }

    public getAll(): string[] {
        return ["mock1", "mock2", "mock3"];
    }
}
