# Food Recipe App — Backend Notes

This document explains the backend implementation of the Food Recipe App: the methods, conceptual topics, how they are implemented in the codebase, and concise definitions (including small topics). It maps theory to concrete files and flows present in the project.

**Project Structure**
- **Backend root**: contains the main server, routes, controllers, models, middleware, config, and public assets.
- Key files:
  - **`server.js`**: main Express app entry point. See [server.js](backend/server.js#L1)
  - **`config/connectionDb.js`**: MongoDB connection logic. See [config/connectionDb.js](backend/config/connectionDb.js#L1)
  - **`models/`**: Mongoose schemas for `user` and `recipe`. See [models/user.js](backend/models/user.js#L1), [models/recipe.js](backend/models/recipe.js#L1)
  - **`controller/`**: Business logic for recipes and users. See [controller/recipe.js](backend/controller/recipe.js#L1), [controller/user.js](backend/controller/user.js#L1)
  - **`routes/`**: Express routers mapping endpoints to controllers. See [routes/recipe.js](backend/routes/recipe.js#L1), [routes/user.js](backend/routes/user.js#L1)
  - **`middleware/auth.js`**: authentication middleware protecting routes. See [middleware/auth.js](backend/middleware/auth.js#L1)
  - **`public/images/`**: served static images uploaded for recipes. See [public/images](backend/public/images)

**High-level Concepts**
- **Express**: Minimal web framework used to define HTTP endpoints, middleware, and request/response handling. Implemented in `server.js`.
- **Mongoose**: ODM for MongoDB mapping JS objects to MongoDB documents via schemas in `models/`.
- **Controllers**: Keep request handlers (business logic) separate from route definitions. Controllers typically export async functions like `getRecipes`, `createRecipe`, `updateRecipe`, `deleteRecipe`, `registerUser`, `loginUser`.
- **Routes**: Use `express.Router()` to map HTTP verbs + paths to controller functions. Routes are mounted in `server.js`.
- **Middleware**: Reusable functions that run during request lifecycle (e.g., authentication, body parsing, static serving).
- **Environment variables**: Sensitive config like DB URI and JWT secret stored in `.env` and read with `process.env`.

**Authentication & Authorization**
- Pattern: token-based authentication using JSON Web Tokens (JWT).
- Flow:
  - User registers: password hashed (bcrypt) and stored in `users` collection.
  - User logs in: password compared, on success a JWT is created and returned.
  - Protected routes include `auth` middleware that reads the `Authorization` header, verifies the token, and attaches decoded user info to `req.user`.
- Files: `controller/user.js` (login / register), `middleware/auth.js` (token verification).

**Data Models (Mongoose schemas)**
- `User` model: fields typically include `name`, `email`, `password` (hashed), `createdAt`.
- `Recipe` model: fields typically include `title`, `ingredients`, `instructions`, `image` (filename or URL), `author` (ref to `User`), timestamps.
- How it works: Schemas define validation, types, and relationships; controllers use models to perform CRUD operations via Mongoose methods (`find`, `findById`, `create`, `findByIdAndUpdate`, `findByIdAndDelete`).

**CRUD Operations (common patterns)**
- Create: receive `POST` body, validate, call `Model.create(data)`, respond with `201 Created` and created object.
- Read (list): `GET /recipes` -> `Model.find()` -> send array with `200 OK`.
- Read (single): `GET /recipes/:id` -> `Model.findById(id)` -> `200 OK` or `404 Not Found`.
- Update: `PUT` or `PATCH /recipes/:id` -> `Model.findByIdAndUpdate(id, updates, { new: true })` -> return updated doc.
- Delete: `DELETE /recipes/:id` -> `Model.findByIdAndDelete(id)` -> `200 OK` or `204 No Content`.
- Controllers are `async` functions using `try/catch` and `await` for clarity and readable async flow.

**File Uploads & Static Files**
- Images for recipes are stored in `public/images/`.
- Server exposes the `public` folder as static (`express.static`) so images are directly accessible.
- If the code uses `multer` (common pattern), middleware parses `multipart/form-data` and saves uploaded files to `public/images/`.
- The `Recipe` model stores the image filename or URL; frontend requests that URL to display images.

**Database Connection**
- `config/connectionDb.js` contains logic to connect to MongoDB using `mongoose.connect(uri, options)` and handle success/error events.
- `server.js` imports and calls connection function before starting the server to ensure DB is available.

**Security & Best Practices Implemented**
- **Password hashing**: Use `bcrypt` to salt and hash passwords before saving.
- **JWT secrets**: Stored in `.env` not in code.
- **Protected routes**: `auth` middleware prevents unauthenticated access to create/edit/delete endpoints.
- **Input validation**: Either manual checks in controllers or packages like `express-validator` to prevent invalid data. (Look in controllers for any validation logic.)
- **Static file serving**: Use `express.static('public')` to serve images; avoid exposing sensitive folders.

**Error Handling**
- Controllers wrap logic in `try/catch`. On error, send meaningful status codes and messages (e.g., `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`).
- Consistent error responses help frontend show messages and handle failures gracefully.

**HTTP & REST Principles**
- Use of proper HTTP verbs: `GET` for reads, `POST` for create, `PUT/PATCH` for update, `DELETE` for remove.
- Use of status codes to signal result of operations.
- Endpoints return JSON payloads following common REST conventions.

**Small Topics (Don't Miss)**
- **Request parsing**: `express.json()` and `express.urlencoded()` middleware parse incoming JSON and form data into `req.body`.
- **Route params vs query params**: `req.params` for path segments (e.g., `:id`), `req.query` for filtering/pagination.
- **CORS**: If frontend runs on a different origin, `cors` middleware must be enabled to allow browser requests.
- **Token storage (client side)**: JWT usually stored in localStorage or cookies by frontend; token sent in `Authorization: Bearer <token>` header.
- **Content-type**: API expects `application/json` for JSON requests; file uploads use `multipart/form-data`.
- **Pagination & filtering**: Backend can accept query params like `?page=1&limit=10` and use `skip/limit` with Mongoose.
- **Indexes**: Create MongoDB indexes on frequent query fields (e.g., `email` unique index on `User`).

**Data Flow Example (Add Recipe)**
1. Frontend sends `POST /recipes` with JSON body (or `multipart/form-data` if image included).
2. Express route in [routes/recipe.js](backend/routes/recipe.js#L1) calls controller `createRecipe`.
3. Controller validates input, handles file if present, constructs recipe object with `author` from `req.user` (after `auth` middleware).
4. Controller calls `Recipe.create(data)` and returns the created doc with `201 Created`.
5. Frontend receives recipe, updates UI and optionally navigates to recipe details.

**Definitions**
- **Controller**: Module that contains functions handling request logic and interacting with models.
- **Middleware**: Function with signature `(req, res, next)` that runs between request arrival and response.
- **Model**: Mongoose schema & model describing data shape and DB operations.
- **JWT**: JSON Web Token, compact token representing an authenticated user.
- **Bcrypt**: Library to hash passwords securely using salt.
- **Multer**: Middleware to parse `multipart/form-data` for file uploads (if used).
- **Static files**: Files served directly by Express (images, frontend build assets).

**Where to Look in Code**
- Server bootstrap and middleware: [server.js](backend/server.js#L1)
- DB connection: [config/connectionDb.js](backend/config/connectionDb.js#L1)
- Authentication middleware: [middleware/auth.js](backend/middleware/auth.js#L1)
- User controllers & auth flows: [controller/user.js](backend/controller/user.js#L1)
- Recipe controllers & CRUD: [controller/recipe.js](backend/controller/recipe.js#L1)
- Routers mapping endpoints: [routes/user.js](backend/routes/user.js#L1), [routes/recipe.js](backend/routes/recipe.js#L1)
- Models: [models/user.js](backend/models/user.js#L1), [models/recipe.js](backend/models/recipe.js#L1)

**Common Extension Ideas (next steps)**
- Add request validation with `express-validator`.
- Add rate limiting (e.g., `express-rate-limit`) to protect endpoints.
- Add upload size limits and image resizing (Sharp) on upload.
- Add automated tests for controllers and routes.
- Add role-based access control (admin vs owner) for edits/deletes.

---

This file summarizes all backend topics, explains how they are implemented, and connects concepts to the concrete files in the repository. If you want, I can also:
- Add inline code snippets pulled from each file (controllers, models) as examples.
- Expand any section into a detailed tutorial with concrete code excerpts.

