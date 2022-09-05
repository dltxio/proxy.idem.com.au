import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("health")
export class HealthController {
    @Get("")
    @ApiOperation({ summary: "Get the health endpoint" })
    @ApiResponse({
        status: HttpStatus.OK
    })
    async get() {
        return {
            status: "ok"
        };
    }
}
