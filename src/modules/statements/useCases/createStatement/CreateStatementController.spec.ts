import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Create a statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a deposit", async () => {
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
      .post("/api/v1/statements/deposit")
      .send({
        amount: 150,
        description: "DepositTest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("Should be able to create a withdraw", async () => {
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

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "DepositTest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a withdraw with insufficient balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest3@test.com",
      password: "123",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "supertest3@test.com",
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

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 400,
        description: "DepositTest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
