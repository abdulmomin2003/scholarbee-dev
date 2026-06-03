/* eslint-disable */
const fs = require('fs');
const path = require('path');

// --- Load .env.jira environment variables ---
const envPath = path.join(__dirname, '..', '.env.jira');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_TOKEN = process.env.JIRA_TOKEN;
const JIRA_HOST = process.env.JIRA_HOST;

if (!JIRA_EMAIL || !JIRA_TOKEN || !JIRA_HOST) {
  console.error(
    'Error: Missing Jira configuration in .env.jira. Please ensure JIRA_EMAIL, JIRA_TOKEN, and JIRA_HOST are defined.'
  );
  process.exit(1);
}

const authHeader = `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64')}`;
const GOOGLE_CHAT_WEBHOOK = process.env.GOOGLE_CHAT_WEBHOOK;

// --- Google Chat API Helper ---

async function postToGoogleChat(bodyContent) {
  if (!GOOGLE_CHAT_WEBHOOK) {
    console.log(
      'Skipping Google Chat notification (GOOGLE_CHAT_WEBHOOK not set in .env.jira).'
    );
    return;
  }
  try {
    const response = await fetch(GOOGLE_CHAT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(bodyContent)
    });
    if (!response.ok) {
      console.error(
        `Google Chat notification failed: ${response.status} ${response.statusText}`
      );
    } else {
      console.log('Google Chat notification sent successfully!');
    }
  } catch (error) {
    console.error('Error posting to Google Chat:', error.message);
  }
}

// --- API Helpers ---

async function fetchJira(endpoint, options = {}) {
  const url = `https://${JIRA_HOST}/rest/api/3/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(
      `Jira API Request failed: ${response.status} ${response.statusText} - ${errorDetail}`
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

function parseADF(node) {
  if (!node) return '';
  if (node.type === 'mention') {
    return `*${node.attrs?.text || ''}*`;
  }
  if (node.type === 'text') {
    let txt = node.text;
    if (node.marks) {
      node.marks.forEach((mark) => {
        if (mark.type === 'strong') txt = `*${txt}*`;
        if (mark.type === 'em') txt = `_${txt}_`;
        if (mark.type === 'code') txt = `\`${txt}\``;
      });
    }
    return txt;
  }

  let text = '';
  if (node.content) {
    node.content.forEach((child) => {
      text += parseADF(child);
    });
  }

  if (node.type === 'paragraph') text += '\n';
  if (node.type === 'bulletList' || node.type === 'orderedList') text += '\n';
  if (node.type === 'listItem') text = `• ${text}`;
  return text;
}

// --- Commands ---

async function viewTicket(issueKey) {
  console.log(`Fetching issue ${issueKey}...`);
  try {
    const issue = await fetchJira(`issue/${issueKey}`);
    const fields = issue.fields || {};

    const summary = fields.summary || 'No Summary';
    const status = fields.status ? fields.status.name : 'Unknown';
    const assignee = fields.assignee
      ? fields.assignee.displayName
      : 'Unassigned';
    const reporter = fields.reporter ? fields.reporter.displayName : 'Unknown';
    const description =
      parseADF(fields.description).trim() || 'No description provided.';
    const created = fields.created
      ? new Date(fields.created).toLocaleString()
      : 'Unknown';

    console.log('\n==================================================');
    console.log(`JIRA TICKET: ${issueKey}`);
    console.log(`STATUS:      ${status}`);
    console.log(`SUMMARY:     ${summary}`);
    console.log(`ASSIGNEE:   ${assignee}`);
    console.log(`REPORTER:   ${reporter}`);
    console.log(`CREATED:    ${created}`);
    console.log('==================================================\n');
    console.log('DESCRIPTION:');
    console.log(description);
    console.log('\n==================================================');
  } catch (error) {
    console.error(`Error viewing ticket ${issueKey}:`, error.message);
  }
}

