# Custom 3D Models

Place `.glb` or `.gltf` files in this folder to use them as the AR hologram model.

Example:

```txt
public/models/tree.glb
```

Then update `DEFAULT_MODEL_URL` in `src/lib/constants.ts`:

```ts
export const DEFAULT_MODEL_URL = "/models/tree.glb";
```

If the URL is empty or the model fails to load, the app falls back to the built-in hologram object.
