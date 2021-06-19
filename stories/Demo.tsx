import { createEffect, forward, restore } from "effector";
import { useList, useStore } from "effector-react";
import * as React from "react";
import { createRoute, Link } from "../src";

const HomeRoute = createRoute("/", { exact: true });
const AboutRoute = createRoute("/about");
const UsersRoute = createRoute("/users");

const USERS = [
  { id: "1", slug: "boris", name: "Boris" },
  { id: "2", slug: "john", name: "John" },
];

const wait = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

const loadUsersFx = createEffect(() => wait().then(() => USERS));
const $users = restore(loadUsersFx.doneData, []);

forward({ from: UsersRoute.open, to: loadUsersFx });

const styles = {
  main: {
    fontFamily: "Helvetica",
    background: "wheat",
    minHeight: "50vh",
  },
  nav: {
    display: "flex",
    gap: 10,
  },
};

const Users: React.FC = () => {
  const userList = useList($users, (user) => <li>{user.name}</li>);
  const isLoading = useStore(loadUsersFx.pending);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h2>List of users</h2>
      <ul>{userList}</ul>
    </>
  );
};

const Demo: React.FC = () => {
  return (
    <main style={styles.main}>
      <h1>Effector Easy Router Demo</h1>
      <nav style={styles.nav}>
        <Link to={HomeRoute}>Home</Link>
        <Link to={AboutRoute}>About</Link>
        <Link to={UsersRoute}>Users</Link>
      </nav>
      <hr />
      <section>
        <HomeRoute>
          <h2>Welcome to demo</h2>
        </HomeRoute>
        <AboutRoute>
          <h2>Something here</h2>
        </AboutRoute>
        <UsersRoute>
          <Users />
        </UsersRoute>
      </section>
    </main>
  );
};

export default Demo;
