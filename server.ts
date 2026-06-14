import express from "express";
import path from "path";
import { execFile } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Enable JSON middleware
app.use(express.json());

// In-Memory Database Store for live demo with rich preset parameters
let users = [
  { userId: 1, name: "Aviral", email: "aviralj193@gmail.com", passwordHash: "sha256_preset" },
  { userId: 2, name: "John Doe", email: "john@example.com", passwordHash: "sha256_preset" },
  { userId: 3, name: "Alice Smith", email: "alice@example.com", passwordHash: "sha256_preset" }
];

let groups = [
  { groupId: 1, groupName: "Graduation Trip 2026", createdBy: 1 },
  { groupId: 2, groupName: "Summer Solstice Escapade", createdBy: 2 }
];

let groupMembers = [
  { id: 1, userId: 1, groupId: 1 },
  { id: 2, userId: 2, groupId: 1 },
  { id: 3, userId: 3, groupId: 1 },
  { id: 4, userId: 2, groupId: 2 },
  { id: 5, userId: 3, groupId: 2 }
];

let destinationPreferences = [
  // Preset preferences for Group 1 (Pre-aligned and pre-matching "Bali" to demonstrate successful generation)
  { prefId: 1, groupId: 1, userId: 2, destinationName: "Bali", fromDate: "2026-08-01", toDate: "2026-08-15", priorityScore: 5 },
  { prefId: 2, groupId: 1, userId: 3, destinationName: "Bali", fromDate: "2026-08-04", toDate: "2026-08-18", priorityScore: 4 },
  { prefId: 3, groupId: 1, userId: 1, destinationName: "Phuket", fromDate: "2026-08-02", toDate: "2026-08-14", priorityScore: 3 },
  
  // Preset preferences for Group 2 (Conflict on dates to demonstrate Overlap Failure error flows)
  { prefId: 4, groupId: 2, userId: 2, destinationName: "Rome", fromDate: "2026-07-01", toDate: "2026-07-10", priorityScore: 5 },
  { prefId: 5, groupId: 2, userId: 3, destinationName: "Paris", fromDate: "2026-07-15", toDate: "2026-07-25", priorityScore: 4 }
];

let generatedTrips: any[] = [];

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required for registration." });
  }

  const emailLower = email.trim().toLowerCase();
  const exists = users.some(u => u.email === emailLower);
  if (exists) {
    return res.status(409).json({ message: "An account with that email has already registered." });
  }

  const userId = users.length + 1;
  const hash = "sha256_" + Math.random().toString(36).substring(7);
  const newUser = { userId, name: name.trim(), email: emailLower, passwordHash: hash };
  users.push(newUser);

  return res.status(201).json({
    message: "User registered successfully",
    userId,
    name: newUser.name,
    email: newUser.email
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const emailLower = email.trim().toLowerCase();
  const user = users.find(u => u.email === emailLower);
  if (!user) {
    return res.status(401).json({ message: "Invalid email credentials." });
  }

  // Standalone bypass for sample authentication
  return res.json({
    message: "Authentication successful",
    userId: user.userId,
    name: user.name,
    email: user.email
  });
});

// ==========================================
// 2. GROUP MANAGEMENT ENDPOINTS
// ==========================================

app.get("/api/groups", (req, res) => {
  return res.json(groups);
});

// Fetch all members for specific group
app.get("/api/groups/:id/members", (req, res) => {
  const groupId = parseInt(req.params.id);
  const membersList = groupMembers
    .filter(m => m.groupId === groupId)
    .map(member => {
      const user = users.find(u => u.userId === member.userId);
      return {
        userId: member.userId,
        name: user ? user.name : "Unknown Traveler",
        email: user ? user.email : ""
      };
    });
  return res.json(membersList);
});

// Fetch groups current user is a part of
app.get("/api/users/:userId/groups", (req, res) => {
  const userId = parseInt(req.params.userId);
  const userGroupAssociations = groupMembers.filter(m => m.userId === userId);
  const userGroups = groups.filter(g => userGroupAssociations.some(assoc => assoc.groupId === g.groupId));
  return res.json(userGroups);
});

