export class HealthService {
    static checkHealth() {
        return {
            status: "ok",
            message: "Health check is successful",
            success: true
        };
    }
}