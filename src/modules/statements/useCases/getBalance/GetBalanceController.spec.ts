import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;
describe("Get the balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show the balance user", async () =>{
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

    const responseStatements = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(responseStatements.status).toBe(200);
    expect(responseStatements.body).toHaveProperty("statement");
  })

  it("Should not be able to show the balance of a user does not exists", async () =>{
    const token = "InvalidToken"

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(401);
  })
});
