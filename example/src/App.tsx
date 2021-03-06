import * as React from "react";
import {
  combine,
  createEffect,
  createEvent,
  createStore,
  guard,
  restore,
  sample,
} from "effector";
import { useList, useStore } from "effector-react";
import {
  createRoute,
  Link,
  Switch,
  $search,
  CurrentRoute,
} from "effector-easy-router";
import { fetchUsers, User } from "./api";

const HomeRoute = createRoute("/");
const AboutRoute = createRoute("/about");
const UsersRoute = createRoute("/users");
const UserRoute = createRoute<"userSlug">(`${UsersRoute.path}/:userSlug`);

UsersRoute.match.watch((a) => console.log("match", a));
UsersRoute.open.watch((a) => console.log("open", a));
UsersRoute.close.watch((a) => console.log("close", a));

const loadUsersFx = createEffect(fetchUsers);
const $users = restore(loadUsersFx.doneData, []);
const $status = createStore("idle")
  .on(loadUsersFx, () => "loading")
  .on(loadUsersFx.done, () => "success")
  .on(loadUsersFx.fail, () => "error");

guard({
  source: UsersRoute.open,
  filter: $status.map((status) => status === "idle"),
  target: loadUsersFx,
});

const getRandomUserSlug = (users: User[]): string =>
  users[Math.floor(Math.random() * users.length)].slug;

const navigateToRandomUser = createEvent();

guard({
  source: UserRoute.open,
  filter: (match) => match.params.userSlug === "random",
  target: navigateToRandomUser,
});

sample({
  clock: navigateToRandomUser,
  source: $users,
  fn: (users) => ({
    params: { userSlug: getRandomUserSlug(users) },
  }),
  target: UserRoute.navigate,
});

const $selectedUser = combine(
  $users,
  UserRoute.match,
  (users, match) =>
    (match && users.find((user) => user.slug === match.params.userSlug)) || null
);

const UserNotFoundPage: React.FC = () => {
  const userSlug = useStore(
    UserRoute.match.map((match) => match && match.params.userSlug)
  );

  return (
    <>
      <h2>404</h2>
      <p>
        User <strong>{userSlug}</strong> not found
      </p>
    </>
  );
};

const UserProfile: React.FC = () => {
  const user = useStore($selectedUser);

  if (!user) {
    return <UserNotFoundPage />;
  }

  return (
    <>
      <h1>Info</h1>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <img
        src={`https://loremflickr.com/320/240?lock=${user.id}`}
        alt={user.name}
      />
    </>
  );
};

const UsersFilters: React.FC = () => {
  const search = useStore($search);
  const searchParams = new URLSearchParams(search);

  const q = searchParams.get("q") || "";
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    searchParams.set("q", event.target.value);
    const search = searchParams.toString();
    CurrentRoute.navigate({ search });
  };

  return <input placeholder="filter users" value={q} onChange={handleChange} />;
};

const $filteredUsers = combine(
  $users,
  $search.map((search) => new URLSearchParams(search).get("q") || null),
  (users, q) =>
    q
      ? users.filter((user) =>
          user.name.toLowerCase().includes(q.toLowerCase())
        )
      : users
);

const Users: React.FC = () => {
  const userList = useList($filteredUsers, (user) => (
    <li>
      <Link to={UserRoute} params={{ userSlug: user.slug }}>
        {user.name}
      </Link>
    </li>
  ));
  const status = useStore($status);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "error") {
    return <p>Error</p>;
  }

  return (
    <>
      <Switch>
        <UsersRoute exact>
          <h2>List of users</h2>
          <p>
            <UsersFilters />
          </p>
          <ul>
            {userList}
            <li>
              <Link to={UserRoute} params={{ userSlug: "random" }}>
                Random
              </Link>
            </li>
          </ul>
        </UsersRoute>
        <UserRoute>
          <UserProfile />
        </UserRoute>
      </Switch>
    </>
  );
};

const NotFoundPage: React.FC = () => (
  <>
    <h2>404</h2>
    <p>Page not found</p>
  </>
);

const App: React.FC = () => {
  return (
    <main style={{ fontFamily: "Helvetica" }}>
      <h1>Effector Easy Router Demo</h1>
      <nav style={{ display: "flex", gap: 10 }}>
        <Link to={HomeRoute}>Home</Link>
        <Link to={AboutRoute}>About</Link>
        <Link to={UsersRoute}>Users</Link>
      </nav>
      <hr />
      <section>
        <Switch>
          <HomeRoute exact>
            <h2>Welcome to demo</h2>
          </HomeRoute>
          <AboutRoute>
            <h2>About</h2>
          </AboutRoute>
          <UsersRoute>
            <Users />
          </UsersRoute>
          <NotFoundPage />
        </Switch>
      </section>
    </main>
  );
};

export default App;
