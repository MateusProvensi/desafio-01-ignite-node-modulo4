import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Create a user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest1@test.com",
      password: "123",
    });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a user with a existent email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest2@test.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest2@test.com",
      password: "123",
    });

    expect(response.status).toBe(400);
  });
});
