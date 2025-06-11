import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken } from '../middleware/auth.js';
import Delivery from '../models/Delivery.js';
import User from '../models/User.js';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Lassy AI Assistant endpoint
router.post('/lassy', authenticateToken, async (req, res) => {
  try {
    const { message, context = 'general' } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get user context
    const userRole = req.user.role;
    const userName = req.user.name;

    // Build context prompt based on user role and current page
    let systemPrompt = `You are Lassy, a helpful AI assistant for LuggEase delivery platform. 
    User: ${userName} (Role: ${userRole})
    Context: ${context}
    
    You can help with:
    - Booking new deliveries (customers)
    - Viewing delivery status and tracking
    - Managing delivery assignments (drivers)
    - Administrative tasks (admins)
    - General platform navigation
    
    Keep responses concise and helpful. If the user wants to perform actions, guide them through the process.
    For complex queries, break them down into simple steps.`;

    // Add role-specific context
    if (userRole === 'customer') {
      systemPrompt += `
      
      Customer-specific actions you can help with:
      - "Book a delivery" - Guide through creating new delivery
      - "Track my deliveries" - Show status of current deliveries
      - "My delivery history" - View past deliveries
      - "Cancel delivery" - Help cancel pending deliveries`;
    } else if (userRole === 'driver') {
      systemPrompt += `
      
      Driver-specific actions you can help with:
      - "Show available deliveries" - List unassigned deliveries
      - "My current deliveries" - Show assigned deliveries
      - "Update my location" - Help with location sharing
      - "Complete delivery" - Guide through delivery completion`;
    } else if (userRole === 'admin') {
      systemPrompt += `
      
      Admin-specific actions you can help with:
      - "Dashboard overview" - Show platform statistics
      - "Assign deliveries" - Help assign unassigned deliveries
      - "Manage users" - User management tasks
      - "System notifications" - Platform-wide announcements`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Hello! I'm Lassy, your LuggEase assistant. How can I help you today?" }] }
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiResponse = response.text();

    // Check if the message contains action commands
    const actionCommands = {
      'book delivery': { action: 'navigate', path: '/dashboard/new-delivery' },
      'new delivery': { action: 'navigate', path: '/dashboard/new-delivery' },
      'track deliveries': { action: 'navigate', path: '/dashboard/deliveries' },
      'my deliveries': { action: 'navigate', path: '/dashboard/deliveries' },
      'available deliveries': { action: 'navigate', path: '/dashboard/available' },
      'dashboard': { action: 'navigate', path: '/dashboard' },
      'logout': { action: 'logout' }
    };

    let suggestedAction = null;
    for (const [command, action] of Object.entries(actionCommands)) {
      if (message.toLowerCase().includes(command)) {
        suggestedAction = action;
        break;
      }
    }

    res.json({
      response: aiResponse,
      suggestedAction,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('AI Assistant error:', error);
    res.json({
      response: "I'm sorry, I'm having trouble connecting right now. Please try again or use the navigation menu to access what you need.",
      timestamp: new Date()
    });
  }
});

// Get contextual suggestions based on current page
router.get('/suggestions/:context', authenticateToken, async (req, res) => {
  try {
    const { context } = req.params;
    const userRole = req.user.role;

    let suggestions = [];

    switch (context) {
      case 'dashboard':
        if (userRole === 'customer') {
          suggestions = [
            "Book a new delivery",
            "Track my current deliveries",
            "View delivery history",
            "Update my profile"
          ];
        } else if (userRole === 'driver') {
          suggestions = [
            "Show available deliveries",
            "My current assignments",
            "Update my location",
            "View earnings"
          ];
        } else if (userRole === 'admin') {
          suggestions = [
            "Show dashboard overview",
            "Assign pending deliveries",
            "View all users",
            "System statistics"
          ];
        }
        break;
      
      case 'delivery':
        suggestions = [
          "What's my delivery status?",
          "Track delivery location",
          "Contact the driver",
          "Delivery instructions"
        ];
        break;
        
      default:
        suggestions = [
          "How can I help you?",
          "Navigate to dashboard",
          "Check notifications",
          "Account settings"
        ];
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;