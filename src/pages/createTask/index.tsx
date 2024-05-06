import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { useMutation } from "@apollo/client";
import { graphql } from "../../gql";
import { useState } from "react";
import { useRouter } from "next/router";

const CREATE_TASK = graphql(`
  mutation CreateTask($title: String!, $description: String) {
    createTask(title: $title, description: $description) {
      title
      description
    }
  }
`);

export default function Task() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const [createTask, { loading, error }] = useMutation(CREATE_TASK, {
    variables: { title: title, description: description },
    onCompleted: (data) => {
      setTitle("");
      setDescription("");
      router.push("/");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.trim() === "") {
      return; // Prevent empty title submission
    }
    createTask({ variables: { title, description } });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create a new Task</title>
      </Head>

      <main>
        <h1 className={styles.title}>Create a new Task</h1>
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
          />
          <div>
            <button className={styles.primary}>Save</button>
          </div>
        </form>
      </main>
    </div>
  );
}
