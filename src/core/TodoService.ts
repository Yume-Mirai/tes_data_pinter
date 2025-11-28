import { Todo } from "../domain/Todo";
import { ITodoRepository } from "./ITodoRepository";
import { IUserRepository } from "./IUserRepository";

export interface CreateTodoData {
  userId: string;
  title: string;
  description?: string;
  remindAt?: string;
}

export class TodoService {
  constructor(
    private todoRepo: ITodoRepository,
    private userRepo: IUserRepository
  ) {}

  async createTodo(data: CreateTodoData): Promise<Todo> {
    // Validate title
    if (!data.title || data.title.trim() === "") {
      throw new Error("Title is required and cannot be empty");
    }

    // Validate user exists
    const user = await this.userRepo.findById(data.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const todo = await this.todoRepo.create({
      userId: data.userId,
      title: data.title.trim(),
      description: data.description,
      status: "PENDING",
      remindAt: data.remindAt ? new Date(data.remindAt) : undefined,
    });

    return todo;
  }

  async completeTodo(todoId: string): Promise<Todo> {
    const todo = await this.todoRepo.findById(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    if (todo.status === "DONE") {
      return todo;
    }

    const updated = await this.todoRepo.update(todoId, {
      status: "DONE",
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new Error("Todo not found");
    }

    return updated;
  }

  async getTodosByUser(userId: string, limit?: number, offset?: number): Promise<Todo[]> {
    return this.todoRepo.findByUserId(userId, limit, offset);
  }

  async processReminders(): Promise<void> {
    const now = new Date();
    console.log(`[${now.toISOString()}] Starting reminder processing...`);

    const dueTodos = await this.todoRepo.findDueReminders(now);
    console.log(`[${now.toISOString()}] Found ${dueTodos.length} due reminders`);

    let processedCount = 0;
    for (const todo of dueTodos) {
      if (todo.status === "PENDING") {
        await this.todoRepo.update(todo.id, {
          status: "REMINDER_DUE",
          updatedAt: new Date(),
        });
        processedCount++;
      }
    }

    console.log(`[${new Date().toISOString()}] Processed ${processedCount} reminders`);
  }

  async getTodoById(todoId: string): Promise<Todo | null> {
    return this.todoRepo.findById(todoId);
  }

  async updateTodo(todoId: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'remindAt'>>): Promise<Todo | null> {
    return this.todoRepo.update(todoId, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteTodo(todoId: string): Promise<boolean> {
    return this.todoRepo.softDelete(todoId);
  }

  async shareTodo(todoId: string, targetUserId: string): Promise<Todo | null> {
    // Find the original todo
    const originalTodo = await this.todoRepo.findById(todoId);
    if (!originalTodo) {
      return null;
    }

    // Check if trying to share with self
    if (originalTodo.userId === targetUserId) {
      throw new Error('Cannot share with yourself');
    }

    // Create a copy for the target user
    const sharedTodo = await this.todoRepo.create({
      userId: targetUserId,
      title: originalTodo.title,
      description: originalTodo.description,
      status: "PENDING",
      remindAt: originalTodo.remindAt,
    });

    return sharedTodo;
  }

  async getAllTodos(limit?: number, offset?: number): Promise<Todo[]> {
    // For in-memory implementation, we'll get all todos and apply pagination
    // In a real database, this would be done at the query level
    const allTodos = await this.todoRepo.findAllTodos();
    let todos = allTodos.filter((todo: Todo) => !todo.deletedAt); // Exclude soft deleted

    if (offset) {
      todos = todos.slice(offset);
    }
    if (limit) {
      todos = todos.slice(0, limit);
    }

    return todos;
  }
}
