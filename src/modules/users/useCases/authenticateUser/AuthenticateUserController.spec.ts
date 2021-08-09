import { Connection, createConnection } from "typeorm";
import request from "supertest"
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate a User controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate a existent user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest1@test.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "supertest1@test.com",
      password: "123"
    })

    expect(response.body).toHaveProperty("token");
  })

  it("Should not be able to authenticate a user does not exists", async () =>{
    const response = await request(app).post("/api/v1/sessions"). send({
      email: "Incorrect@test.com",
      password: "Incorrect"
    })

    expect(response.status).toBe(401);
  })

  it("Should not be able to authenticate a user with the incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest2@test.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "supertest2@test.com",
      password: "1234"
    })

    expect(response.status).toBe(401);
  })

  it("Should not be able to authenticate a user with the incorrect email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest3@test.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "Incorrect@test.com",
      password: "123"
    })

    expect(response.status).toBe(401);
  })
})