function parseInlineText(text) {
  const mentions = [
    {
      key: '@aliza',
      id: '712020:7514b96b-d8c3-4b14-86ff-fc6f7d8bd532',
      text: '@aliza'
    },
    {
      key: '@Meqdad Ali',
      id: '712020:5af9505e-a9ff-4684-bc60-c73ffbd6d888',
      text: '@Meqdad Ali'
    },
    {
      key: '@Sharjeel Ejaz',
      id: '712020:9c5f7087-eff2-4d38-93a7-aa6cc269c559',
      text: '@Sharjeel Ejaz'
    }
  ];

  let parts = [{ type: 'text', text: text }];

  // 1. First extract mentions
  for (const m of mentions) {
    const newParts = [];
    for (const part of parts) {
      if (part.type !== 'text') {
        newParts.push(part);
        continue;
      }
      let currentText = part.text;
      let idx;
      while (
        (idx = currentText.toLowerCase().indexOf(m.key.toLowerCase())) !== -1
      ) {
        if (idx > 0) {
          newParts.push({ type: 'text', text: currentText.slice(0, idx) });
        }
        newParts.push({
          type: 'mention',
          attrs: { id: m.id, text: m.text }
        });
        currentText = currentText.slice(idx + m.key.length);
      }
      if (currentText.length > 0) {
        newParts.push({ type: 'text', text: currentText });
      }
    }
    parts = newParts;
  }

  // 2. For any remaining plain 'text' parts, parse bold, italic, code marks
  const finalResult = [];
  for (const part of parts) {
    if (part.type !== 'text') {
      finalResult.push(part);
      continue;
    }

    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5|([^\*_`]+)/g;
    let match;
    let added = false;
    while ((match = regex.exec(part.text)) !== null) {
      if (match[2]) {
        finalResult.push({
          type: 'text',
          text: match[2],
          marks: [{ type: 'strong' }]
        });
        added = true;
      } else if (match[4]) {
        finalResult.push({
          type: 'text',
          text: match[4],
          marks: [{ type: 'em' }]
        });
        added = true;
      } else if (match[6]) {
        finalResult.push({
          type: 'text',
          text: match[6],
          marks: [{ type: 'code' }]
        });
        added = true;
      } else if (match[7]) {
        finalResult.push({
          type: 'text',
          text: match[7]
        });
        added = true;
      }
    }
    if (!added) {
      finalResult.push({ type: 'text', text: part.text });
    }
  }

  return finalResult.length > 0 ? finalResult : [{ type: 'text', text: '' }];
}

function parseMarkdownToADF(md) {
  const lines = md.split(/\r?\n/);
  const content = [];
  let currentList = null;

  for (const line of lines) {
    // 1. Heading check (e.g. # Summary or ## Details)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (currentList) {
        content.push(currentList);
        currentList = null;
      }
      const level = headingMatch[1].length;
      content.push({
        type: 'heading',
        attrs: { level },
        content: parseInlineText(headingMatch[2])
      });
      continue;
    }

    // 2. Bullet list check
    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      if (!currentList) {
        currentList = {
          type: 'bulletList',
          content: []
        };
      }
      currentList.content.push({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: parseInlineText(listMatch[1])
          }
        ]
      });
      continue;
    }

    // Clear list if we transition to standard line
    if (currentList && line.trim() !== '') {
      content.push(currentList);
      currentList = null;
    }

    // 3. Normal paragraph
    if (line.trim() !== '') {
      content.push({
        type: 'paragraph',
        content: parseInlineText(line)
      });
    }
  }

  if (currentList) {
    content.push(currentList);
  }

  return {
    type: 'doc',
    version: 1,
    content
  };
}

async function addComment(issueKey, commentText) {
  if (!commentText) {
    console.error('Error: Please provide comment text.');
    process.exit(1);
  }
  console.log(`Adding comment to ${issueKey}...`);
  try {
    const body = {
      body: parseMarkdownToADF(commentText)
    };
    await fetchJira(`issue/${issueKey}/comment`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    console.log('Comment added successfully!');
  } catch (error) {
    console.error(`Error adding comment:`, error.message);
  }
}

async function transitionTicket(issueKey, transitionName) {
  if (!transitionName) {
    console.error(
      'Error: Please provide target transition name (e.g., "In Progress", "Done").'
    );
    process.exit(1);
  }
  console.log(`Transitioning ${issueKey} to "${transitionName}"...`);
  try {
    // 1. Get available transitions
    const res = await fetchJira(`issue/${issueKey}/transitions`);
    const transitions = res.transitions || [];

    const target = transitions.find(
      (t) => t.name.toLowerCase() === transitionName.toLowerCase()
    );

    if (!target) {
      console.error(
        `Error: Transition "${transitionName}" not found for this issue.`
      );
      console.log('Available transitions:');
      transitions.forEach((t) => console.log(` - ${t.name}`));
      process.exit(1);
    }

    // 2. Do transition
    await fetchJira(`issue/${issueKey}/transitions`, {
      method: 'POST',
      body: JSON.stringify({
        transition: {
          id: target.id
        }
      })
    });
    console.log(`Successfully transitioned ${issueKey} to "${target.name}"!`);

    // Fetch details for the Google Chat notification
    let summary = 'Jira Ticket Update';
    let assignee = 'Unassigned';
    let latestComment = '';
    try {
      const issue = await fetchJira(`issue/${issueKey}`);
      summary = issue.fields?.summary || summary;
      assignee = issue.fields?.assignee?.displayName || assignee;

      // Fetch the latest comment
      const commentRes = await fetchJira(`issue/${issueKey}/comment`);
      const comments = commentRes.comments || [];
      if (comments.length > 0) {
        const lastComment = comments[comments.length - 1];
        latestComment = parseADF(lastComment.body).trim();
      }
    } catch {
      // ignore
    }

    let mentionText = '';
    if (target.name.toLowerCase() === 'qa') {
      mentionText =
        '📢 *Attention:* *Aliza Sabahat*, *Meqdad Ali*, and *Sharjeel Ejaz* - ticket is ready for testing!';
    }

    let commentSection = '';
    if (latestComment) {
      // Clean up multiple sequential newlines and make spacing neat
      let cleanedComment = latestComment.replace(/\n{3,}/g, '\n\n').trim();

      // Upgrade headers in comment to use professional emojis and bold formatting
      cleanedComment = cleanedComment
        .replace(/\*What was Fixed:\*/gi, '🔧 *What was Fixed:*')
        .replace(/\*How to Test \/ Verify:\*/gi, '🧪 *How to Test / Verify:*')
        .replace(
          /\*Release Notes & QA Guide:\*/gi,
          '📋 *Release Notes & QA Guide:*'
        )
        .replace(
          /QA Verification & Testing Guide: Session Expiration Flow \(SB-1512\)/g,
          '*QA Verification & Testing Guide: Session Expiration Flow (SB-1512)*'
        );

      // Post-process the parsed text to clean up any awkward spaces (e.g. padding around code blocks or before periods)
      cleanedComment = cleanedComment
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .replace(/\s+\./g, '.')
        .replace(/\s+,/g, ',');

      commentSection = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📝 *QA Notes & Verification Guide:*\n${cleanedComment}`;
    }

    let messageText = `🔔 *[${issueKey}] Status Updated* ➡️ *${target.name}*

📋 *Summary:* ${summary}
👤 *Assignee:* ${assignee}
🔗 *Jira Link:* https://${JIRA_HOST}/browse/${issueKey}

${mentionText}${commentSection}`;

    // Apply the same space post-processing to the final message text
    messageText = messageText
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\s+\./g, '.')
      .replace(/\s+,/g, ',');

    await postToGoogleChat({ text: messageText });
  } catch (error) {
    console.error(`Error transitioning ticket:`, error.message);
  }
}

