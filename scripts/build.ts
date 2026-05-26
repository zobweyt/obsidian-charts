import esbuild from "esbuild";

const watch = Deno.args.includes("--watch");

const outdir =
  Deno.args.find((arg) => arg.startsWith("--outdir="))?.split("=")[1] ||
  "./dist";

const options: esbuild.BuildOptions = {
  entryPoints: ["./src/main.ts", "./src/styles.css"],
  outdir,
  bundle: true,
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  treeShaking: true,
  format: "cjs",
  target: "es2018",
  platform: "node",
  external: ["obsidian"],
  logLevel: "info",
};

await Deno.mkdir(outdir, { recursive: true });
await Deno.copyFile("./manifest.json", `${outdir}/manifest.json`);

if (watch) {
  const context = await esbuild.context(options);
  await context.watch();
} else {
  await esbuild.build(options);
}
