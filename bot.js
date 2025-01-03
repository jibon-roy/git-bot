const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");

// Replace these with your GitHub details
const TOKEN = "your_personal_access_token"; // Replace with your PAT
const OWNER = "your_github_username"; // Replace with the repository owner
const REPO = "your_repository_name"; // Replace with the repository name

const octokit = new Octokit({ auth: TOKEN });

async function createCommit() {
  try {
    // Read the file to commit (or generate content dynamically)
    const filePath = path.join(__dirname, "commit.txt");
    const fileContent = fs.readFileSync(filePath, "utf8");
    const contentBase64 = Buffer.from(fileContent).toString("base64");

    // Fetch the latest commit to get the SHA
    const { data: refData } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: "heads/main", // Adjust branch name if different
    });

    const latestCommitSha = refData.object.sha;

    // Get the tree SHA of the latest commit
    const { data: commitData } = await octokit.git.getCommit({
      owner: OWNER,
      repo: REPO,
      commit_sha: latestCommitSha,
    });

    const treeSha = commitData.tree.sha;

    // Create a new blob for the file
    const { data: blobData } = await octokit.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: contentBase64,
      encoding: "base64",
    });

    // Create a new tree with the updated file
    const { data: newTreeData } = await octokit.git.createTree({
      owner: OWNER,
      repo: REPO,
      tree: [
        {
          path: "example.txt", // Path of the file in the repository
          mode: "100644",
          type: "blob",
          sha: blobData.sha,
        },
      ],
      base_tree: treeSha,
    });

    // Create a new commit
    const { data: newCommitData } = await octokit.git.createCommit({
      owner: OWNER,
      repo: REPO,
      message: "Automated commit by GitHub bot",
      tree: newTreeData.sha,
      parents: [latestCommitSha],
    });

    // Update the reference to point to the new commit
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: "heads/main",
      sha: newCommitData.sha,
    });

    console.log("Commit created successfully!");
  } catch (error) {
    console.error("Error creating commit:", error);
  }
}

// Run the bot
createCommit();
