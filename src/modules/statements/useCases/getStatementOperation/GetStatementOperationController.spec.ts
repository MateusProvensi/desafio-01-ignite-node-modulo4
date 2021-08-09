import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Get the statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get the attributes of a deposit", async () => {
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

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "DepositTest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = responseStatement.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("id");
  });

  it("Should be able to get the attributes of a withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest2@test.com",
      password: "123",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "supertest2@test.com",
      password: "123",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "DepositTest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "DepositTest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = responseWithdraw.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("id");
  });
});