app.post("/api/groups/create", (req, res) => {
  const { groupName, userId } = req.body;
  if (!groupName || !userId) {
    return res.status(400).json({ message: "GroupName and Creator UserId are required." });
  }

  const newGroupId = groups.length + 1;
  const newGroup = { groupId: newGroupId, groupName: groupName.trim(), createdBy: parseInt(userId) };
  groups.push(newGroup);

  // Auto-join group creator
  groupMembers.push({
    id: groupMembers.length + 1,
    userId: parseInt(userId),
    groupId: newGroupId
  });

  return res.status(201).json({
    message: "Group created successfully",
    group_id: newGroup.groupId,
    group_name: newGroup.groupName,
    created_by: newGroup.createdBy
  });
});

app.post("/api/groups/join", (req, res) => {
  const { groupId, userId } = req.body;
  if (!groupId || !userId) {
    return res.status(400).json({ message: "GroupId and UserId are required." });
  }

  const parsedGroupId = parseInt(groupId);
  const parsedUserId = parseInt(userId);

  const groupExists = groups.find(g => g.groupId === parsedGroupId);
  if (!groupExists) {
    return res.status(404).json({ message: "The specified Group ID does not exist." });
  }

  const alreadyMember = groupMembers.some(m => m.userId === parsedUserId && m.groupId === parsedGroupId);
  if (alreadyMember) {
    return res.json({
      message: "You are already a member of this group.",
      group_id: parsedGroupId,
      group_name: groupExists.groupName
    });
  }

  groupMembers.push({
    id: groupMembers.length + 1,
    userId: parsedUserId,
    groupId: parsedGroupId
  });

  return res.json({
    message: "Successfully joined group",
    group_id: parsedGroupId,
    group_name: groupExists.groupName
  });
});

// ==========================================
// 3. PREFERENCE SUBMISSION ENDPOINTS
// ==========================================

app.get("/api/preferences/group/:groupId", (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const preferences = destinationPreferences
    .filter(p => p.groupId === groupId)
    .map(p => {
      const user = users.find(u => u.userId === p.userId);
      return {
        ...p,
        userName: user ? user.name : "Traveler"
      };
    });
  return res.json(preferences);
});

app.post("/api/preferences/submit", (req, res) => {
  const { groupId, userId, destinationName, fromDate, toDate, priorityScore } = req.body;

  if (!groupId || !userId || !destinationName || !fromDate || !toDate || priorityScore === undefined) {
    return res.status(400).json({ message: "All preference fields are required." });
  }

  const pScore = parseInt(priorityScore);
  if (pScore < 1 || pScore > 5) {
    return res.status(400).json({ message: "Priority score must be between 1 and 5." });
  }

  const start = new Date(fromDate);
  const end = new Date(toDate);
  if (start > end) {
    return res.status(400).json({ message: "The Start Date ('from') cannot fall after End Date ('to')." });
  }

  const parsedGroupId = parseInt(groupId);
  const parsedUserId = parseInt(userId);

  // Validate group membership
  const isMember = groupMembers.some(m => m.userId === parsedUserId && m.groupId === parsedGroupId);
  if (!isMember) {
    return res.status(403).json({ message: "User must be joined inside the group before submitting preferences." });
  }

  const prefId = destinationPreferences.length + 1;
  const newPreference = {
    prefId,
    groupId: parsedGroupId,
    userId: parsedUserId,
    destinationName: destinationName.trim(),
    fromDate,
    toDate,
    priorityScore: pScore
  };

  destinationPreferences.push(newPreference);
  return res.status(201).json({
    message: "Destination preference saved successfully",
    pref_id: prefId
  });
});

// ==========================================
// 4. CORE GENERATION ENDPOINT (Consensus Algorithms & Python Recommender Bridge)
// ==========================================

