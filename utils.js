const getPackageInfo = async (name = "", version = "latest") => {
  const response = await fetch(
    // TODO: Handle version ranges
    // `https://registry.npmjs.org/${name}/${version}`
    `https://registry.npmjs.org/${name}/latest`
  );

  return await response.json();
};

export const getDependencies = async (packageJson = {}) => {
  const dependencies = Object.entries(packageJson?.dependencies || {});

  return await Promise.all(
    dependencies.map(async ([depName, depVersion]) => {
      const {
        license,
        version: resolvedVersion,
        description,
        homepage,
      } = await getPackageInfo(depName, depVersion);

      return {
        name: depName,
        version: depVersion,
        resolvedVersion,
        description,
        homepage,
        license,
      };
    })
  );
};

export const licenseUrl = (license = "") => {
  return `https://choosealicense.com/licenses/${license.toLowerCase()}`;
};

/** Convert a 2D array into a CSV string
 */
export function arrayToCsv(data) {
  return data
    .map(
      (row) =>
        row
          .map(String) // convert every value to String
          .map((v) => v.replaceAll('"', '""')) // escape double colons
          .map((v) => `"${v}"`) // quote it
          .join(",") // comma-separated
    )
    .join("\r\n"); // rows starting on new lines
}
