import { Todo } from "../domain/Todo";
import { ITodoRepository } from "../core/ITodoRepository";

export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];

  async create(
    todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">
  ): Promise<Todo> {
    const id = `todo-${Math.floor(Math.random() * 1000000)}`;
    const now = new Date();

    const todo: Todo = {
      ...todoData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.todos.push(todo);
    return todo;
  }

  async update(
    id: string,
    updates: Partial<Omit<Todo, "id" | "userId" | "createdAt">>
  ): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id);

    if (index === -1) {
      return null;
    }

    this.todos[index] = {
      ...this.todos[index],
      ...updates,
      updatedAt: new Date(Date.now() + 1), // Ensure updatedAt is always newer
    };

    return this.todos[index];
  }

  async findById(id: string): Promise<Todo | null> {
    const todo = this.todos.find((t) => t.id === id);
    return todo || null;
  }

  async findByUserId(userId: string, limit?: number, offset?: number): Promise<Todo[]> {
    let todos = this.todos.filter((t) => t.userId === userId && !t.deletedAt);
    if (offset) {
      todos = todos.slice(offset);
    }
    if (limit) {
      todos = todos.slice(0, limit);
    }
    return todos;
  }

  async findDueReminders(currentTime: Date): Promise<Todo[]> {
    return this.todos.filter((t) => t.status === "PENDING" && t.remindAt && t.remindAt <= currentTime);
  }

  async softDelete(id: string): Promise<boolean> {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      return false;
    }
    this.todos[index] = {
      ...this.todos[index],
      deletedAt: new Date(),
      updatedAt: new Date(),
    };
    return true;
  }

  async findAllTodos(): Promise<Todo[]> {
    return [...this.todos]; // Return a copy to prevent external mutation
  }
}
