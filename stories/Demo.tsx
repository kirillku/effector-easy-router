import { combine, createEffect, forward, restore } from "effector";
import { useList, useStore } from "effector-react";
import * as React from "react";
import { createRoute, Link } from "../src";

const HomeRoute = createRoute("/");
const AboutRoute = createRoute("/about");
const UsersRoute = createRoute("/users");
const UserRoute = createRoute<"userSlug">(`${UsersRoute.path}/:userSlug`);

UsersRoute.match.watch((a) => console.log("Users", a));
UserRoute.match.watch((a) => console.log("User", a));

const USERS = [
  { id: "1", slug: "boris", name: "Boris" },
  { id: "2", slug: "john", name: "John" },
];

const wait = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

const loadUsersFx = createEffect(() => wait().then(() => USERS));
const $users = restore(loadUsersFx.doneData, []);

forward({ from: UsersRoute.open, to: loadUsersFx });

const $selectedUser = combine(
  $users,
  UserRoute.match,
  (users, match) =>
    (match && users.find((user) => user.slug === match.params.userSlug)) || null
);

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

const UserProfile: React.FC = () => {
  const user = useStore($selectedUser);
  return (
    user && (
      <img
        src={`https://loremflickr.com/320/240?lock=${user.id}`}
        alt={user.name}
      />
    )
  );
};

const Users: React.FC = () => {
  const userList = useList($users, (user) => (
    <li>
      <Link to={UserRoute} params={{ userSlug: user.slug }}>
        {user.name}
      </Link>
    </li>
  ));
  const isLoading = useStore(loadUsersFx.pending);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h2>List of users</h2>
      <ul>{userList}</ul>
      <UserRoute>
        <UserProfile />
      </UserRoute>
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
        <HomeRoute exact>
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
