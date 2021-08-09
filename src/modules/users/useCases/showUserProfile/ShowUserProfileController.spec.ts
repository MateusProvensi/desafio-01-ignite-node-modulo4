import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Show the user profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show the user profile", async () => {
    await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest1@test.com",
      password: "123",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "supertest1@test.com",
      password: "123",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able to show the profile of a user that does not exists", async () => {
    const token = "InvalidToken"

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);
  });
});
