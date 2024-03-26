import { createApp } from "./utils";
const app = createApp();


app.get("/user", (c) => c.json(`get user`));
app.put("/user", (c) => c.json(`put user`));

export default app;
