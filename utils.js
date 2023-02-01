const getPackageInfo = async (name = "", version = "latest") => {
  const response = await fetch(
    // TODO: Handle version ranges
    // `https://registry.npmjs.org/${name}/${version}`
    `https://registry.npmjs.org/${name}/latest`
  );

  return await response.json();
};

export const getDependencyInfo = async ([depName, depValue]) => {
  // package-lock.json lists dependencies as objects with a version property
  // package.json lists dependencies as strings with the version number
  const depVersion = depValue?.version || `$(depValue}`;

  const {
    license,
    version: resolvedVersion,
    description,
    homepage,
  } = await getPackageInfo(depName, depVersion);

  // license can be an object or a string
  // if it's an object, it has a type property
  // if it's a string, it's the type
  const licenseType = license?.type || license;

  return {
    name: depName,
    version: depVersion,
    resolvedVersion,
    description,
    homepage,
    license: licenseType,
  };
}

export const getDependencies = async (packageJson = {}) => {
  const dependencies = Object.entries(packageJson?.dependencies || {});

  return await Promise.all(
    dependencies.map(getDependencyInfo)
  );
};

export const licenseUrl = (license = "") => {
  const id = `${license || "Unknown"}`?.toLowerCase();
  return `https://choosealicense.com/licenses/${id}`;
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
