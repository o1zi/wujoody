// Client-only: convert an uploaded FBX/OBJ model into a binary glTF (.glb)
// entirely in the browser using three.js — so offices don't need Blender or any
// server. Already-web-ready .glb files pass straight through.
//
// The three.js loaders/exporter are imported lazily (they're heavy) so they only
// load when an office actually converts a file.

export type Converted = { blob: Blob; name: string; converted: boolean };

const SUPPORTED = ["glb", "fbx", "obj"];

export function isSupportedModel(name: string): boolean {
  return SUPPORTED.includes((name.split(".").pop() || "").toLowerCase());
}

export async function convertModelToGlb(file: File): Promise<Converted> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const base = file.name.replace(/\.[^.]+$/, "") || "model";

  // Already a single-file binary glТF — nothing to do.
  if (ext === "glb") return { blob: file, name: file.name, converted: false };

  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");

  let object: unknown;
  if (ext === "fbx") {
    const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
    object = new FBXLoader().parse(await file.arrayBuffer(), "");
  } else if (ext === "obj") {
    const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
    object = new OBJLoader().parse(await file.text());
  } else {
    throw new Error("unsupported format");
  }

  const glb = await new Promise<ArrayBuffer>((resolve, reject) => {
    new GLTFExporter().parse(
      object,
      (result: ArrayBuffer | object) => {
        if (result instanceof ArrayBuffer) resolve(result);
        else reject(new Error("expected binary glTF output"));
      },
      (err: unknown) => reject(err instanceof Error ? err : new Error("export failed")),
      { binary: true },
    );
  });

  return { blob: new Blob([glb], { type: "model/gltf-binary" }), name: `${base}.glb`, converted: true };
}
