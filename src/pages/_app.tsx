import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import "../styles/globals.css";
import styles from "../styles/Home.module.css";

const client = new ApolloClient({
  uri: "http://localhost:3000/api/graphql",
  cache: new InMemoryCache(),
});

function TaskManagerApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <div className={styles.nav}>
        <a href={`/`}>Task manager</a>
      </div>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default TaskManagerApp;
