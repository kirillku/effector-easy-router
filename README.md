# 🐣 Easy Router for Effector with React bindings

A router for [`effector`](https://effector.dev/) inspired by [`react-router-dom`](https://reactrouter.com/web) and [`Gate`](https://effector.dev/docs/api/effector-react/gate).

```tsx
const HomeRoute = createRoute("/");
const UsersRoute = createRoute("/users");
const UserRoute = createRoute(`${UsersRoute.path}/:userId`);

const loadUsersFx = createEffect();

const $users = restore(loadUsersFx.doneData, []);

sample({ clock: UsersRoute.open, target: loadUsersFx });

const $currentUser = combine($users, UserRoute.match, (users, match) =>
  users.find((user) => user.id === match.params.userId)
);

const UsersPage = () => {
  const list = useList($users, ({ name, id }) => (
    <li>
      <Link to={UserRoute} params={{ userId: id }}>
        {name}
      </Link>
    </li>
  ));

  return (
    <>
      <h1>List of users</h1>
      {list}
    </>
  );
};

const UserPage = () => {
  const { name, avatar, email } = useStore($currentUser);

  return (
    <>
      <h1>{name}</h1>
      <img src={avatar} alt={name} />
      <a href={`mailto:${email}`}>{email}</a>
      <hr />
      <Link to={UsersRoute}>Back</Link>
    </>
  );
};

const App = () => {
  return (
    <>
      <nav>
        <Link to={HomeRoute}>Home</Link>
        <Link to={UsersRoute}>Users</Link>
      </nav>
      <Switch>
        <HomeRoute>
          <h1>Hello</h1>
        </HomeRoute>
        <UsersRoute>
          <UsersPage />
        </UsersRoute>
        <UserRoute>
          <UserPage />
        </UserRoute>
      </Switch>
    </>
  );
};
```

## Features

- Url manipulations are fully abstracted out, you only need to set path when creating a route.
- No global routes config, each route is independent from other routes.

TODO:

- [ ] Move search and hash to separate units
- [ ] Add `Switch`
- [ ] Add `NavLink`
- [ ] Add `Prompt`
