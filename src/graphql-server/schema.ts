import {
  intArg,
  makeSchema,
  objectType,
  asNexusMethod,
  nonNull,
  stringArg,
  list,
  inputObjectType,
} from "nexus";
import { DateTimeResolver } from "graphql-scalars";
import { Context } from "./context";
import path from "path";
import { Task, SubTask } from "nexus-prisma";

export const DateTime = asNexusMethod(DateTimeResolver, "date");

export const schema = makeSchema({
  types: [
    DateTime,
    objectType({
      name: "Query",
      definition(t) {
        t.field("getTask", {
          type: "Task",
          args: {
            id: nonNull(intArg()),
          },
          resolve: (_parent, args, ctx: Context) => {
            return ctx.prisma.task.findUnique({
              where: { id: args.id },
              include: { subTasks: true },
            });
          },
        });
        t.field("getAllTasks", {
          type: list(nonNull("Task")),
          resolve: (_parent, args, ctx: Context) => {
            return ctx.prisma.task.findMany({ include: { subTasks: true } });
          },
        });
      },
    }),
    objectType({
      name: "Mutation",
      definition(t) {
        t.nonNull.field("createTask", {
          type: "Task",
          args: {
            title: nonNull(stringArg()),
            description: stringArg(),
            subTasks: list("subTaskInput"),
          },
          resolve: async (_parent, args, ctx: Context) => {
            const createdTask = ctx.prisma.task.create({
              data: {
                title: args.title,
                description: args.description || null,
                status: "TO_DO",
                createdAt: new Date(),
              },
            });
            if (args.subTasks && args.subTasks.length > 0) {
              const subTaskData = args.subTasks.map((subTask) => ({
                taskId: createdTask,
                title: subTask.title,
              }));
              await ctx.prisma.subTask.create({
                data: {
                  taskId: (await createdTask).id,
                  title: subTaskData[0].title,
                  description: "desc",
                  status: "TO_DO",
                },
              });
            }
            return createdTask;
          },
        });
        t.nonNull.field("deleteTask", {
          type: "Task",
          args: {
            id: nonNull(intArg()),
          },
          resolve: async (_parent, args, ctx: Context) => {
            const taskToDelete = await ctx.prisma.task.findUnique({
              where: { id: args.id },
              select: { id: true, subTasks: { select: { id: true } } }, // Fetch subTask IDs
            });

            if (!taskToDelete) {
              throw new Error("Task with ID " + args.id + " not found.");
            }

            if (taskToDelete.subTasks.length > 0) {
              await ctx.prisma.subTask.deleteMany({
                where: {
                  id: {
                    in: taskToDelete.subTasks.map((subTask) => subTask.id),
                  },
                },
              });
            }

            return ctx.prisma.task.delete({
              where: { id: args.id },
            });
          },
        });
        t.nonNull.field("createSubTask", {
          type: "SubTask",
          args: {
            taskId: nonNull(intArg()),
            title: nonNull(stringArg()),
            description: stringArg(),
          },
          resolve: async (_parent, args, ctx: Context) => {
            const parentTask = await ctx.prisma.task.findUnique({
              where: { id: args.taskId },
            });

            if (!parentTask) {
              throw new Error("Task with ID " + args.taskId + " not found.");
            }

            return await ctx.prisma.subTask.create({
              data: {
                taskId: parentTask.id,
                title: args.title,
                description: args.description,
                status: "TO_DO",
              },
            });
          },
        });
      },
    }),
    objectType({
      name: Task.$name,
      description: Task.$description,
      definition(t) {
        t.nonNull.field(Task.id);
        t.nonNull.field(Task.title);
        t.field(Task.description);
        t.nonNull.field(Task.status);
        t.nonNull.field(Task.createdAt);
        t.list.field("subTasks", {
          type: "SubTask",
          resolve(root, args, ctx) {
            return ctx.prisma.subTask.findMany({
              where: {
                taskId: root.id,
              },
            });
          },
        });
      },
    }),
    objectType({
      name: SubTask.$name,
      description: SubTask.$description,
      definition(t) {
        t.nonNull.field(SubTask.id);
        t.nonNull.field(SubTask.title);
        t.field(SubTask.description);
        t.nonNull.field(SubTask.status);
        t.nonNull.field(SubTask.createdAt);
        t.nonNull.field(SubTask.taskId);
      },
    }),
    inputObjectType({
      name: "subTaskInput",
      definition(t) {
        t.int("id");
        t.nonNull.string("title");
        t.string("description");
        t.string("status");
      },
    }),
  ],
  outputs: {
    schema: path.join(process.cwd(), "src", "graphql-server", "schema.graphql"),
    typegen: path.join(process.cwd(), "src", "graphql-server", "types.ts"),
  },
  contextType: {
    module: path.join(process.cwd(), "src", "graphql-server", "context.ts"),
    export: "Context",
  },
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "prisma",
      },
    ],
  },
});
