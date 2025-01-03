import { Octokit } from "@octokit/rest";

// Initialize Octokit with the token from environment variables
const octokit = new Octokit({ auth: process.env.TOKEN });

/**
 * Creates or updates a file in the specified branch.
 * @param {string} branch - The branch to which the file should be committed.
 * @param {string} filePath - The path of the file to create or update.
 * @param {string} fileContent - The content to write to the file.
 */
async function createOrUpdateFile(branch = "main", filePath = "commit.txt", fileContent = "") {
  try {
    console.log(`Checking if the file exists in branch: ${branch}`);
    const { data } = await octokit.repos.getContent({
      owner: "jibon-roy", // Replace with your GitHub username
      repo: "git-bot", // Replace with your repository name
      path: filePath,
      ref: branch,
    });

    // Update the file if it exists
    console.log(`File exists. Updating the file at path: ${filePath}`);
    await octokit.repos.createOrUpdateFileContents({
      owner: "jibon-roy",
      repo: "git-bot",
      path: filePath,
      message: `Updated ${filePath} at ${new Date().toISOString()}`,
      content: Buffer.from(fileContent).toString("base64"),
      sha: data.sha, // Required for updating an existing file
      branch,
    });
    console.log(`File updated successfully in branch: ${branch}`);
  } catch (error) {
    if (error.status === 404) {
      // File does not exist; create it
      console.log(`File does not exist. Creating a new file at path: ${filePath}`);
      await octokit.repos.createOrUpdateFileContents({
        owner: "jibon-roy",
        repo: "git-bot",
        path: filePath,
        message: `Created ${filePath} at ${new Date().toISOString()}`,
        content: Buffer.from(fileContent).toString("base64"),
        branch,
      });
      console.log(`File created successfully in branch: ${branch}`);
    } else {
      console.error(`Error handling file in branch: ${branch}.`, error);
      throw error; // Rethrow error for global handling
    }
  }
}

/**
 * Main function to execute the bot.
 */
async function run() {
  const branches = ["main", "develop"]; // List of branches to process
  const filePath = "dynamic-file.txt";
  const fileContent = `Hello, this is a commit from GitHub Actions! Time: ${new Date().toISOString()}`;

  console.log("Starting the bot...");
  for (const branch of branches) {
    try {
      await createOrUpdateFile(branch, filePath, fileContent);
    } catch (error) {
      console.error(`Failed to process branch: ${branch}.`, error.message);
    }
  }
  console.log("Bot execution completed.");
}

// Run the bot and handle global errors
run().catch((error) => {
  console.error("An unexpected error occurred while running the bot.", error);
});
