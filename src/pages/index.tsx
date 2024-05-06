import Head from "next/head";
import styles from "../styles/Home.module.css";
import { graphql } from "../gql";
import { useMutation, useQuery } from "@apollo/client";
import SubTaskCard from "../components/SubTaskCard";

const GET_ALL_TASKS = graphql(`
  query GetAllTasks {
    getAllTasks {
      id
      title
      description
      status
      createdAt
      subTasks {
        title
        description
        status
      }
    }
  }
`);

const DELETE_TASK = graphql(`
  mutation DeleteTask($deleteTaskId: Int!) {
    deleteTask(id: $deleteTaskId) {
      id
    }
  }
`);

export default function Home() {
  const { data, refetch: refetchAllTasks } = useQuery(GET_ALL_TASKS);

  const [deleteTask, { loading, error }] = useMutation(DELETE_TASK, {
    onCompleted: (data) => {
      refetchAllTasks();
    },
  });

  async function handleDelete(id: number) {
    await deleteTask({ variables: { deleteTaskId: id } });
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>Task Manager App</title>
        <meta name="description" content="Manage your tasks!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>Welcome to the Task Manager</h1>
        <a href={`/createTask`} className={styles.primary}>
          Create new Task
        </a>
        <div className={styles.grid}>
          {data?.getAllTasks?.map((task) => (
            <div key={task.id} className={styles.card}>
              <h2 className={styles.title}>{task.title}</h2>
              <p className={styles.description}>{task.description}</p>
              <p>Status: {task.status}</p>
              <SubTaskCard subTasks={task.subTasks}></SubTaskCard>
              <div className={styles.actions}>
                <a href={`/task/${task.id}`} className={styles.primary}>
                  View
                </a>

                <button
                  className={styles.warning}
                  onClick={(e) => handleDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