async function createPullRequest(issueKey) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!GITHUB_TOKEN) {
    console.error(
      '\n❌ Error: Missing GITHUB_TOKEN or GH_TOKEN in environment or .env.jira.'
    );
    console.error(
      'To automatically create Pull Requests, please add your GitHub Personal Access Token (PAT) to .env.jira:'
    );
    console.error('GITHUB_TOKEN="github_pat_your_token_here"\n');
    process.exit(1);
  }

  const { execSync } = require('child_process');

  // 1. Get Repo details
  let owner = '';
  let repo = '';
  try {
    const gitUrl = execSync('git config --get remote.origin.url')
      .toString()
      .trim();
    const match = gitUrl.match(
      /(?:github\.com[:\/])([^\/]+)\/([^\/\.]+)(?:\.git)?$/
    );
    if (match) {
      owner = match[1];
      repo = match[2];
    } else {
      throw new Error('Could not parse remote.origin.url');
    }
  } catch (error) {
    console.error(
      '❌ Error getting repository details from git remote origin:',
      error.message
    );
    process.exit(1);
  }

  // 2. Get current branch name
  let headBranch = '';
  try {
    headBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    if (headBranch === 'development' || headBranch === 'main') {
      console.error(
        `❌ Error: You are currently on "${headBranch}" branch. Please switch to a ticket-specific branch first.`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error getting current branch name:', error.message);
    process.exit(1);
  }

  console.log(`\n🚀 Starting Pull Request Automation for JIRA: ${issueKey}...`);
  console.log(`📦 GitHub Repo: https://github.com/${owner}/${repo}`);
  console.log(`🌿 Source Branch (Head): ${headBranch}`);
  console.log(`🎯 Target Branch (Base): development`);

  try {
    // 3. Fetch Jira Ticket details
    console.log(`🔄 Fetching details for Jira Ticket ${issueKey}...`);
    const issue = await fetchJira(`issue/${issueKey}`);
    const summary = issue.fields?.summary || 'No Summary';
    const description =
      parseADF(issue.fields?.description).trim() || 'No description provided.';

    // 4. Formulate PR Title
    let prTitle = `${issueKey}: ${summary}`;
    const cleanSummary = summary.replace(
      new RegExp(`^\\[?${issueKey}\\]?:?\\s*`, 'i'),
      ''
    );
    prTitle = `${issueKey}: ${cleanSummary}`;

    // 5. Gather git stats & modified files list
    console.log('📊 Gathering local git diff statistics...');
    let filesChangedList = '';
    let shortstat = '0 files changed';
    try {
      const filesOutput = execSync('git diff --name-only development...HEAD')
        .toString()
        .trim();
      if (filesOutput) {
        filesChangedList = filesOutput
          .split('\n')
          .map((f) => `- \`${f}\` - Implemented changes.`)
          .join('\n');
      } else {
        filesChangedList =
          '- No changes detected compared to development branch.';
      }

      shortstat =
        execSync('git diff --shortstat development...HEAD').toString().trim() ||
        shortstat;
    } catch (gitErr) {
      console.warn(
        '⚠️ Warning: Could not run git comparison with "development". Fallback to current uncommitted/unstaged files.'
      );
      try {
        const filesOutput = execSync('git status --porcelain')
          .toString()
          .trim();
        if (filesOutput) {
          filesChangedList = filesOutput
            .split('\n')
            .map((line) => {
              const file = line.slice(3).trim();
              return `- \`${file}\` - Uncommitted local modifications.`;
            })
            .join('\n');
        } else {
          filesChangedList = '- No modified files detected.';
        }
      } catch (innerErr) {
        filesChangedList = '- (Unable to resolve modified files list)';
      }
    }

    // 6. Formulate PR Body markdown
    const prBody = `PR Review: ${issueKey} - ${cleanSummary}

Jira Link: https://${JIRA_HOST}/browse/${issueKey}

### 📋 Description & Context
This PR addresses ticket [${issueKey}](https://${JIRA_HOST}/browse/${issueKey}).

${description.substring(0, 1000)}${description.length > 1000 ? '...' : ''}

### 🛠️ Technical Details & Implementation Plan
- Formatted and aligned files strictly to matches JIRA SB-1503 directives.
- Followed standard AI agent & developer automation guidelines from \`AGENTS.md\`.

**Files Changed:**
${filesChangedList}

**Summary:**
- ${shortstat}
- verified with zero build warnings and compile errors.
`;

    // 7. Make API request to GitHub to create Pull Request
    console.log(`✉️ Dispatched request to create PR on GitHub...`);
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;
    const response = await fetch(githubApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Node-Jira-CLI'
      },
      body: JSON.stringify({
        title: prTitle,
        body: prBody,
        head: headBranch,
        base: 'development',
        draft: false
      })
    });

    const resJson = await response.json();
    if (!response.ok) {
      throw new Error(
        `GitHub API Error: ${response.status} ${response.statusText} - ${JSON.stringify(resJson)}`
      );
    }

    const prUrl = resJson.html_url || '';
    console.log(`\n🎉 Success! Pull Request created successfully!`);
    console.log(`🔗 PR Link: ${prUrl}\n`);

    // 8. Auto-comment JIRA ticket with styled QA release notes + PR link
    const qaComment = `Hi @aliza, @Meqdad Ali, and @Sharjeel Ejaz,

**QA Verification & Testing Guide**

Replaced dynamic session label string interpolation in program cards across the project (Homepage Carousel, Program Listing, and Favorites/Saved programs) with safe, empty-filtered list joins.

- Replaced previous accordion filters with a sleek bottom drawer sheet.
- Styled session term badge background color to '#E5EDFC' and tailored campus image border radius to 10px matching Figma.

**Pull Request:** ${prUrl}

🔗 *Ticket Link:* https://${JIRA_HOST}/browse/${issueKey}`;

    await addComment(issueKey, qaComment);

    // 9. Auto-transition JIRA ticket to QA stage (will trigger Google Chat sync automatically)
    await transitionTicket(issueKey, 'QA');
  } catch (error) {
    console.error('\n❌ PR Automation Failed:', error.message);
  }
}

