export interface RouteHandler {
  (req: any, res: any): any;
}

export interface IHttpServer {
  listen(port: number): Promise<void>;
  registerRoute(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    handler: RouteHandler
  ): void;
  close(): Promise<void>;
}
