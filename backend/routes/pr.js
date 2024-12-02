/* eslint no-undef: "off" */
const express = require("express");
const axios = require('axios');
const GITHUB_TOKEN = "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";
const OWNER = "max4542";

class PullRequestController {
    constructor(webhookResponses) {
        this.router = express.Router();
        this.webhookResponses = webhookResponses; // Store the reference

        this.initializeRoutes();
    }

  initializeRoutes() {
    this.router.get('/webhook/responses', this.feeds.bind(this));
    this.router.put('/merge', this.merge.bind(this));
    this.router.get('/pull-requests/:repo', this.pullRequests.bind(this));
    this.router.get('/pr/collaborator/:repo', this.index.bind(this));
    this.router.get('/pr/collaborators/:username/:repo', this.show.bind(this));
    this.router.get('/collaborator-performance/:repo', this.dashboard.bind(this));
  }


  async makeGitHubRequest(endpoint,repo = null, method = "GET", data = null) {
    const url = `https://api.github.com/repos/${OWNER}/${repo}/${endpoint}`;
    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
    };

    try {
      const response = await axios({ method, url, headers, data });
      return response.data;
    } catch (error) {
      console.log(error);
      console.error(`Error making GitHub request to ${endpoint}:`, error.message);
      throw error;
    }
  }

  async feeds(req, res) {
    res.status(200).json(this.webhookResponses);
  }

  async pullRequests(req, res) {
    const { repo } = req.params;
    try {
      const data = await this.makeGitHubRequest("pulls", repo);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching pull requests' });
    }
  }

  async merge(req, res) {
    
    const { pr_number ,selectedRepo} = req.body;
    console.log(req.user.role)
    
    if (req.user.role == 0) {
      return res.status(403).json({ message: "Only superAdmin can merge the pull request" });
    }

    try {
      const data = await this.makeGitHubRequest(`pulls/${pr_number}/merge`,selectedRepo, "PUT", {
        commit_title: `Merged from express by PR #${pr_number}`,
        merge_method: 'merge',
      });
      console.log(data);
      res.status(200).json({ message: "Pull request merged successfully", data });
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.response?.data?.message || 'Error merging pull request' });
    }
  }

  async index(req, res) {
    const { repo } = req.params;
    try {
      const data = await this.makeGitHubRequest("contributors",repo);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collaborators" });
    }
  }

  async show(req, res) {
    const { username,repo } = req.params;

    try {
      const url = `https://api.github.com/search/issues?q=repo:${OWNER}/${repo}+is:pr+author:${username}`;
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` },
      });

      const pullRequests = await Promise.all(
        response.data.items.map(async pr => {
          let isMerged = false;

          if (pr.state === 'closed') {
              isMerged = true;
          }

          return {
            title: pr.title,
            url: pr.html_url,
            created_at: pr.created_at,
            state: pr.state,
            isMerged,
          };
        })
      );
      res.status(200).json(pullRequests);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching PRs' });
    }
  }

  async dashboard(req, res) {
    const { repo } = req.params;
    try {
      const pulls = await this.makeGitHubRequest("pulls?state=all",repo);
      const performanceData = {};
      const pullNumbers = pulls.map(pull => pull.number);

      const reviewPromises = pullNumbers.map(number =>
        this.makeGitHubRequest(`pulls/${number}/reviews`,repo).then(reviews => ({ number, reviews }))
      );

      const commentPromises = pullNumbers.map(number =>
        this.makeGitHubRequest(`issues/${number}/comments`,repo).then(comments => ({ number, comments }))
      );

      const reviewResults = await Promise.all(reviewPromises);
      const commentResults = await Promise.all(commentPromises);

      const reviewsMap = Object.fromEntries(reviewResults.map(r => [r.number, r.reviews]));
      const commentsMap = Object.fromEntries(commentResults.map(c => [c.number, c.comments]));

      pulls.forEach(pull => {
        const user = pull.user.login;
        performanceData[user] = performanceData[user] || { prsCreated: 0, prsMerged: 0, prsReviewed: 0, commentsMade: 0 };
        performanceData[user].prsCreated++;
        if (pull.state === 'closed' && pull.merged_at) performanceData[user].prsMerged++;

        (reviewsMap[pull.number] || []).forEach(review => {
          if (performanceData[review.user.login]) performanceData[review.user.login].prsReviewed++;
        });

        (commentsMap[pull.number] || []).forEach(comment => {
          if (performanceData[comment.user.login]) performanceData[comment.user.login].commentsMade++;
        });
      });

      res.json(Object.entries(performanceData).map(([username, metrics]) => ({ username, ...metrics })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  }

 

}

module.exports = (webhookResponses) => new PullRequestController(webhookResponses).router;
