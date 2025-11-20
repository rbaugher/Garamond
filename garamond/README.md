# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Local development with Vercel serverless functions

This project uses Vercel serverless functions stored in the `api/` folder. During local development you have two main options:

1) Use `vercel dev` (recommended)

	 - Install the Vercel CLI if you don't have it:

		 ```powershell
		 npm i -g vercel
		 ```

	 - Run the dev server from the project root:

		 ```powershell
		 vercel dev
		 ```

	 - `vercel dev` serves both the frontend and the `api/` serverless functions together (default: http://localhost:3000).

2) Run Vite locally + target deployed functions

	 - If you prefer running Vite's dev server (`npm run dev`), set the `VITE_API_BASE` environment variable to point at a deployed Vercel URL or your local `vercel dev` instance.

	 - Example `.env` file in the project root:

		 ```text
		 VITE_API_BASE=http://localhost:3000
		 ```

	 - Restart the dev server after changing `.env`. Requests will be made to `${VITE_API_BASE}/api/...`.

Notes
- Vite's dev server doesn't execute files in `api/` — use `vercel dev` or a proxy if you want serverless functions locally.
- All frontend API calls are env-aware and default to same-origin when `VITE_API_BASE` is not set.