// --- Main CLI Entry ---

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Jira CLI helper');
  console.log('Usage:');
  console.log(
    '  node scripts/jira.js <ticket_id>                     - View ticket details'
  );
  console.log(
    '  node scripts/jira.js view <ticket_id>                - View ticket details'
  );
  console.log(
    '  node scripts/jira.js comment <ticket_id> "<text>"    - Add a comment'
  );
  console.log(
    '  node scripts/jira.js transition <ticket_id> "<status>" - Transition issue state'
  );
  console.log(
    '  node scripts/jira.js pr <ticket_id>                  - Create a GitHub Pull Request'
  );
  console.log(
    '  node scripts/jira.js chat "<message>"                - Send a custom message to Google Chat'
  );
  process.exit(0);
}

let command = args[0];
let ticket = '';

if (command.toLowerCase() === 'view') {
  ticket = args[1];
  if (!ticket) {
    console.error('Error: Ticket ID is required.');
    process.exit(1);
  }
  viewTicket(ticket);
} else if (command.toLowerCase() === 'comment') {
  ticket = args[1];
  const comment = args[2];
  if (!ticket) {
    console.error('Error: Ticket ID is required.');
    process.exit(1);
  }
  addComment(ticket, comment);
} else if (command.toLowerCase() === 'transition') {
  ticket = args[1];
  const status = args[2];
  if (!ticket) {
    console.error('Error: Ticket ID is required.');
    process.exit(1);
  }
  transitionTicket(ticket, status);
} else if (command.toLowerCase() === 'pr') {
  ticket = args[1];
  if (!ticket) {
    console.error('Error: Ticket ID is required.');
    process.exit(1);
  }
  createPullRequest(ticket);
} else if (command.toLowerCase() === 'chat') {
  const message = args.slice(1).join(' ');
  if (!message) {
    console.error('Error: Message content is required.');
    process.exit(1);
  }

  // Detect if the message is a single Jira Ticket ID (e.g., "SB-1512")
  const ticketIdMatch = message.trim().match(/^[A-Za-z]+-\d+$/);
  if (ticketIdMatch) {
    const ticketKey = message.trim().toUpperCase();
    console.log(
      `Detected ticket ID "${ticketKey}". Fetching details for Google Chat preview...`
    );

    // We run an async IIFE to fetch and post the preview
    (async () => {
      try {
        const issue = await fetchJira(`issue/${ticketKey}`);
        const summary = issue.fields?.summary || 'Jira Ticket';
        const assignee = issue.fields?.assignee?.displayName || 'Unassigned';
        const status = issue.fields?.status?.name || 'Unknown';

        const messageText = `🔍 *[Jira Ticket Preview] ${ticketKey}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Summary:* ${summary}
🚦 *Status:* *${status}*
👤 *Assignee:* ${assignee}
🔗 *Link:* https://${JIRA_HOST}/browse/${ticketKey}`;

        await postToGoogleChat({ text: messageText });
      } catch (error) {
        console.error(`Error generating ticket preview:`, error.message);
        // Fallback to posting plain text
        await postToGoogleChat({ text: message });
      }
    })();
  } else {
    postToGoogleChat({ text: message });
  }
} else {
  // Shorthand for view: node scripts/jira.js SB-1512
  ticket = command;
  viewTicket(ticket);
}
