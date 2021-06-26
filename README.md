# `effector-easy-router`

A router for [`effector`](https://effector.dev/) inspired by [`react-router-dom`](https://reactrouter.com/web) and [effector gates](https://effector.dev/docs/api/effector-react/gate). Routes are independent from each other and not rely on React tree. Url manipulations are fully abstracted out, you only need to set path when creating a route.

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
  const user = useStore($currentUser);

  if (!user) {
    return null;
  }

  const { name, avatar, email } = user;

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

TODO:

- [ ] Add `NavLink`
- [ ] Add `Prompt`
