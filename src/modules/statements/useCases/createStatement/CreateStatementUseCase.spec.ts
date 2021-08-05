import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Create a statement to a user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to create a deposit to a user and show updated balance", async () => {
    const user = {
      name: "Test",
      email: "test@test.com",
      password: "123",
    };

    const userCreated = await createUserUseCase.execute({
      email: user.email,
      password: user.password,
      name: user.name,
    });

    const statement = {
      user_id: userCreated.id,
      type: "deposit",
      amount: 50,
      description: "depositTest",
    };

    const statementCreated = await createStatementUseCase.execute({
      user_id: statement.user_id!,
      type: OperationType.DEPOSIT,
      amount: statement.amount,
      description: statement.description,
    });

    expect(statementCreated).toHaveProperty("id");

    const currentBalance = await getBalanceUseCase.execute({
      user_id: userCreated.id!,
    });

    expect(currentBalance).toHaveProperty("balance", 50);
  });

  it("Should be able to create a deposit and a withdraw to a user and show updated balance", async () => {
    const user = {
      name: "Test",
      email: "test@test.com",
      password: "123",
    };

    const userCreated = await createUserUseCase.execute({
      email: user.email,
      password: user.password,
      name: user.name,
    });

    const statementDeposit = {
      user_id: userCreated.id,
      type: OperationType.DEPOSIT,
      amount: 50,
      description: "depositTest",
    };

    const statementDepositCreated = await createStatementUseCase.execute({
      user_id: statementDeposit.user_id!,
      type: statementDeposit.type,
      amount: statementDeposit.amount,
      description: statementDeposit.description,
    });

    expect(statementDepositCreated).toHaveProperty("id");

    const statementWithdraw = {
      user_id: userCreated.id,
      type: OperationType.WITHDRAW,
      amount: 10,
      description: "withdrawTest",
    };

    const statementWithdrawCreated = await createStatementUseCase.execute({
      user_id: statementWithdraw.user_id!,
      type: statementWithdraw.type,
      amount: statementWithdraw.amount,
      description: statementWithdraw.description,
    });

    expect(statementWithdrawCreated).toHaveProperty("id");

    const currentBalance = await getBalanceUseCase.execute({
      user_id: userCreated.id!,
    });

    expect(currentBalance).toHaveProperty("balance", 40);
  });

  it("Should not be able to create a withdraw to a user with a insufficient balance", async () => {
    const user = {
      name: "Test",
      email: "test@test.com",
      password: "123",
    };

    const userCreated = await createUserUseCase.execute({
      email: user.email,
      password: user.password,
      name: user.name,
    });

    const statementDeposit = {
      user_id: userCreated.id,
      type: OperationType.DEPOSIT,
      amount: 10,
      description: "depositTest",
    };

    const dep = await createStatementUseCase.execute({
      user_id: statementDeposit.user_id!,
      type: statementDeposit.type,
      amount: statementDeposit.amount,
      description: statementDeposit.description,
    });

    const statementWithdraw = {
      user_id: userCreated.id,
      type: OperationType.WITHDRAW,
      amount: 90,
      description: "withdrawTest",
    };

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: statementWithdraw.user_id!,
        type: statementWithdraw.type,
        amount: statementWithdraw.amount,
        description: statementWithdraw.description,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("Should not be able to create a deposit to a user does not exists", () => {
    expect(async () => {
      const statement = {
        user_id: "incorrectId",
        type: OperationType.DEPOSIT,
        amount: 50,
        description: "depositTest",
      };

      await createStatementUseCase.execute({
        user_id: statement.user_id!,
        type: statement.type,
        amount: statement.amount,
        description: statement.description,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
