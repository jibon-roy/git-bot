const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({ auth: process.env.TOKEN });

// Function to handle file creation or updates
async function createOrUpdateFile(branch = "main") {
  const filePath = "commit.txt"; // Dynamic file path
  const fileContent = `Hello, this is a commit from GitHub Actions! Time: ${new Date().toISOString()}`;

  try {
    // Check if the file exists in the specified branch
    const { data } = await octokit.repos.getContent({
      owner: "jibon-roy", // Replace with your GitHub username
      repo: "git-bot", // Replace with your repository name
      path: filePath,
      ref: branch,
    });

    // Update the file if it exists
    await octokit.repos.createOrUpdateFileContents({
      owner: "jibon-roy",
      repo: "git-bot",
      path: filePath,
      message: `Updated ${filePath} at ${new Date().toISOString()}`,
      content: Buffer.from(fileContent).toString("base64"),
      sha: data.sha, // Required for updating an existing file
      branch,
    });
    console.log(`File updated successfully on branch: ${branch}`);
  } catch (error) {
    if (error.status === 404) {
      // File does not exist, create it
      await octokit.repos.createOrUpdateFileContents({
        owner: "jibon-roy",
        repo: "git-bot",
        path: filePath,
        message: `Created ${filePath} at ${new Date().toISOString()}`,
        content: Buffer.from(fileContent).toString("base64"),
        branch,
      });
      console.log(`File created successfully on branch: ${branch}`);
    } else {
      console.error("Error handling file:", error.message);
    }
  }
}

// Execute the bot for specific branches
async function run() {
  console.log("Running bot...");
  await createOrUpdateFile("main"); // Commit to the main branch
  await createOrUpdateFile("develop"); // Commit to the develop branch
}

run().catch((error) => console.error("Error running bot:", error));
