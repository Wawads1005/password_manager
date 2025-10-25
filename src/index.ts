import e from "express";

const app = e();

app.use(e.json());

app.use(e.urlencoded({ extended: false }));
