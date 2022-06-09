import { IEvent, IExampleService } from "./interfaces";

export class MockExampleService implements IExampleService {
    public getById(id: string): string {
        return "mock" + id;
    }

    public getAll(): string[] {
        return ["mock1", "mock2", "mock3"];
    }
}

export function findMockCall(
    mockCalls: [streamName: string, event: IEvent],
    streamName: string,
    orderId: string,
    type: string
) {
    return (
        mockCalls.find(call => {
            return (
                call[0] === streamName &&
                call[1].data?.id === orderId &&
                call[1].type === type
            );
        }) || null
    );
}