app.post("/api/trips/generate", (req, res) => {
  const { groupId } = req.body;
  if (!groupId) {
    return res.status(400).json({ message: "GroupId is required inside request payload." });
  }

  const parsedGroupId = parseInt(groupId);

  // 1. Fetch preferences for this specific Group ID
  const prefs = destinationPreferences.filter(p => p.groupId === parsedGroupId);
  if (prefs.length === 0) {
    return res.status(404).json({
      status: "EMPTY_PREF",
      message: "No preferences submitted by members for this group yet."
    });
  }

  // 2. Overlap Engine
  // Calculate common_start_date = MAX(all from_dates)
  // Calculate common_end_date = MIN(all to_dates)
  let commonStart = new Date(prefs[0].fromDate);
  let commonEnd = new Date(prefs[0].toDate);

  for (let i = 1; i < prefs.length; i++) {
    const fromDate = new Date(prefs[i].fromDate);
    const toDate = new Date(prefs[i].toDate);
    
    if (fromDate > commonStart) {
      commonStart = fromDate;
    }
    if (toDate < commonEnd) {
      commonEnd = toDate;
    }
  }

  // Check if overlapping dates are valid
  const dateOverlapValid = commonStart <= commonEnd;
  const commonStartDateStr = commonStart.toISOString().split('T')[0];
  const commonEndDateStr = commonEnd.toISOString().split('T')[0];

  if (!dateOverlapValid) {
    return res.status(422).json({
      status: "OVERLAP_ERROR",
      message: `Overlap Engine: Group preferences contain non-overlapping schedules (Suggested combined overlap ranges from ${commonStartDateStr} to ${commonEndDateStr}, which is invalid). Please align dates.`
    });
  }

  // 3. Priority Engine
  // Group metrics by destination_name and sum up priority score
  const scoreMap: Record<string, number> = {};
  const casePreservedNames: Record<string, string> = {};

  prefs.forEach(pref => {
    const rawDest = pref.destinationName.trim();
    const normalized = rawDest.toLowerCase();
    scoreMap[normalized] = (scoreMap[normalized] || 0) + pref.priorityScore;
    if (!casePreservedNames[normalized]) {
      casePreservedNames[normalized] = rawDest;
    }
  });

  // Find the highest prioritized destination name
  let winningNorm = "";
  let highestScore = -1;

  Object.entries(scoreMap).forEach(([normalized, score]) => {
    if (score > highestScore) {
      highestScore = score;
      winningNorm = normalized;
    } else if (score === highestScore) {
      // alphabetical tie-breaker
      if (normalized < winningNorm) {
        winningNorm = normalized;
      }
    }
  });

  const winningDestination = casePreservedNames[winningNorm];

  // 4. Python Bridge
  // Extract all compiled user list of submission destinations as parameters
  const proposedDestinations = Object.values(casePreservedNames);

  // Invoke the local python AI recommendation service
  const scriptPath = path.join(process.cwd(), "python-ai", "similarity.py");

  execFile("python3", [scriptPath, ...proposedDestinations], (err, stdout, stderr) => {
    let aiSuggestions = [];
    
    if (err) {
      console.error("Python Bridge encountered error:", err);
      console.error("stderr output of python script was:", stderr);
      // Fail-safe mock suggestions fallback in case of missing Python command or system execution error
      aiSuggestions = [
        { name: "Phuket", terrain: "beach", region: "south", budget: "low", similarity_score: 0.8 },
        { name: "Shimla", terrain: "hills", region: "north", budget: "medium", similarity_score: 0.75 },
        { name: "Kyoto", terrain: "heritage", region: "east", budget: "high", similarity_score: 0.7 }
      ];
    } else {
      try {
        aiSuggestions = JSON.parse(stdout.trim());
      } catch (parseErr) {
        console.error("Failed to parse output JSON from Python similarity engine:", parseErr);
        aiSuggestions = [];
      }
    }

    const compiledProposals = prefs.map(p => {
      const u = users.find(user => user.userId === p.userId);
      return {
        ...p,
        userName: u ? u.name : "Traveler"
      };
    });

    const responsePayload = {
      winningDestination,
      commonStartDate: commonStartDateStr,
      commonEndDate: commonEndDateStr,
      dateOverlapValid: true,
      userProposals: compiledProposals,
      aiSuggestions: aiSuggestions
    };

    // Save as historical search cache in our global registry
    generatedTrips.push({
      tripId: generatedTrips.length + 1,
      groupId: parsedGroupId,
      finalDestination: winningDestination,
      startDate: commonStartDateStr,
      endDate: commonEndDateStr,
      aiSuggestions
    });

    return res.json(responsePayload);
  });
});

// ==========================================
// 5. ASSET PIPELINE AND DEV SERVING SETUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development server leveraging integrated Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving of built assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Node Full-Stack Dev Server successfully started on http://localhost:${PORT}`);
  });
}

startServer();
