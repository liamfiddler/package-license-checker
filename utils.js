const getPackageInfo = async (name = "") => {
  const response = await fetch(
    `https://registry.npmjs.org/${name}?fields=version,versions,dist-tags,license,homepage`
  );

  return await response.json();
};

export const getDependencyInfo = async ([depName, depValue]) => {
  // package-lock.json lists dependencies as objects with a version property
  // package.json lists dependencies as strings with the version number
  const depVersion = depValue?.version || `${depValue}`;

  const data = await getPackageInfo(depName);
  const versions = Object.keys(data.versions || {});
  const resolvedVersion = getMatchingVersion(depVersion, versions);

  // Get info for the specific matched version, or fallback to general data
  const versionInfo = data.versions?.[resolvedVersion] || data;

  const {
    license,
    homepage,
  } = versionInfo;

  const latestVersion = data["dist-tags"]?.latest;

  // license can be an object or a string
  // if it's an object, it has a type property
  // if it's a string, it's the type
  const licenseType = license?.type || license;

  return {
    name: depName,
    requestedVersion: depVersion,
    resolvedVersion,
    latestVersion,
    versions,
    homepage,
    license: licenseType,
    isPermissive: isPermissiveLicense(licenseType),
    isWithinNMinusTwoMajor: isWithinNMinusTwo(resolvedVersion, latestVersion, false),
    isWithinNMinusTwoMinor: isWithinNMinusTwo(resolvedVersion, latestVersion, true),
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

/**
 * Compares two semantic version strings.
 * Returns 1 if v1 > v2, -1 if v1 < v2, 0 if v1 === v2
 */
const compareVersions = (v1, v2) => {
  const p1 = v1.split('.').map(Number);
  const p2 = v2.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
};

const satisfies = (version, range) => {
  if (range.startsWith('^')) {
    const min = range.slice(1);
    const p = min.split('.').map(Number);
    let max;
    if (p[0] === 0) {
      if (p[1] === 0) {
        max = `0.0.${(p[2] || 0) + 1}`;
      } else {
        max = `0.${(p[1] || 0) + 1}.0`;
      }
    } else {
      max = `${p[0] + 1}.0.0`;
    }
    return compareVersions(version, min) >= 0 && compareVersions(version, max) < 0;
  }

  if (range.startsWith('~')) {
    const min = range.slice(1);
    const p = min.split('.').map(Number);
    const max = `${p[0]}.${(p[1] || 0) + 1}.0`;
    return compareVersions(version, min) >= 0 && compareVersions(version, max) < 0;
  }

  return version === range;
};

/**
 * Returns the highest version that satisfies the given range.
 * Currently supports caret (^) and tilde (~) and exact versions.
 */
export const getMatchingVersion = (range = "", versions = []) => {
  // Filter out pre-release versions (e.g., 1.2.3-alpha) unless range itself is a pre-release
  const isPreReleaseRange = range.includes('-');
  const filteredVersions = versions.filter(v => isPreReleaseRange || !v.includes('-'));

  // Sort versions descending (highest first)
  const sortedVersions = [...filteredVersions].sort((a, b) => compareVersions(b, a));

  if (!range || range === "latest" || range === "*") {
    return sortedVersions[0];
  }

  return sortedVersions.find((v) => satisfies(v, range)) || sortedVersions[0];
};

export const isWithinNMinusTwo = (resolvedVersion, latestVersion, minor = false) => {
  const resolved = resolvedVersion.split('.').map(Number);
  const latest = latestVersion.split('.').map(Number);

  if (minor) {
    return resolved[0] < latest[0] || resolved[1] >= latest[1] - 2;
  }

  return resolved[0] >= latest[0] - 2;
};

// Common permissive open-source licenses
const permissiveLicenses = [
  "MIT",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "ISC",
  "Zlib",
  "Unlicense",
  "CC0-1.0", // Creative Commons Zero
  "Python-2.0",
  "PostgreSQL",
  "MIT-0" // Zero-clause MIT
].map((license) => license.toLowerCase());

export const isPermissiveLicense = (license = "") => {
  return permissiveLicenses.includes(license.toLowerCase());
};
