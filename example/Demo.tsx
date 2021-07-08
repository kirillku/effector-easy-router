import {
  combine,
  createEffect,
  createEvent,
  createStore,
  forward,
  guard,
  restore,
  sample,
} from "effector";
import { useList, useStore } from "effector-react";
import * as React from "react";
import { $search, createRoute, CurrentRoute, Link, Switch } from "../src";

const HomeRoute = createRoute("/");
const AboutRoute = createRoute("/about");
const UsersRoute = createRoute("/users");
const UserRoute = createRoute<"userSlug">(`${UsersRoute.path}/:userSlug`);

UsersRoute.match.watch((a) => console.log("Users", a));
UserRoute.match.watch((a) => console.log("User", a));

type User = {
  id: string;
  slug: string;
  name: string;
  age: number;
};

const USERS: User[] = [
  { id: "1", slug: "boris", name: "Boris", age: 5 },
  { id: "2", slug: "john", name: "John", age: 3 },
];

const wait = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

const loadUsersFx = createEffect(() => wait().then(() => USERS));
const $users = restore(loadUsersFx.doneData, []);
const $status = createStore("idle")
  .on(loadUsersFx, () => "loading")
  .on(loadUsersFx.done, () => "success")
  .on(loadUsersFx.fail, () => "error");

guard({
  clock: UsersRoute.status,
  source: $status,
  filter: (status) => status === "idle",
  target: loadUsersFx,
});

const getRandomUserSlug = (users: User[]): string =>
  users[Math.floor(Math.random() * users.length)].slug;

const navigateToRandomUser = createEvent();

guard({
  source: UserRoute.match,
  filter: (match) => match?.params?.userSlug === "random",
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
  const handleChange: React.InputHTMLAttributes<
    HTMLInputElement
  >["onChange"] = (event) => {
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
    <main className="App">
      <h1>Effector Easy Router Demo</h1>
      <nav className="Nav">
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
