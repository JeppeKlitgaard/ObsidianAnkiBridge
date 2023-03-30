// Usage: yarn vup {major,minor,patch}
import { readFile, writeFile } from "fs/promises";
import { promisify } from "util";
import { exec } from "child_process";

async function pExec(cmd) {
  try {
    const { stdout, stderr } = await promisify(exec)(cmd);

    if (stdout !== "") {
      console.log("> ", stdout)
    }

    if (stderr !== "") {
      console.error("! ", stderr)
    }
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}

(async () => {
  const bumpStrategy = process.argv.slice(2);
  // Run yarn version updater
  console.log(`Running Yarn version bumper with strategy: ${bumpStrategy}`);
  await pExec(`yarn version ${bumpStrategy}`);

  // Read package.json version set by yarn version bumper
  console.log("Reading package.json");
  const packageJson = JSON.parse(await readFile("package.json", "utf-8"));
  const targetVersion = packageJson.version;

  console.log(`👷 Setting ${packageJson.name} version to ${targetVersion}`);

  // read minAppVersion from manifest.json and bump version to target version
  let manifest = JSON.parse(await readFile("manifest.json", "utf-8"));
  const { minAppVersion } = manifest;
  manifest.version = targetVersion;

  console.log("Updating manifest.json");
  await writeFile("manifest.json", JSON.stringify(manifest, null, "\t"));


  // update versions.json with target version and minAppVersion from manifest.json
  console.log("Updating versions.json");
  let versions = JSON.parse(await readFile("versions.json", "utf-8"));
  versions[targetVersion] = minAppVersion;
  await writeFile("versions.json", JSON.stringify(versions, null, "\t"));

  console.log("Adding to git")
  await pExec("git add manifest.json manifest-beta.json package.json versions.json .yarn/versions")

  console.log("Commiting to git")
  await pExec(`git commit -m "release(chore): ${targetVersion}"`)

  console.log("Creating a git tag")
  await pExec(`git tag -a "${targetVersion}" -m "Release version ${targetVersion}"`)

  console.log("🎉 Pushing to Git")
  await pExec("git push")
  await pExec("git push --tags")
})()
