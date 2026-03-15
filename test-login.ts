import { loginAction } from "./src/app/actions";

async function test() {
    try {
        console.log("Testing login...");
        const result = await loginAction("admin@timey.com", "password123");
        console.log("Result:", result);
    } catch (e) {
        console.error("Test failed with error:", e);
    }
}

test();
