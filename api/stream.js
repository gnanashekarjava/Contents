import fs from "fs/promises";
import path from "path";

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "get.txt");
    const fileContent = await fs.readFile(filePath, "utf8");
    
    // Parse JSON array
    const channels = JSON.parse(fileContent.trim());
    
    if (!Array.isArray(channels) || channels.length === 0) {
      return res.status(500).json({ error: "No channels found in get.txt" });
    }

    // Get channel ID from query parameter (e.g., /api/stream?id=496)
    const { id } = req.query;
    
    if (id) {
      // Find specific channel by ID
      const channel = channels.find(ch => ch.id === id);
      
      if (!channel) {
        return res.status(404).json({ 
          error: `Channel ${id} not found`,
          available: channels.map(ch => ch.id)
        });
      }
      
      // Redirect to the specific channel's MPD URL
      return res.redirect(302, channel.mpd);
    } else {
      // No ID provided - return list of available channels
      return res.status(200).json({
        message: "Available channels",
        channels: channels.map(ch => ({
          id: ch.id,
          stream_url: `/api/stream?id=${ch.id}`
        }))
      });
    }
    
  } catch (error) {
    if (error.name === 'SyntaxError') {
      return res.status(500).json({ error: "Invalid JSON format in get.txt" });
    }
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
  }
