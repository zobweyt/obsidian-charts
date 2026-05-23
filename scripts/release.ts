import { promptSelect } from "@std/cli/unstable-prompt-select";
import { Spinner } from "@std/cli/unstable-spinner";
import { dim, green, magenta, strikethrough } from "@std/fmt/colors";
import { format, increment, parse, ReleaseType } from "@std/semver";

const manifestPath = "./manifest.json";
const manifest = JSON.parse(await Deno.readTextFile(manifestPath));
const currentVersion = manifest.version;
const releaseTypes: ReleaseType[] = ["patch", "minor", "major"];

const releaseType = promptSelect(
  "Select release type:",
  releaseTypes.map((releaseType) => ({
    label: `${releaseType} ${dim(strikethrough(currentVersion))} → ${
      green(format(increment(parse(currentVersion), releaseType)))
    }`,
    value: releaseType,
  })),
  { indicator: magenta("❯"), clear: true },
);
if (!releaseType) {
  console.log("Cancelled");
  Deno.exit(0);
}
const newVersion = format(increment(parse(currentVersion), releaseType.value));

const spinner = new Spinner({
  message: "Updating manifest and commiting…",
  color: "magenta",
});
spinner.start();

manifest.version = newVersion;
await Deno.writeTextFile(
  manifestPath,
  JSON.stringify(manifest, null, 2) + "\n",
);

const message = `Release ${newVersion}`;
await new Deno.Command("git", { args: ["add", manifestPath] }).output();
await new Deno.Command("git", { args: ["commit", "-m", message] }).output();
await new Deno.Command("git", { args: ["tag", newVersion, "-m", message] })
  .output();
await new Deno.Command("git", { args: ["push"] }).output();
await new Deno.Command("git", { args: ["push", "origin", newVersion] })
  .output();

spinner.stop();
console.log(`Released ${green(newVersion)}!`);
