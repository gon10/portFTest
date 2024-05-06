import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { useMutation, useQuery } from "@apollo/client";
import { graphql } from "../../gql";
import { useRouter } from "next/router";
import { useState } from "react";

const GET_TASK = graphql(`
  query GetTask($id: Int!) {
    getTask(id: $id) {
      id
      title
      description
      subTasks {
        id
        title
        description
        status
      }
    }
  }
`);

const CREATE_SUBTASK = graphql(`
  mutation CreateSubTask($taskId: Int!, $title: String!, $description: String) {
    createSubTask(taskId: $taskId, title: $title, description: $description) {
      id
    }
  }
`);

export default function Task() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(false);
  const { query } = useRouter();
  const taskId =
    typeof query["taskId"] === "string" ? query["taskId"] : undefined;

  const { data, refetch: refetchTask } = useQuery(GET_TASK, {
    variables: taskId ? { id: Number(taskId) } : undefined,
  });
  const [createSubtask, { loading, error }] = useMutation(CREATE_SUBTASK, {
    variables: {
      taskId: Number(taskId),
      title: title,
      description: description,
    },
    onCompleted: (data) => {
      setDescription("");
      setTitle("");
      setEditing(false);
      refetchTask();
    },
  });

  if (!data) {
    return null;
  }

  function handleAddSubTasks() {}
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.trim() === "") {
      return; // Prevent empty title submission
    }
    createSubtask();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Task {data.getTask.id}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h2 className={styles.title}>{data.getTask.title}</h2>
        <p className={styles.description}>{data.getTask.description}</p>

        {data.getTask.subTasks?.length > 0 && (
          <>
            <h2>Sub tasks</h2>
            {!editing && (
              <button
                className={styles.primary}
                onClick={() => setEditing(true)}
              >
                Add SubTask
              </button>
            )}
            <div className={styles.grid}>
              {data.getTask.subTasks?.map((subTask) => (
                <div key={subTask.id} className={styles.card}>
                  <h2 className={styles.title}>{subTask.title}</h2>
                  <p className={styles.description}>{subTask.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {editing && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              id="title"
              placeholder="Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              id="description"
              value={description}
              placeholder="Description (Optional)..."
              onChange={(e) => setDescription(e.target.value)}
              // rows={5}
            />
            <div>
              <button
                className={styles.warning}
                onClick={(e) => setEditing(false)}
              >
                Cancel
              </button>
              <button
                className={styles.primary}
                onClick={(e) => handleAddSubTasks()}
              >
                Save
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
